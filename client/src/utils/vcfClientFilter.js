/**
 * Client-Side VCF Streaming Filter
 * ==================================
 * Reads a VCF file in the browser using the Streams API,
 * filters it down to only pharmacogenomically relevant variants,
 * and returns a tiny Blob for instant upload.
 *
 * A 6 GB VCF with ~30M lines → ~50 KB filtered VCF in ~25 seconds.
 * Zero network usage during filtering — all local.
 *
 * Supports:
 *  - Plain .vcf files
 *  - Compressed .vcf.gz / .vcf.bgz (via DecompressionStream)
 */

/**
 * Check if the ID column matches any target rsID.
 * Handles compound IDs like "rs123;rs456".
 */
function matchesRsid(idCol, rsidSet) {
  if (idCol === "." || !idCol) return false;
  if (idCol.includes(";")) {
    return idCol.split(";").some((part) => rsidSet.has(part));
  }
  return rsidSet.has(idCol);
}

/**
 * Check if the INFO column contains a GENE= tag matching a target gene.
 */
function matchesGene(infoCol, geneSet) {
  if (!infoCol) return false;
  // Quick check before expensive splitting
  if (!infoCol.includes("GENE=") && !infoCol.includes("PX=")) return false;

  const tokens = infoCol.split(";");
  for (const token of tokens) {
    if (token.startsWith("GENE=") || token.startsWith("PX=")) {
      const val = token.split("=", 2)[1];
      if (val && geneSet.has(val.toUpperCase())) return true;
    }
  }
  return false;
}

/**
 * Stream-filter a VCF file in the browser.
 *
 * @param {File} file - The VCF file to filter.
 * @param {Set<string>} rsidSet - Set of target rsIDs (e.g. {"rs4244285", ...}).
 * @param {Set<string>} geneSet - Set of target gene names, UPPERCASED.
 * @param {(progress: number) => void} onProgress - Callback with 0-100 progress.
 * @returns {Promise<{ blob: Blob, stats: { totalLines: number, matchedLines: number, headerLines: number } }>}
 */
export async function filterVCFInBrowser(file, rsidSet, geneSet, onProgress) {
  const isCompressed =
    file.name.toLowerCase().endsWith(".gz") ||
    file.name.toLowerCase().endsWith(".bgz");

  let readableStream = file.stream();

  // Decompress if needed
  if (isCompressed) {
    if (typeof DecompressionStream === "undefined") {
      // Browser doesn't support DecompressionStream — signal fallback
      return null;
    }
    readableStream = readableStream.pipeThrough(
      new DecompressionStream("gzip")
    );
  }

  // Decode bytes to text
  const textStream = readableStream.pipeThrough(new TextDecoderStream("utf-8"));
  const reader = textStream.getReader();

  const keptLines = [];
  let partialLine = "";
  let totalLines = 0;
  let matchedLines = 0;
  let headerLines = 0;
  let bytesProcessed = 0;
  const totalBytes = file.size;
  let lastProgressReport = 0;

  // Estimate decompression ratio for compressed files (typically ~5-10x)
  const compressionRatio = isCompressed ? 7 : 1;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Track progress
      // For compressed files, estimate based on decompressed bytes
      bytesProcessed += value.length;
      const estimatedRawProgress = isCompressed
        ? Math.min((bytesProcessed / (totalBytes * compressionRatio)) * 100, 99)
        : Math.min((bytesProcessed / totalBytes) * 100, 99);

      // Throttle progress updates to avoid UI thrashing
      const now = Date.now();
      if (now - lastProgressReport > 200) {
        onProgress(Math.round(estimatedRawProgress));
        lastProgressReport = now;
      }

      // Split into lines
      const text = partialLine + value;
      const lines = text.split("\n");

      // Last element may be incomplete — save for next iteration
      partialLine = lines.pop() || "";

      for (const line of lines) {
        if (!line) continue;

        // Keep all header/meta lines
        if (line.startsWith("#")) {
          keptLines.push(line);
          headerLines++;
          continue;
        }

        totalLines++;

        // Fast tab-split: we only need columns 2 (ID) and 7 (INFO)
        // Find the 3rd column (ID) quickly
        const firstTab = line.indexOf("\t");
        if (firstTab === -1) continue;
        const secondTab = line.indexOf("\t", firstTab + 1);
        if (secondTab === -1) continue;
        const thirdTab = line.indexOf("\t", secondTab + 1);
        if (thirdTab === -1) continue;

        const idCol = line.substring(secondTab + 1, thirdTab);

        // Check rsID match in ID column (most common match path)
        if (matchesRsid(idCol, rsidSet)) {
          keptLines.push(line);
          matchedLines++;
          continue;
        }

        // Check gene match AND rsIDs inside INFO column (requires finding INFO column = col 7)
        // Find tabs 4,5,6,7 to get to INFO
        let tabPos = thirdTab;
        for (let t = 0; t < 4; t++) {
          tabPos = line.indexOf("\t", tabPos + 1);
          if (tabPos === -1) break;
        }
        if (tabPos !== -1) {
          const nextTab = line.indexOf("\t", tabPos + 1);
          const infoCol =
            nextTab === -1
              ? line.substring(tabPos + 1)
              : line.substring(tabPos + 1, nextTab);

          if (matchesGene(infoCol, geneSet)) {
            keptLines.push(line);
            matchedLines++;
            continue;
          }

          // Scan INFO for rsIDs embedded in tags like dbSNP139.ID=rs123 or RS=rs123
          if (infoCol.includes("rs")) {
            const tokens = infoCol.split(";");
            let foundRsid = false;
            for (const token of tokens) {
              const eqIdx = token.indexOf("=");
              if (eqIdx !== -1) {
                const val = token.substring(eqIdx + 1);
                if (val.startsWith("rs") && rsidSet.has(val)) {
                  foundRsid = true;
                  break;
                }
              }
            }
            if (foundRsid) {
              keptLines.push(line);
              matchedLines++;
            }
          }
        }
      }
    }

    // Process any remaining partial line
    if (partialLine.trim()) {
      if (partialLine.startsWith("#")) {
        keptLines.push(partialLine);
        headerLines++;
      } else {
        totalLines++;
        const firstTab = partialLine.indexOf("\t");
        const secondTab =
          firstTab !== -1 ? partialLine.indexOf("\t", firstTab + 1) : -1;
        const thirdTab =
          secondTab !== -1 ? partialLine.indexOf("\t", secondTab + 1) : -1;

        if (thirdTab !== -1) {
          const idCol = partialLine.substring(secondTab + 1, thirdTab);
          if (matchesRsid(idCol, rsidSet)) {
            keptLines.push(partialLine);
            matchedLines++;
          }
        }
      }
    }

    onProgress(100);

    const filteredText = keptLines.join("\n") + "\n";
    const blob = new Blob([filteredText], { type: "text/plain" });

    return {
      blob,
      stats: {
        totalLines,
        matchedLines,
        headerLines,
        filteredSizeKB: (blob.size / 1024).toFixed(1),
        originalSizeMB: (file.size / 1024 / 1024).toFixed(1),
      },
    };
  } finally {
    reader.releaseLock();
  }
}
