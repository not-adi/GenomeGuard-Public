"""Convert the preprint DOCX to PDF using docx2pdf."""
from docx2pdf import convert
from pathlib import Path

RESULTS = Path(__file__).resolve().parent / "results"
docx_path = RESULTS / "GenomeGuard_Preprint_bioRxiv.docx"
pdf_path = RESULTS / "GenomeGuard_Preprint_bioRxiv.pdf"

print(f"Converting {docx_path.name} to PDF...")
convert(str(docx_path), str(pdf_path))
print(f"Done! Saved to: {pdf_path}")
