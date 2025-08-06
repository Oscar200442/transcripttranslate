async function downloadTranscripts() {
  const youtubeLinks = document.getElementById('youtubeLinks').value.split(',').map(url => url.trim());
  const transcriptOutput = document.getElementById('transcriptOutput');
  const downloadLink = document.getElementById('downloadLink');
  const errorDiv = document.getElementById('error');

  // Reset outputs
  transcriptOutput.value = 'Fetching transcripts...';
  if (downloadLink.href) {
    URL.revokeObjectURL(downloadLink.href); // Prevent memory leaks
  }
  downloadLink.style.display = 'none';
  errorDiv.style.display = 'none';
  errorDiv.textContent = '';

  // Validate YouTube URLs
  const isValidYouTubeUrl = (url) => {
    const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|embed\/|v\/|.+\?v=)?([^&=?\s]{11})/;
    return regex.test(url);
  };

  if (!youtubeLinks || youtubeLinks[0] === '') {
    errorDiv.textContent = 'Please enter at least one YouTube URL.';
    errorDiv.style.display = 'block';
    transcriptOutput.value = '';
    return;
  }

  if (!youtubeLinks.every(isValidYouTubeUrl)) {
    errorDiv.textContent = 'One or more URLs are not valid YouTube URLs.';
    errorDiv.style.display = 'block';
    transcriptOutput.value = '';
    return;
  }

  try {
    const response = await fetch('https://your-transcripttranslate-server.vercel.app/transcripts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls: youtubeLinks }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`HTTP error! Status: ${response.status}, Details: ${JSON.stringify(errorData)}`);
    }

    const transcripts = await response.json();
    let allTranscripts = '';

    for (const [url, transcript] of Object.entries(transcripts)) {
      allTranscripts += `Transcript for ${url}:\n${transcript || 'No transcript available'}\n\n`;
    }

    if (!allTranscripts.trim()) {
      errorDiv.textContent = 'No transcripts were retrieved for the provided URLs.';
      errorDiv.style.display = 'block';
      transcriptOutput.value = '';
      return;
    }

    transcriptOutput.value = allTranscripts;

    // Create downloadable file
    const blob = new Blob([allTranscripts], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    downloadLink.href = url;
    downloadLink.download = 'transcripts.txt';
    downloadLink.style.display = 'block';
  } catch (error) {
    errorDiv.textContent = `Error fetching transcripts: ${error.message}`;
    errorDiv.style.display = 'block';
    transcriptOutput.value = '';
    downloadLink.style.display = 'none';
    console.error('Detailed error:', error);
  }
}
