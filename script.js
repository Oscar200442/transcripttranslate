async function downloadTranscripts() {
  const youtubeLinks = document.getElementById('youtubeLinks').value.split(',').map(url => url.trim());
  const transcriptOutput = document.getElementById('transcriptOutput');
  const downloadLink = document.getElementById('downloadLink');
  const errorDiv = document.getElementById('error');

  // Reset outputs
  transcriptOutput.value = 'Fetching transcripts...';
  downloadLink.style.display = 'none';
  errorDiv.style.display = 'none';
  errorDiv.textContent = '';

  if (!youtubeLinks || youtubeLinks[0] === '') {
    errorDiv.textContent = 'Please enter at least one YouTube URL';
    errorDiv.style.display = 'block';
    transcriptOutput.value = '';
    return;
  }

  try {
    const apiKey = 'AIzaSyDtM9aWelpvjtUHZDCIoqVjtNLMYYP8gYs'; // Your YouTube Data API key
    let allTranscripts = '';

    for (const link of youtubeLinks) {
      // Extract video ID
      const videoIdMatch = link.match(/(?:v=)([^&]+)/);
      if (!videoIdMatch) {
        allTranscripts += `Invalid URL: ${link}\n\n`;
        continue;
      }
      const videoId = videoIdMatch[1];

      // Fetch captions list
      const captionsResponse = await fetch(`https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=${apiKey}`);
      const captionsData = await captionsResponse.json();

      if (!captionsData.items || captionsData.items.length === 0) {
        allTranscripts += `No captions available for video: ${link}\n\n`;
        continue;
      }

      // Note: Direct SRT download requires OAuth, so we skip that
      allTranscripts += `Transcript for ${link}:\n`;
      captionsData.items.forEach(item => {
        allTranscripts += `  Language: ${item.snippet.language}, Name: ${item.snippet.name}\n`;
        // If auto-generated captions are available, we could fetch metadata, but content requires OAuth
      });
      allTranscripts += '\n';
    }

    // Display transcripts (metadata only, as content download is restricted)
    transcriptOutput.value = allTranscripts || 'No downloadable transcript content available due to API restrictions. Metadata shown instead.';

    // Create downloadable file with metadata
    const blob = new Blob([allTranscripts], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    downloadLink.href = url;
    downloadLink.style.display = 'block';
  } catch (error) {
    errorDiv.textContent = 'Error fetching transcripts: ' + error.message;
    errorDiv.style.display = 'block';
    transcriptOutput.value = '';
    downloadLink.style.display = 'none';
  }
}
