#!/bin/bash
for f in /input/*.vcf.gz; do
  if [ -f "$f" ]; then
    echo "Compressing $f"
    mv "$f" "${f%.gz}.bgz"
    tabix -p vcf "${f%.gz}.bgz"
  fi
done
