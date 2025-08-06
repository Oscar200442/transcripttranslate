const API_KEY = 'AIzaSyB6MLqwIpK6ni8UETo6f3-oz8CrMNYLWJk';
const CLIENT_ID = '648045152886-nj5ppll4u2k0pp0ql7lm4904mg1bl4v4.apps.googleusercontent.com';

async function downloadTranscripts() {
  const youtubeLinks = document.getElementById('youtubeLinks').value.split(',').map(url => url.trim());
  const transcriptOutput = document.getElementById('transcriptOutput');
  const downloadLink = document.getElementById('downloadLink');
  const errorDiv = document.getElementById('error');
  const loadingDiv = document.getElementById('loading');

  // Reset outputs
  transcriptOutput.value = '';
  if (downloadLink.href) {
    URL.revokeObjectURL(downloadLink.href); // Prevent memory leaks
  }
  downloadLink.style.display = 'none';
  errorDiv.style.display = 'none';
  errorDiv.textContent = '';
  loadingDiv.style.display = 'block';

  // Validate YouTube URLs
  const isValidYouTubeUrl = (url) => {
    const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|embed\/|v\/|.+\?v=)?([^&=?\s]{11})/;
    return regex.test(url);
  };

  if (!youtubeLinks || youtubeLinks[0] === '') {
    errorDiv.textContent = 'Please enter at least one YouTube URL.';
    errorDiv.style.display = 'block';
    loadingDiv.style.display = 'none';
    return;
  }

  if (!youtubeLinks.every(isValidYouTubeUrl)) {
    errorDiv.textContent = 'One or more URLs are not valid YouTube URLs.';
    errorDiv.style.display = 'block';
    loadingDiv.style.display = 'none';
    return;
  }

  try {
    // Load Google API Client
    await new Promise((resolve, reject) => {
      gapi.load('client', { callback: resolve, onerror: reject });
    });

    // Initialize YouTube API client
    await gapi.client.init({
      apiKey: API_KEY,
      // Uncomment the following for private videos (requires OAuth setup)
      // clientId: CLIENT_ID,
      // scope: 'https://www.googleapis.com/auth/youtube.force-ssl',
    });

    // Uncomment for OAuth (requires user consent for private videos)
    // if (!gapi.auth2.getAuthInstance()?.isSignedIn.get()) {
    //   await gapi.auth2.getAuthInstance().signIn();
    // }

    const transcripts = {};
    for (const url of youtubeLinks) {
      const videoId = url.match(/(?:v=)([^&=?\s]{11})/)?.[1];
      if (!videoId) {
        transcripts[url] = 'Invalid YouTube URL';
        continue;
      }

      try {
        // List available captions
        const captionResponse = await gapi.client.youtube.captions.list({
          part: 'snippet',
          videoId: videoId,
        });

        const captionItems = captionResponse.result.items;
        if (!captionItems || captionItems.length === 0) {
          transcripts[url] = 'No captions available';
          continue;
        }

        // Get the first available caption track (preferring 'en' language)
        const captionTrack = captionItems.find(item => item.snippet.language === 'en') || captionItems[0];
        const captionId = captionTrack.id;

        // Download captions in SRT format
        const downloadResponse = await gapi.client.youtube.captions.download({
          id: captionId,
          tfmt: 'srt',
        });

        transcripts[url] = downloadResponse.result;
      } catch (error) {
        transcripts[url] = `Error: ${error.result?.error?.message || error.message}`;
      }
    }

    let allTranscripts = '';
    for (const [url, transcript] of Object.entries(transcripts)) {
      allTranscripts += `Transcript for ${url}:\n${transcript}\n\n`;
    }

    if (!allTranscripts.trim()) {
      errorDiv.textContent = 'No transcripts were retrieved for the provided URLs.';
      errorDiv.style.display = 'block';
      transcriptOutput.value = '';
      loadingDiv.style.display = 'none';
      return;
    }

    transcriptOutput.value = allTranscripts;

    // Create downloadable .txt file
    const blob = new Blob([allTranscripts], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    downloadLink.href = url;
    downloadLink.download = 'transcripts.txt';
    downloadLink.style.display = 'block';
    loadingDiv.style.display = 'none';
  } catch (error) {
    errorDiv.textContent = `Error fetching transcripts: ${error.message}`;
    errorDiv.style.display = 'block';
    transcriptOutput.value = '';
    loadingDiv.style.display = 'none';
    console.error('Detailed error:', error);
  }
}
