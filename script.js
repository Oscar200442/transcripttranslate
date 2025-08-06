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
    const response = await fetch('https://your-transcripttranslate-server.vercel.app/transcripts', { // Replace with your Vercel URL
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls: youtubeLinks })
    });
    const transcripts = await response.json();
    let allTranscripts = '';

    for (const [url, transcript] of Object.entries(transcripts)) {
      allTranscripts += `Transcript for ${url}:\n${transcript}\n\n`;
    }

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
    console.error('Detailed error:', error);
  }
}
