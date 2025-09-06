import { formatTime } from '../../utils/formatTime.js';
import { loadComponent } from '../../utils/loadComponent.js';

// player state
let audio,
	coverEl,
	titleEl,
	artistEl,
	prevBtn,
	toggleBtn,
	nextBtn,
	isPlaying = false,
	currentTrackEl = null,
	progressEl = null,
	currentTimeEl,
	totalTimeEl;

export async function initPlayer(container) {
	const playerRoot = await loadComponent(
		'/components/player/player.html',
		'/components/player/player.css',
		container
	);

	// cache elements
	audio = playerRoot.querySelector('#audio');
	coverEl = playerRoot.querySelector('#player-cover');
	titleEl = playerRoot.querySelector('#player-title');
	artistEl = playerRoot.querySelector('#player-artist');
	prevBtn = playerRoot.querySelector('#player-prev');
	toggleBtn = playerRoot.querySelector('#player-toggle');
	nextBtn = playerRoot.querySelector('#player-next');
	progressEl = playerRoot.querySelector('#player-progress');
	currentTimeEl = playerRoot.querySelector('#player-current-time');
	totalTimeEl = playerRoot.querySelector('#player-total-time');

	if (!audio || !toggleBtn) {
		console.error('Player elements not found');
		return;
	}

	// main toggle button (in the player UI)
	toggleBtn.addEventListener('click', e => {
		e.stopPropagation();
		if (audio.paused && audio.src) audio.play();
		else audio.pause();
	});

	// skip buttons
	prevBtn?.addEventListener('click', e => {
		e.stopPropagation();
		skipTrack(-1);
	});

	nextBtn?.addEventListener('click', e => {
		e.stopPropagation();
		skipTrack(1);
	});

	// audio events
	audio.addEventListener('play', () => {
		isPlaying = true;
		updatePlayerToggleIcon();
		updateTrackToggleIcon(true);
	});

	audio.addEventListener('pause', () => {
		isPlaying = false;
		updatePlayerToggleIcon();
		updateTrackToggleIcon(false);
	});

	// update progress bar while playing
	audio.addEventListener('timeupdate', () => {
		if (!progressEl || !audio.duration) return;
		const percent = (audio.currentTime / audio.duration) * 100;
		progressEl.value = percent;
		progressEl.style.setProperty('--progress', `${percent}%`);

		if (currentTimeEl)
			currentTimeEl.textContent = formatTime(audio.currentTime);
	});

	// set duration max value when metadata is loaded
	audio.addEventListener('loadedmetadata', () => {
		if (progressEl) progressEl.value = 0;
		if (totalTimeEl) totalTimeEl.textContent = formatTime(audio.duration);
		if (currentTimeEl) currentTimeEl.textContent = '0:00';
		progressEl.style.setProperty('--progress', '0%');
	});

	progressEl?.addEventListener('input', () => {
		if (!audio.duration) return;
		const newTime = (progressEl.value / 100) * audio.duration;
		audio.currentTime = newTime;
	});
}

/**
 * play a track preview
 * @param {string} url - previewUrl from itunes api
 * @param {object} trackInfo - { cover, title, artist, element }
 */

export function playTrack(url, trackInfo = {}) {
	if (!audio) return;

	audio.src = url;
	audio.play();

	// update player ui
	if (trackInfo.cover) coverEl.src = trackInfo.cover;
	if (trackInfo.title) titleEl.textContent = trackInfo.title;
	if (trackInfo.artist) artistEl.textContent = trackInfo.artist;

	// reset previous track
	if (currentTrackEl && currentTrackEl !== trackInfo.element) {
		const oldIndex = currentTrackEl.dataset.index;
		const oldIndexEl = currentTrackEl.querySelector('.track-index');
		if (oldIndexEl) oldIndexEl.textContent = oldIndex;
		currentTrackEl.classList.remove('active');
	}

	// set new active track
	if (trackInfo.element) {
		currentTrackEl = trackInfo.element;
		currentTrackEl.classList.add('active');

		createTrackToggle(currentTrackEl);
	}
}

// ---------- HELPERS ----------

// skip logic
function skipTrack(direction) {
	if (!currentTrackEl) return;

	const allTracks = Array.from(
		currentTrackEl.parentElement.querySelectorAll('.track')
	);
	const currentIndex = allTracks.indexOf(currentTrackEl);

	let newIndex =
		(currentIndex + direction + allTracks.length) % allTracks.length;
	const newTrackEl = allTracks[newIndex];
	const url = newTrackEl.dataset.url;

	if (!url) return;

	playTrack(url, {
		cover: newTrackEl.querySelector('.track-cover')?.src,
		title: newTrackEl.querySelector('.track-title')?.textContent,
		artist: newTrackEl.querySelector('.track-artist')?.textContent,
		element: newTrackEl,
	});
}

// create or replace toggle button inside track row
function createTrackToggle(trackEl) {
	const indexEl = trackEl.querySelector('.track-index');
	if (!indexEl) return;

	indexEl.innerHTML = `
		<button class="track-toggle">
			<img src="/assets/icons/pause.svg" alt="pause">
		</button>
	`;

	const trackToggle = indexEl.querySelector('.track-toggle');
	trackToggle.addEventListener('click', e => {
		e.stopPropagation();
		if (audio.paused) audio.play();
		else audio.pause();
	});
}

// update icon in the player bar
function updatePlayerToggleIcon() {
	if (!toggleBtn) return;
	toggleBtn.innerHTML = isPlaying
		? `<img src="/assets/icons/pause.svg" alt="pause" />`
		: `<img src="/assets/icons/play.svg" alt="play" />`;
}

// update icon on the active track row
function updateTrackToggleIcon(playing) {
	if (!currentTrackEl) return;

	const trackToggle = currentTrackEl.querySelector('.track-toggle');
	if (trackToggle) {
		trackToggle.innerHTML = playing
			? `<img src="/assets/icons/pause.svg" alt="pause" />`
			: `<img src="/assets/icons/play.svg" alt="play" />`;
	}
}
