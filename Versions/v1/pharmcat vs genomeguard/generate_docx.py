import pypandoc
import os

print("Downloading pandoc...")
pypandoc.download_pandoc()
print("Converting markdown to docx...")
pypandoc.convert_file('results/validation_report.md', 'docx', outputfile='results/Validation_Report_GenomeGuard_v2.docx')
print("Done!")
