import uuid
import threading
import time
import os
import traceback
from datetime import datetime, timezone
from database import db
from parser import parse_vcf, parse_vcf_bytes
from streaming_parser import parse_vcf_streaming
from pgx_knowledgebase import KNOWN_GENES, RSID_TO_ALLELE, RSID_GRCH38
from analyzer import analyze

_TARGET_RSIDS: set[str] = set(RSID_TO_ALLELE.keys())
_TARGET_GENES: set[str] = {g.upper() for g in KNOWN_GENES}
_TARGET_POSITIONS: set[tuple[str, int]] = set(RSID_GRCH38.values())
_STREAMING_THRESHOLD = 50 * 1024 * 1024  # 50 MB

def create_job() -> str:
    job_id = str(uuid.uuid4())
    doc = {
        "_id": job_id,
        "status": "pending",
        "progress": 0,
        "created_at": datetime.now(timezone.utc),
        "result": None,
        "error": None
    }
    db.analysis_jobs.insert_one(doc)
    return job_id

def get_job_status(job_id: str):
    return db.analysis_jobs.find_one({"_id": job_id})

def _background_analysis_task(job_id: str, tmp_path: str, filename: str, suffix: str, drugs: list, sample: str):
    """
    The background thread function that parses the VCF and runs the analysis.
    """
    try:
        db.analysis_jobs.update_one(
            {"_id": job_id},
            {"$set": {"status": "processing", "progress": 10}}
        )

        file_size = os.path.getsize(tmp_path)
        t_parse_start = time.perf_counter()

        # Hybrid parsing: streaming for large files, full parser for small files
        if file_size > _STREAMING_THRESHOLD:
            print(f"[Job {job_id}] Large file ({file_size / 1024 / 1024:.1f} MB) — using streaming parser")
            vcf = parse_vcf_streaming(
                tmp_path,
                target_rsids=_TARGET_RSIDS,
                target_genes=_TARGET_GENES,
                target_positions=_TARGET_POSITIONS,
            )
        elif suffix != ".vcf":
            # Compressed small file
            vcf = parse_vcf(tmp_path)
        else:
            # Small plain-text file — fast path
            with open(tmp_path, "rb") as f:
                file_data = f.read()
            vcf = parse_vcf_bytes(file_data, filename=filename)

        t_parse_end = time.perf_counter()
        parse_time_ms = (t_parse_end - t_parse_start) * 1000

        db.analysis_jobs.update_one(
            {"_id": job_id},
            {"$set": {"progress": 70}}
        )

        # Run analysis
        analysis_result = analyze(vcf, drugs, sample=sample)

        final_json = analysis_result.to_dict()
        final_json["_parse_time_ms"] = parse_time_ms

        db.analysis_jobs.update_one(
            {"_id": job_id},
            {"$set": {
                "status": "completed",
                "progress": 100,
                "result": final_json
            }}
        )
        print(f"[Job {job_id}] Completed successfully.")

    except Exception as e:
        traceback.print_exc()
        db.analysis_jobs.update_one(
            {"_id": job_id},
            {"$set": {
                "status": "failed",
                "error": str(e)
            }}
        )
    finally:
        # Cleanup temporary file
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.unlink(tmp_path)
            except OSError:
                pass

def start_analysis_job(tmp_path: str, filename: str, suffix: str, drugs: list, sample: str) -> str:
    """
    Creates a job and starts the background processing thread.
    Returns the job_id.
    """
    job_id = create_job()
    thread = threading.Thread(
        target=_background_analysis_task,
        args=(job_id, tmp_path, filename, suffix, drugs, sample)
    )
    thread.daemon = True
    thread.start()
    return job_id
