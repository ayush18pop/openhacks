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
    
    // Get the SVG content from the response
    const svgContent = await response.text();
    
    // Create a temporary SVG blob
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    // Create a temporary link element to trigger the download
    const link = document.createElement('a');
    link.href = svgUrl;
    link.download = `certificate-${eventId}.svg`;
    
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
