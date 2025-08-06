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

      // Fetch captions
      const captionsResponse = await fetch(`https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=${apiKey}`);
      const captionsData = await captionsResponse.json();

      if (!captionsData.items || captionsData.items.length === 0) {
        allTranscripts += `No captions available for video: ${link}\n\n`;
        continue;
      }

      // Get the first available caption track
      const captionId = captionsData.items[0].id;
      const captionResponse = await fetch(`https://www.googleapis.com/youtube/v3/captions/${captionId}?tfmt=srt&key=${apiKey}`);
      const captionText = await captionResponse.text();

      allTranscripts += `Transcript for ${link}:\n${captionText}\n\n`;
    }

    // Display transcripts
    transcriptOutput.value = allTranscripts;

    // Create downloadable file
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