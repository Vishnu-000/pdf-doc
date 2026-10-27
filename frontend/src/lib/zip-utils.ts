import JSZip from 'jszip';

export interface ZipEntry {
  filename: string;
  content: Blob | Uint8Array | ArrayBuffer | string;
}

/**
 * Creates a ZIP file containing the specified entries and returns it as a Blob.
 */
export async function createZipArchive(
  entries: ZipEntry[],
  onProgress?: (percent: number) => void
): Promise<Blob> {
  const zip = new JSZip();

  for (const entry of entries) {
    zip.file(entry.filename, entry.content);
  }

  const blob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      if (onProgress) {
        onProgress(Math.round(metadata.percent));
      }
    }
  );

  return blob;
}
