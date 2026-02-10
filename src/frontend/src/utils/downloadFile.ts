export function downloadFile(
  content: Uint8Array | string,
  filename: string,
  mimeType?: string
): void {
  let blob: Blob;
  
  if (typeof content === 'string') {
    // CSV or text content
    blob = new Blob([content], { type: mimeType || 'text/csv;charset=utf-8;' });
  } else {
    // Binary content (PDF, ZIP, Excel) - create a new Uint8Array to ensure compatibility
    const uint8Array = new Uint8Array(content);
    blob = new Blob([uint8Array], { type: mimeType || 'application/octet-stream' });
  }
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
