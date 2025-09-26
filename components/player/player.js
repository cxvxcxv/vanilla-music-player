import { USER_SETTINGS } from '../../constants/user-settings.constants.js';
import { formatTime } from '../../utils/formatTime.js';
import { loadComponent } from '../../utils/loadComponent.js';
import {
	getUserSetting,
	setUserSetting,
} from '../../utils/userSettingsStore.js';

// ---------- PLAYER STATE ----------

let audio,
	coverEl,
	titleEl,
	artistEl,
	prevBtn,
	toggleBtn,
	nextBtn,
	progressEl,
	currentTimeEl,
	totalTimeEl,
	volumeBtn,
	volumeEl,
	repeatBtn,
	shuffleBtn;

let isPlaying = false;
let lastVolume = 1;

let isOnRepeat = getUserSetting(USER_SETTINGS.REPEAT, false);
let isShuffleOn = getUserSetting(USER_SETTINGS.SHUFFLE, false);

let queue = []; // ordered list of track elements
let queueIndex = -1; // current position in queue
let currentTrackEl = null; // reference to active track element

// ---------- INIT ----------

export async function initPlayer(container) {
	const playerRoot = await loadComponent(
		'components/player/player.html',
		'components/player/player.css',
		container
	);

	// cache dom references
	audio = playerRoot.querySelector('#audio');
	coverEl = playerRoot.querySelector('#player-cover');
	titleEl = playerRoot.querySelector('#player-title');
	artistEl = playerRoot.querySelector('#player-artist');
	shuffleBtn = playerRoot.querySelector('#player-shuffle');
	prevBtn = playerRoot.querySelector('#player-prev');
	toggleBtn = playerRoot.querySelector('#player-toggle');
	nextBtn = playerRoot.querySelector('#player-next');
	repeatBtn = playerRoot.querySelector('#player-repeat');
	progressEl = playerRoot.querySelector('#player-progress');
	currentTimeEl = playerRoot.querySelector('#player-current-time');
	totalTimeEl = playerRoot.querySelector('#player-total-time');
	volumeBtn = playerRoot.querySelector('#player-volume-toggle');
	volumeEl = playerRoot.querySelector('#player-volume');

	if (!audio || !toggleBtn) {
		console.error('Player elements not found');
		return;
	}

	// initialize state
	initSettings();
	initControls();
	initAudioEvents();
}

// ---------- INITIAL SETTINGS ----------
function initSettings() {
	// shuffle state
	shuffleBtn.classList.toggle('active', isShuffleOn);

	// repeat state
	audio.loop = isOnRepeat;
	repeatBtn.classList.toggle('active', isOnRepeat);

	// volume state
	const storedVolume = getUserSetting(USER_SETTINGS.VOLUME, 1);
	audio.volume = storedVolume;
	volumeEl.value = storedVolume;
	updateVolumeUI(storedVolume);
}

// ---------- CONTROLS ----------
function initControls() {
	// shuffle button
	shuffleBtn?.addEventListener('click', () => toggleShuffle());

	// previous track
	prevBtn?.addEventListener('click', e => {
		e.stopPropagation();
		skipTrack(-1);
	});

	// play/pause toggle
	toggleBtn?.addEventListener('click', e => {
		e.stopPropagation();
		audio.paused ? audio.play() : audio.pause();
	});

	// next track
	nextBtn?.addEventListener('click', e => {
		e.stopPropagation();
		skipTrack(1);
	});

	// repeat button
	repeatBtn?.addEventListener('click', () => toggleRepeat());

	// progress bar seeking
	progressEl?.addEventListener('input', () => {
		if (!audio.duration) return;
		audio.currentTime = (progressEl.value / 100) * audio.duration;
	});

	// volume slider
	volumeEl?.addEventListener('input', () => {
		const volume = parseFloat(volumeEl.value) || 0;
		setVolume(volume);
	});

	// mute/unmute button
	volumeBtn?.addEventListener('click', toggleMute);
}

// ---------- AUDIO EVENTS ----------

function initAudioEvents() {
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

	// update progress bar + current time
	audio.addEventListener('timeupdate', updateProgress);

	// reset progress and show duration once metadata is loaded
	audio.addEventListener('loadedmetadata', () => {
		progressEl.value = 0;
		progressEl.style.setProperty('--progress', '0%');
		if (totalTimeEl) totalTimeEl.textContent = formatTime(audio.duration);
		if (currentTimeEl) currentTimeEl.textContent = '0:00';
	});

	// go next when track ends
	audio.addEventListener('ended', () => skipTrack(1));

	document.addEventListener('keydown', e => {
		const isFormField =
			e.target.tagName === 'INPUT' ||
			e.target.tagName === 'TEXTAREA' ||
			e.target.isContentEditable;

		if (isFormField) return;

		if (e.code === 'Space') {
			e.preventDefault();
			if (audio) {
				audio.paused ? audio.play() : audio.pause();
			}
		}

		if (e.code === 'ArrowLeft') skipTrack(-1);
		if (e.code === 'ArrowRight') skipTrack(1);
	});
}

// ---------- PUBLIC ----------

export function playTrack(url, trackInfo = {}) {
	if (!audio) return;

	// rebuild queue if this track is part of a track list
	if (trackInfo.element) {
		const trackList = Array.from(
			trackInfo.element.parentElement.querySelectorAll('.track')
		);

		// rebuild if queue empty or does not contain this track
		if (queue.length === 0 || !queue.includes(trackInfo.element)) {
			queue = trackList;
		}

		// update index to point at this track
		queueIndex = queue.indexOf(trackInfo.element);
	}

	// load and play audio
	audio.src = url;
	audio.play();

	updatePlayerUI(trackInfo);
	setActiveTrack(trackInfo.element);
}

// ---------- HELPERS ----------
function skipTrack(direction) {
	if (queue.length === 0) return;

	// either shuffle or normal sequential skip
	queueIndex = isShuffleOn
		? Math.floor(Math.random() * queue.length)
		: (queueIndex + direction + queue.length) % queue.length;

	const trackEl = queue[queueIndex];
	const url = trackEl.dataset.url;
	if (!url) return;

	playTrack(url, {
		cover: trackEl.querySelector('.track-cover')?.src,
		title: trackEl.querySelector('.track-title')?.textContent,
		artist: trackEl.querySelector('.track-artist')?.textContent,
		element: trackEl,
	});
}

// update player UI (cover/title/artist)
function updatePlayerUI({ cover, title, artist }) {
	if (cover) coverEl.src = cover;
	if (title) titleEl.textContent = title;
	if (artist) artistEl.textContent = artist;
}

// highlight the active track in the list
function setActiveTrack(trackEl) {
	if (!trackEl) return;

	// reset previous active
	if (currentTrackEl && currentTrackEl !== trackEl) {
		const oldIndex = currentTrackEl.dataset.index;
		const oldIndexEl = currentTrackEl.querySelector('.track-index');
		if (oldIndexEl) oldIndexEl.textContent = oldIndex;
		currentTrackEl.classList.remove('active');
	}

	// mark new as active
	currentTrackEl = trackEl;
	currentTrackEl.classList.add('active');
	createTrackToggle(currentTrackEl);
}

// replace track index with play/pause button
function createTrackToggle(trackEl) {
	const indexEl = trackEl.querySelector('.track-index');
	if (!indexEl) return;

	indexEl.innerHTML = `
		<button class="track-toggle">
			<img src="assets/icons/pause.svg" alt="pause">
		</button>
	`;

	indexEl.querySelector('.track-toggle')?.addEventListener('click', e => {
		e.stopPropagation();
		audio.paused ? audio.play() : audio.pause();
	});
}

// ---------- STATE TOGGLES ----------

function toggleShuffle() {
	isShuffleOn = !isShuffleOn;
	shuffleBtn.classList.toggle('active', isShuffleOn);
	setUserSetting(USER_SETTINGS.SHUFFLE, isShuffleOn);
}

function toggleRepeat() {
	isOnRepeat = !isOnRepeat;
	audio.loop = isOnRepeat;
	repeatBtn.classList.toggle('active', isOnRepeat);
	setUserSetting(USER_SETTINGS.REPEAT, isOnRepeat);
}

function toggleMute() {
	if (audio.volume > 0) {
		// save current volume, mute audio
		lastVolume = audio.volume;
		setVolume(0);
	} else {
		// restore last volume
		setVolume(lastVolume || 1);
	}
}

function setVolume(value) {
	audio.volume = value;
	volumeEl.value = value;
	updateVolumeUI(value);
	setUserSetting(USER_SETTINGS.VOLUME, value);
}

// ---------- UI UPDATES ----------

function updateProgress() {
	if (!audio.duration) return;

	const percent = (audio.currentTime / audio.duration) * 100;
	progressEl.value = percent;
	progressEl.style.setProperty('--progress', `${percent}%`);

	if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);
}

// update main player play/pause icon
function updatePlayerToggleIcon() {
	if (!toggleBtn) return;
	toggleBtn.innerHTML = isPlaying
		? `<img src="assets/icons/pause.svg" alt="pause" />`
		: `<img src="assets/icons/play.svg" alt="play" />`;
}

// update track list play/pause icon
function updateTrackToggleIcon(playing) {
	if (!currentTrackEl) return;

	const trackToggle = currentTrackEl.querySelector('.track-toggle');
	if (trackToggle) {
		trackToggle.innerHTML = playing
			? `<img src="assets/icons/pause.svg" alt="pause" />`
			: `<img src="assets/icons/play.svg" alt="play" />`;
	}
}

// update volume slider and button icon
function updateVolumeUI(value) {
	const percent = `${value * 100}%`;
	volumeEl.style.setProperty('--volume', percent);

	if (value <= 0.01) {
		volumeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/></svg>`;
	} else if (value >= 0.5) {
		volumeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/></svg>`;
	} else {
		volumeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/></svg>`;
	}
}
