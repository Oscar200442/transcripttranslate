let transcripts = [];

async function fetchTranscripts() {
  const videoUrls = document.getElementById('videoUrls').value.split('\n').map(url => url.trim()).filter(url => url);
  const errorDiv = document.getElementById('error');
  const transcriptSection = document.getElementById('transcriptSection');
  const loadingDiv = document.getElementById('loading');
  const transcriptsContainer = document.getElementById('transcriptsContainer');

  if (videoUrls.length === 0) {
    errorDiv.textContent = 'Please enter at least one YouTube URL.';
    errorDiv.classList.remove('hidden');
    return;
  }

  errorDiv.classList.add('hidden');
  transcriptSection.classList.add('hidden');
  loadingDiv.classList.remove('hidden');
  transcriptsContainer.innerHTML = '';

  try {
    transcripts = [];
    for (const url of videoUrls) {
      const videoId = extractVideoId(url);
      if (!videoId) {
        transcripts.push({ videoId: url, text: 'Invalid URL', error: true });
        continue;
      }
      // Mock transcript fetching - replace with backend call (e.g., fetch(`/api/transcript?videoId=${videoId}`))
      const mockTranscript = `00:00:00,000 --> 00:00:05,000\nVideo ${videoId} Transcript\n00:00:05,001 --> 00:00:10,000\nSample content.`;
      transcripts.push({ videoId, text: mockTranscript });
    }

    if (transcripts.length > 0) {
      transcripts.forEach(({ videoId, text, error }) => {
        const div = document.createElement('div');
        div.className = 'border p-2 rounded-md';
        div.innerHTML = `
          <p class="font-medium">Video ID: ${videoId}</p>
          <button onclick="viewTranscript('${videoId}')" class="mt-2 bg-blue-500 text-white p-1 rounded-md hover:bg-blue-600">View</button>
          <button onclick="downloadTranscript('${videoId}')" class="mt-2 ml-2 bg-green-500 text-white p-1 rounded-md hover:bg-green-600">Download</button>
          ${error ? '<p class="text-red-500">Error: Invalid URL</p>' : ''}
        `;
        transcriptsContainer.appendChild(div);
      });
      transcriptSection.classList.remove('hidden');
    } else {
      errorDiv.textContent = 'No valid transcripts retrieved.';
      errorDiv.classList.remove('hidden');
    }
  } catch (error) {
    errorDiv.textContent = 'Error processing transcripts. Check the URLs.';
    errorDiv.classList.remove('hidden');
  } finally {
    loadingDiv.classList.add('hidden');
  }
}

function extractVideoId(url) {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function viewTranscript(videoId) {
  const transcript = transcripts.find(t => t.videoId === videoId);
  if (transcript) alert(transcript.text);
}

function downloadTranscript(videoId) {
  const transcript = transcripts.find(t => t.videoId === videoId);
  if (transcript && !transcript.error) {
    const blob = new Blob([transcript.text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript_${videoId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  } else {
    alert('No valid transcript available to download.');
  }
}

function downloadAllTranscripts() {
  const validTranscripts = transcripts.filter(t => !t.error);
  if (validTranscripts.length > 0) {
    const combinedText = validTranscripts.map(t => `Transcript for Video ID: ${t.videoId}\n${t.text}\n---`).join('\n');
    const blob = new Blob([combinedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'all_transcripts.txt';
    a.click();
    URL.revokeObjectURL(url);
  } else {
    alert('No valid transcripts available to download.');
  }
}

async function translateText() {
  const translateText = document.getElementById('translateText').value;
  const targetLanguage = document.getElementById('targetLanguage').value;
  const translatedText = document.getElementById('translatedText');
  const deeplSection = document.getElementById('deeplTranslator');

  if (!translateText) {
    translatedText.textContent = 'Please enter text to translate.';
    return;
  }

  deeplSection.classList.remove('hidden');
  translatedText.textContent = 'Translating...';

  try {
    // Mock translation - replace with DeepL API call (e.g., fetch('https://api.deepl.com/v2/translate', { ... }))
    const mockTranslation = `${translateText} (Translated to ${targetLanguage})`;
    translatedText.textContent = mockTranslation;
  } catch (error) {
    translatedText.textContent = 'Error during translation. Check your input.';
    console.error(error);
  }
}