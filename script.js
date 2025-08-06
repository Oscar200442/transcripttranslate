async function fetchTranscript() {
  const videoUrl = document.getElementById('videoUrl').value;
  const videoId = extractVideoId(videoUrl);
  const errorDiv = document.getElementById('error');
  const transcriptOutput = document.getElementById('transcriptOutput');
  const transcriptText = document.getElementById('transcriptText');

  if (!videoId) {
    errorDiv.textContent = 'Invalid YouTube URL. Please try again.';
    errorDiv.classList.remove('hidden');
    transcriptOutput.classList.add('hidden');
    return;
  }

  errorDiv.classList.add('hidden');
  transcriptText.textContent = 'Fetching transcript...';
  transcriptOutput.classList.remove('hidden');

  try {
    // Replace 'YOUR_API_KEY' with your actual YouTube Data API key
    const response = await fetch(`https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=YOUR_API_KEY`);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      transcriptText.textContent = 'No transcript available for this video.';
      return;
    }

    const captionId = data.items[0].id;
    const captionResponse = await fetch(`https://www.googleapis.com/youtube/v3/captions/${captionId}?tfmt=srt&key=YOUR_API_KEY`);
    const captionData = await captionResponse.text();
    transcriptText.textContent = captionData;
  } catch (error) {
    transcriptText.textContent = 'Error fetching transcript. Ensure the video has captions and your API key is valid.';
    console.error(error);
  }
}

function extractVideoId(url) {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function downloadTranscript() {
  const transcriptText = document.getElementById('transcriptText').textContent;
  if (transcriptText && transcriptText !== 'Fetching transcript...' && transcriptText !== 'No transcript available for this video.') {
    const blob = new Blob([transcriptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transcript.txt';
    a.click();
    URL.revokeObjectURL(url);
  } else {
    alert('No transcript available to download.');
  }
}
