# GenomeGuard v2 Validation Study — Multi-Population, Multi-Tool Benchmarking

## Goal
Conduct a **publication-grade** validation of GenomeGuard across **2,500+ individual genomes** from the 1000 Genomes Project (all populations except South Asian), benchmarking against **PharmCAT**, **Aldy**, and **PyPGx**. Generate a **standalone preprint** that is 10x more rigorous than v1. Results stored under `Versions/v2/`.

## Background
- **v1**: 601 South Asian samples, GenomeGuard vs PharmCAT only → 99.92% diplotype concordance
- **v2**: ~2,600 samples across 4 superpopulations (20 populations), 4 tools, full statistical analysis

### Tool Selection (4 tools — final)

| Tool | Why Selected | Input | Docker |
|------|-------------|-------|--------|
| **GenomeGuard** | Our tool — must validate | VCF | Native Python |
| **PharmCAT** | Gold-standard clinical PGx tool (CPIC/PharmGKB) | VCF | `pgkb/pharmcat:latest` |
| **Aldy** | Fastest star-allele caller, strong SV/CNV detection | VCF | `aldy/aldy` or pip |
| **PyPGx** | 80+ gene coverage, ML-based SV detection, published benchmarks | VCF | pip-installed |

> **Dropped**: Stargazer (BAM-only primary mode), Cyrius (CYP2D6-only, BAM-only), StellarPGx (CYP2D6-only). If Aldy or PyPGx prove unsolvable during execution, we'll swap in another VCF-compatible tool.

---

## Proposed Changes

### Directory Structure

```
Versions/v2/
├── run_validation_v2.py          # Master orchestrator (8 steps)
├── fetch_global_samples.py       # Step 1: Fetch all non-SAS samples
├── download_pgx_vcfs.py          # Step 2: Download & extract PGx VCFs  
├── run_genomeguard.py            # Step 3: Run GenomeGuard + profiling
├── run_pharmcat.py               # Step 4: Run PharmCAT via Docker
├── run_aldy.py                   # Step 5: Run Aldy
├── run_pypgx.py                  # Step 6: Run PyPGx
├── concordance.py                # Step 7: Multi-tool concordance + stats
├── performance_profiler.py       # Step 8a: Performance benchmarking
├── generate_preprint.py          # Step 8b: Standalone preprint (.docx)
├── report_template.md            # Jinja2 report template
├── requirements.txt
├── data/
│   ├── per_sample_vcfs/
│   ├── pharmcat_output/
│   ├── aldy_output/
│   └── pypgx_output/
└── results/
    ├── genomeguard_results.tsv + genomeguard_perf.tsv
    ├── pharmcat_results.tsv + pharmcat_perf.tsv
    ├── aldy_results.tsv + aldy_perf.tsv
    ├── pypgx_results.tsv + pypgx_perf.tsv
    ├── concordance_summary.json
    ├── concordance_by_population.json
    ├── concordance_by_superpopulation.json
    ├── pairwise_concordance.json
    ├── cohens_kappa.json
    ├── sensitivity_specificity.json
    ├── performance_benchmark.json
    ├── mismatches.tsv
    └── GenomeGuard_v2_Preprint.docx
```

---

### Step 1 — Fetch Global Samples

#### [NEW] fetch_global_samples.py

- Parse `igsr_samples.tsv` → extract all **non-SAS** samples with "1000 Genomes 30x on GRCh38" data
- Target populations (4 superpopulations, ~2,600 samples):
  - **AFR** (7 pops): YRI, LWK, GWD, MSL, ESN, ACB, ASW
  - **EUR** (5 pops): CEU, TSI, FIN, GBR, IBS
  - **EAS** (5 pops): CHB, JPT, CHS, CDX, KHV
  - **AMR** (4 pops): MXL, PUR, CLM, PEL
- Reuse identical PGx positions BED file from v1 (same 37 rsIDs across 16 Tier-1 genes)
- Output: sample lists, metadata TSVs, regions file, chromosomes JSON

---

### Step 2 — Download & Extract PGx VCFs

#### [NEW] download_pgx_vcfs.py

- Same streaming `bcftools` approach as v1 (Docker-based)
- Stream from 1000 Genomes NYGC 30x FTP → filter to non-SAS samples + PGx positions
- Merge per-chromosome VCFs → split into ~2,600 individual single-sample VCFs
- Each individual VCF: ~2-5 KB (pharmacogene positions only)
- **Total disk**: ~10 MB for per-sample VCFs + ~50 MB for intermediate files

---

### Step 3 — Run GenomeGuard (with profiling)

#### [NEW] run_genomeguard.py

- Same engine as v1 but with **per-sample profiling**:
  - `tracemalloc` for peak memory per sample
  - `time.perf_counter_ns()` for nanosecond-precision wall-clock
  - `resource.getrusage()` for CPU time (where available)
- Output: `genomeguard_results.tsv` + `genomeguard_perf.tsv`
- Perf columns: `sample_id, wall_time_ms, cpu_time_ms, peak_mem_kb, n_genes, n_variants`

---

### Step 4 — Run PharmCAT

#### [NEW] run_pharmcat.py

- Docker: `pgkb/pharmcat:latest` (same as v1)
- Per-sample wall-clock timing via Docker timestamps
- Parse `.match.json` + `.phenotype.json` → standardized TSV
- Output: `pharmcat_results.tsv` + `pharmcat_perf.tsv`

---

### Step 5 — Run Aldy

#### [NEW] run_aldy.py

- Install Aldy via pip in a virtualenv or Docker
- Per-gene calling: `aldy genotype -p illumina -g <GENE> <VCF>`
- Supported genes: CYP2D6, CYP2C19, CYP2C9, CYP3A4, CYP3A5, CYP2B6, DPYD, TPMT, UGT1A1, NUDT15
- Parse `.aldy` output → standardized TSV
- Output: `aldy_results.tsv` + `aldy_perf.tsv`

---

### Step 6 — Run PyPGx

#### [NEW] run_pypgx.py

- Install PyPGx via pip (`pip install pypgx`)
- CLI: `pypgx run-ngs-pipeline <GENE> --vcf <VCF>` or API-based calling
- Supports 80+ pharmacogenes including all our Tier-1 panel
- Parse output → standardized TSV
- Output: `pypgx_results.tsv` + `pypgx_perf.tsv`

---

### Step 7 — Multi-Tool Concordance & Statistical Analysis

#### [NEW] concordance.py

**This is where v2 is 10x better than v1.** Full research-grade statistical analysis:

| Analysis | v1 | v2 |
|----------|----|----|
| **Tools compared** | 2 (GG vs PharmCAT) | 4 (all pairwise: 6 pairs) |
| **Populations** | 5 (SAS only) | 21 (all 1000G populations) |
| **Concordance** | Simple % match | % match + **Cohen's κ** per gene per pair |
| **Error analysis** | Basic triage | **Sensitivity, specificity, PPV, NPV, F1** per gene |
| **Statistical tests** | None | **McNemar's test** for significance of tool differences |
| **Confusion matrices** | None | Per-gene confusion matrices (ref/non-ref calling) |
| **Allele frequency validation** | None | Observed vs. expected allele frequencies per population |
| **Cross-population consistency** | Basic table | **Cochran's Q test** for population-invariant performance |

Outputs:
- `concordance_summary.json` — per-gene, per-tool-pair concordance
- `pairwise_concordance.json` — all 6 pairwise comparisons
- `cohens_kappa.json` — inter-rater reliability per gene per pair
- `sensitivity_specificity.json` — per-gene detection metrics
- `concordance_by_population.json` — 21-population breakdown
- `concordance_by_superpopulation.json` — 4-superpopulation summary
- `allele_frequencies.json` — observed frequencies vs. literature
- `mismatches.tsv` — full mismatch detail with triage

---

### Step 8 — Performance Benchmarking & Preprint Generation

#### [NEW] performance_profiler.py

Aggregates per-sample timing/memory from Steps 3-6:

| Metric | Description |
|--------|-------------|
| **Throughput** | samples/sec, genes/sec per tool |
| **Latency** | mean, median, P95, P99 per-sample time |
| **Memory** | peak RSS, mean per-sample memory footprint |
| **Speedup** | GenomeGuard speedup factor vs each tool |
| **Scalability** | time-vs-sample-count regression |

Output: `performance_benchmark.json`

#### [NEW] generate_preprint.py

**Standalone publication-quality preprint** (10x better than v1):

**Structure** (following bioRxiv/PLOS ONE conventions):
1. **Title Page** — Title, authors, affiliations, correspondence
2. **Abstract** — Structured (Background, Methods, Results, Conclusions)
3. **Introduction** — PGx landscape, tool comparison motivation, gap analysis
4. **Methods**
   - 2.1 Dataset (1000 Genomes NYGC 30x, sample selection criteria)
   - 2.2 Pharmacogenomic Variant Panel (37 positions, 16 Tier-1 genes)
   - 2.3 Tool Descriptions (GenomeGuard, PharmCAT, Aldy, PyPGx)
   - 2.4 Concordance Analysis (Cohen's κ, sensitivity/specificity methodology)
   - 2.5 Performance Benchmarking (hardware specs, measurement methodology)
   - 2.6 Statistical Analysis (McNemar's, Cochran's Q, confidence intervals)
5. **Results**
   - 3.1 Dataset Characteristics (Table 1: population breakdown)
   - 3.2 Overall Concordance (Table 2: pairwise concordance matrix)
   - 3.3 Per-Gene Performance (Table 3: gene × tool concordance with κ)
   - 3.4 Cross-Population Analysis (Table 4: superpopulation concordance)
   - 3.5 Error Analysis (Table 5: mismatch triage, confusion matrices)
   - 3.6 Allele Frequency Validation (Table 6: observed vs. expected)
   - 3.7 Computational Performance (Table 7: throughput, latency, memory)
6. **Discussion** — Clinical implications, limitations, future work
7. **Conclusions**
8. **References**
9. **Supplementary Tables** (per-population detail, all mismatches)

Output: `GenomeGuard_v2_Preprint.docx` + `GenomeGuard_v2_Preprint.md`

---

### Master Orchestrator

#### [NEW] run_validation_v2.py

```
python run_validation_v2.py           # All 8 steps
python run_validation_v2.py 1 3       # Steps 1-3 only
python run_validation_v2.py --pilot   # 20-sample smoke test
```

8 steps, fully idempotent, progress logging with ETAs.

---

## Verification Plan

### Automated Tests
- `python run_validation_v2.py --pilot` — 20-sample smoke test (5 per superpop)
- Verify all output files generated and non-empty
- Verify concordance JSON schema correctness
- Verify preprint .docx opens and contains all tables

### Manual Verification
- Compare v2 concordance against v1 baseline
- Review mismatch triage for systematic issues
- Verify preprint formatting and completeness
