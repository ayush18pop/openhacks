/**
 * Downloads a certificate as a PNG file
 * @param eventId - The ID of the event to download the certificate for
 * @throws {Error} If there's an error generating or downloading the certificate
 */
export async function downloadCertificate(eventId: string) {
  try {
    // Fetch the SVG data from the API
    const response = await fetch(`/api/events/${eventId}/certificate`);
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch certificate: ${error}`);
    }
    
    // Read body as text; try to parse JSON first, else treat as SVG
    const bodyText = await response.text();
    let svgContent = bodyText;
    let filename = `certificate-${eventId}.svg`;
    try {
      const parsed = JSON.parse(bodyText);
      if (parsed && typeof parsed.svg === 'string') {
        svgContent = parsed.svg;
        if (typeof parsed.filename === 'string' && parsed.filename.trim()) {
          filename = parsed.filename;
        }
      }
    } catch {
      // not JSON; keep svgContent as-is
    }
    
    // Create a temporary SVG blob
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    // Create a temporary link element to trigger the download
    const link = document.createElement('a');
    link.href = svgUrl;
  link.download = filename;
    
    // Append to body, trigger download, and clean up
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the object URL
    setTimeout(() => {
      URL.revokeObjectURL(svgUrl);
    }, 100);
    
  } catch (error) {
    console.error('Error downloading certificate:', error);
    throw error;
  }
}
