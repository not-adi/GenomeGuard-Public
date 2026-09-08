"""
Step 2: Download PGx-relevant VCF slices from 1000 Genomes via Docker bcftools
================================================================================
For each chromosome that contains PGx positions, uses bcftools (via Docker) to:
1. Stream the multi-sample 30x VCF from the 1000 Genomes HTTP mirror
2. Filter to SAS samples only
3. Extract only PGx positions
4. Split into per-sample single-sample VCFs (required by PharmCAT)
"""

from __future__ import annotations
import json
import os
import subprocess
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
DATA_DIR = SCRIPT_DIR / "data"
PER_SAMPLE_DIR = DATA_DIR / "per_sample_vcfs"

# 1000 Genomes 30x high-coverage VCF base URL (NYGC / EBI mirror)
# Format: chr{N}.filtered.*.vcf.gz
_1KG_BASE = (
    "https://ftp.1000genomes.ebi.ac.uk/vol1/ftp/data_collections/"
    "1000G_2504_high_coverage/working/20220422_3202_phased_SNV_INDEL_SV/"
)

def _vcf_url(chrom: str) -> str:
    """Build the URL for a 1000 Genomes per-chromosome VCF."""
    # The files follow the naming: 1kGP_high_coverage_Illumina.{chr}.filtered.SNV_INDEL_SV_phased_panel.vcf.gz
    c = chrom.replace("chr", "")
    return (
        f"{_1KG_BASE}"
        f"1kGP_high_coverage_Illumina.{chrom}.filtered.SNV_INDEL_SV_phased_panel.vcf.gz"
    )


def _run_docker_bcftools(args: list, cwd: str = None, timeout: int = 600) -> subprocess.CompletedProcess:
    """Run bcftools inside Docker with the data directory mounted."""
    data_mount = str(DATA_DIR).replace("\\", "/")
    cmd = [
        "docker", "run", "--rm",
        "-v", f"{data_mount}:/data",
        "biocontainers/bcftools:v1.9-1-deb_cv1",
        "bcftools",
    ] + args
    print(f"  $ {' '.join(cmd[:6])}... bcftools {' '.join(args[:4])}...")
    return subprocess.run(cmd, capture_output=True, text=True, timeout=timeout, cwd=cwd)


def download_and_extract(
    chrom: str,
    samples_file: str,
    regions_file: str,
    output_vcf: str,
    timeout: int = 900,
) -> bool:
    """
    Use bcftools to stream-filter a remote 1000 Genomes VCF to only
    SAS samples and PGx positions for one chromosome.
    """
    url = _vcf_url(chrom)
    print(f"\n  Extracting {chrom} from remote VCF...")
    print(f"    URL: {url}")

    # bcftools view -S samples.txt -R regions.bed -Oz -o output.vcf.gz <url>
    # But since we're in Docker, we pass the URL directly and mount local files
    # We need to handle this carefully — bcftools can read remote URLs directly

    data_mount = str(DATA_DIR).replace("\\", "/")
    cmd = [
        "docker", "run", "--rm",
        "-v", f"{data_mount}:/data",
        "biocontainers/bcftools:v1.9-1-deb_cv1",
        "bcftools", "view",
        "--samples-file", f"/data/{samples_file}",
        "--regions-file", f"/data/{regions_file}",
        "--output-type", "z",
        "--output-file", f"/data/{output_vcf}",
        url,
    ]

    print(f"    Running bcftools view (this may take several minutes for large chromosomes)...")
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        if result.returncode != 0:
            print(f"    ⚠ bcftools returned {result.returncode}: {result.stderr[:500]}")
            return False
        print(f"    ✓ Extracted → /data/{output_vcf}")
        return True
    except subprocess.TimeoutExpired:
        print(f"    ⚠ Timeout after {timeout}s for {chrom}")
        return False
    except Exception as e:
        print(f"    ⚠ Error: {e}")
        return False


def merge_chromosome_vcfs(chrom_vcfs: list, output: str) -> bool:
    """Merge per-chromosome PGx VCFs into a single file."""
    if len(chrom_vcfs) == 0:
        return False

    if len(chrom_vcfs) == 1:
        # Just copy
        src = DATA_DIR / chrom_vcfs[0]
        dst = DATA_DIR / output
        import shutil
        shutil.copy2(src, dst)
        return True

    # bcftools concat
    input_args = []
    for vcf in chrom_vcfs:
        input_args.append(f"/data/{vcf}")

    data_mount = str(DATA_DIR).replace("\\", "/")
    cmd = [
        "docker", "run", "--rm",
        "-v", f"{data_mount}:/data",
        "biocontainers/bcftools:v1.9-1-deb_cv1",
        "bcftools", "concat",
        "--output-type", "z",
        "--output", f"/data/{output}",
    ] + input_args

    result = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
    return result.returncode == 0


def split_to_single_sample(merged_vcf: str) -> int:
    """Split a multi-sample VCF into individual single-sample VCFs."""
    PER_SAMPLE_DIR.mkdir(parents=True, exist_ok=True)

    # First, get the sample list from the VCF
    data_mount = str(DATA_DIR).replace("\\", "/")
    cmd = [
        "docker", "run", "--rm",
        "-v", f"{data_mount}:/data",
        "biocontainers/bcftools:v1.9-1-deb_cv1",
        "bcftools", "query", "-l", f"/data/{merged_vcf}",
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    if result.returncode != 0:
        print(f"  ⚠ Failed to list samples: {result.stderr}")
        return 0

    samples = [s.strip() for s in result.stdout.strip().split("\n") if s.strip()]
    print(f"  Splitting {len(samples)} samples into individual VCFs...")

    # Mount per_sample_vcfs too
    per_sample_mount = str(PER_SAMPLE_DIR).replace("\\", "/")

    count = 0
    for i, sample in enumerate(samples):
        out_name = f"{sample}.vcf"
        cmd = [
            "docker", "run", "--rm",
            "-v", f"{data_mount}:/data",
            "-v", f"{per_sample_mount}:/out",
            "biocontainers/bcftools:v1.9-1-deb_cv1",
            "bcftools", "view",
            "--samples", sample,
            "--output-type", "v",
            "--output-file", f"/out/{out_name}",
            f"/data/{merged_vcf}",
        ]
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        if r.returncode == 0:
            count += 1
        if (i + 1) % 50 == 0:
            print(f"    Processed {i+1}/{len(samples)} samples...")

    print(f"  ✓ Split into {count} single-sample VCFs")
    return count


def run() -> dict:
    """Execute Step 2."""
    print("\n═══ Step 2: Download & Extract PGx VCFs from 1000 Genomes ═══\n")

    DATA_DIR.mkdir(parents=True, exist_ok=True)

    # Load chromosome list from Step 1
    chroms_file = DATA_DIR / "chromosomes_needed.json"
    if not chroms_file.exists():
        print("  ⚠ Run Step 1 first (fetch_1kg_samples.py)")
        return {}

    with open(chroms_file) as f:
        chroms = json.load(f)

    print(f"  Chromosomes to extract: {chroms}")

    # Extract PGx positions per chromosome
    chrom_vcfs = []
    for chrom in chroms:
        out_name = f"sas_pgx_{chrom}.vcf.gz"
        if (DATA_DIR / out_name).exists():
            print(f"  ⏭ {out_name} already exists, skipping")
            chrom_vcfs.append(out_name)
            continue

        ok = download_and_extract(
            chrom=chrom,
            samples_file="sas_samples.txt",
            regions_file="pgx_positions.bed",
            output_vcf=out_name,
        )
        if ok:
            chrom_vcfs.append(out_name)

    # Merge all chromosome VCFs
    merged = "sas_pgx_merged.vcf.gz"
    if not (DATA_DIR / merged).exists():
        print(f"\n  Merging {len(chrom_vcfs)} chromosome VCFs...")
        if merge_chromosome_vcfs(chrom_vcfs, merged):
            print(f"  ✓ Merged → {merged}")
        else:
            print(f"  ⚠ Merge failed. Using individual chromosome files.")
    else:
        print(f"  ⏭ {merged} already exists, skipping merge")

    # Sort and Index the merged VCF
    data_mount = str(DATA_DIR).replace("\\", "/")
    print(f"  Sorting the merged VCF to ensure coordinate order...")
    sort_cmd = [
        "docker", "run", "--rm",
        "-v", f"{data_mount}:/data",
        "biocontainers/bcftools:v1.9-1-deb_cv1",
        "bcftools", "sort", "-O", "z", "-o", f"/data/sorted_{merged}", f"/data/{merged}",
    ]
    subprocess.run(sort_cmd, capture_output=True, text=True, timeout=600)
    
    import shutil
    shutil.move(DATA_DIR / f"sorted_{merged}", DATA_DIR / merged)

    idx_cmd = [
        "docker", "run", "--rm",
        "-v", f"{data_mount}:/data",
        "biocontainers/bcftools:v1.9-1-deb_cv1",
        "bcftools", "index", "-t", f"/data/{merged}",
    ]
    subprocess.run(idx_cmd, capture_output=True, text=True, timeout=120)

    # Split into single-sample VCFs
    n_split = split_to_single_sample(merged)

    summary = {
        "chromosomes_extracted": len(chrom_vcfs),
        "samples_split": n_split,
    }
    with open(DATA_DIR / "step2_summary.json", "w") as f:
        json.dump(summary, f, indent=2)

    print(f"\n  ✓ Step 2 complete. {n_split} single-sample VCFs ready.\n")
    return summary


if __name__ == "__main__":
    run()
