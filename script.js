const API_KEY = 'AIzaSyB6MLqwIpK6ni8UETo6f3-oz8CrMNYLWJk';

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
    // Wait for gapi to be available
    await new Promise((resolve, reject) => {
      if (typeof gapi === 'undefined') {
        reject(new Error('Google API Client Library failed to load. Check network or script inclusion.'));
      }
      // Poll for gapi availability
      const maxAttempts = 10;
      let attempts = 0;
      const checkGapi = () => {
        if (gapi.client) {
          resolve();
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(checkGapi, 500); // Wait 500ms before retrying
        } else {
          reject(new Error('Google API Client Library took too long to load.'));
        }
      };
      gapi.load('client', {
        callback: checkGapi,
        onerror: () => reject(new Error('Failed to load gapi.client')),
      });
    });

    // Initialize gapi client
    await gapi.client.init({
      apiKey: API_KEY,
    });

    // Load YouTube API v3
    await gapi.client.load('youtube', 'v3');

    // Verify YouTube API is loaded
    if (!gapi.client.youtube || !gapi.client.youtube.captions) {
      throw new Error('Failed to load YouTube API v3. Ensure API key is valid and YouTube Data API v3 is enabled.');
    }

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
          transcripts[url] = 'No captions available for this video.';
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

        transcripts[url] = downloadResponse.result || 'No transcript content retrieved.';
      } catch (error) {
        const errorMessage = error.result?.error?.message || error.message || 'Unknown error occurred.';
        transcripts[url] = `Error: ${errorMessage}`;
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
