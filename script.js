// Replace with your OAuth 2.0 Client ID from Google Cloud Console
const CLIENT_ID = '648045152886-nj5ppll4u2k0pp0ql7lm4904mg1bl4v4.apps.googleusercontent.com'; // Update this
const SCOPES = 'https://www.googleapis.com/auth/youtube.readonly';

let accessToken = null;

function handleAuthClick() {
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent('https://oscar200442.github.io/transcripttranslate/')}&response_type=token&scope=${encodeURIComponent(SCOPES)}&state=state_parameter_passthrough_value`;
  window.location.href = authUrl;
}

function getTokenFromUrl() {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  return params.get('access_token');
}

async function downloadTranscripts() {
  const youtubeLinks = document.getElementById('youtubeLinks').value.split(',').map(url => url.trim());
  const transcriptOutput = document.getElementById('transcriptOutput');
  const downloadLink = document.getElementById('downloadLink');
  const errorDiv = document.getElementById('error');

  // Reset outputs
  transcriptOutput.value = 'Authenticating and fetching transcripts...';
  downloadLink.style.display = 'none';
  errorDiv.style.display = 'none';
  errorDiv.textContent = '';

  if (!youtubeLinks || youtubeLinks[0] === '') {
    errorDiv.textContent = 'Please enter at least one YouTube URL';
    errorDiv.style.display = 'block';
    transcriptOutput.value = '';
    return;
  }

  // Check or get access token
  if (!accessToken) {
    accessToken = getTokenFromUrl();
    if (!accessToken) {
      handleAuthClick();
      return;
    }
  }

  try {
    let allTranscripts = '';

    for (const link of youtubeLinks) {
      const videoIdMatch = link.match(/(?:v=)([^&]+)/);
      if (!videoIdMatch) {
        allTranscripts += `Invalid URL: ${link}\n\n`;
        continue;
      }
      const videoId = videoIdMatch[1];

      // Fetch available caption tracks
      const captionsResponse = await fetch(`https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const captionsData = await captionsResponse.json();

      if (!captionsData.items || captionsData.items.length === 0) {
        allTranscripts += `No captions available for video: ${link}\n\n`;
        continue;
      }

      // Get the first available caption track
      const captionId = captionsData.items[0].id;
      const captionResponse = await fetch(`https://www.googleapis.com/youtube/v3/captions/${captionId}?tfmt=srt`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
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
    console.error('Detailed error:', error);
  }
}

// Check for token on page load
window.onload = () => {
  accessToken = getTokenFromUrl();
  if (accessToken) {
    window.history.pushState({}, document.title, window.location.pathname); // Clear hash
  }
};
