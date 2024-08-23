// JavaScript code in index.js
const audio = document.getElementById('audio');
const playPauseBtn = document.getElementById('play-pause');
const progress = document.getElementById('progress');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const searchResults = document.getElementById('search-results');
const songTitle = document.getElementById('song-title');
const songArtist = document.getElementById('song-artist');

let isPlaying = false;

playPauseBtn.addEventListener('click', () => {
    if (isPlaying) {
        audio.pause();
        playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    } else {
        audio.play();
        playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    }
    isPlaying = !isPlaying;
});

document.getElementById('backward').addEventListener('click', () => {
    audio.currentTime -= 30;
});

document.getElementById('forward').addEventListener('click', () => {
    audio.currentTime += 30;
});

audio.addEventListener('timeupdate', () => {
    const progressPercentage = (audio.currentTime / audio.duration) * 100;
    progress.value = progressPercentage;
});

progress.addEventListener('input', () => {
    const seekTime = (progress.value / 100) * audio.duration;
    audio.currentTime = seekTime;
});

async function fetchAccessToken() {
    const clientId = 'cdeeb1f7012a4410849eaf6ed4c43d16';
    const clientSecret = '13715ab78b5c4edf90c18db1be848972';

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
        },
        body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Error fetching access token:', errorData);
        return null;
    }

    const data = await response.json();
    return data.access_token;
}

async function searchMusic(query) {
    const token = await fetchAccessToken();

    if (!token) {
        console.error('Failed to fetch access token');
        return [];
    }

    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Error fetching search results:', errorData);
        return [];
    }

    const data = await response.json();
    return data.tracks.items;
}

async function fetchFullTrack(trackUri) {
    const token = await fetchAccessToken();

    if (!token) {
        console.error('Failed to fetch access token');
        return null;
    }

    const response = await fetch(`https://api.spotify.com/v1/tracks/${trackUri.split(':')[2]}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Error fetching full track:', errorData);
        return null;
    }

    const data = await response.json();
    return data.preview_url; // Use 'data.preview_url' for full track playback
}

searchButton.addEventListener('click', async () => {
    const query = searchInput.value;
    const results = await searchMusic(query);

    searchResults.innerHTML = '';
    results.forEach(track => {
        const li = document.createElement('li');
        li.textContent = `${track.name} by ${track.artists[0].name}`;
        li.addEventListener('click', async () => {
            const fullTrackUrl = await fetchFullTrack(track.uri);
            if (fullTrackUrl) {
                audio.src = fullTrackUrl;
                songTitle.textContent = track.name;
                songArtist.textContent = track.artists[0].name;
                audio.play();
                playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
                isPlaying = true;
            }
        });
        searchResults.appendChild(li);
    });
});
