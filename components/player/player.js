import { USER_SETTINGS } from '../../constants/user-settings.constants.js';
import { formatTime } from '../../utils/formatTime.js';
import { loadComponent } from '../../utils/loadComponent.js';
import {
	getUserSetting,
	setUserSetting,
} from '../../utils/userSettingsStore.js';

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
	currentTimeEl = null,
	totalTimeEl = null,
	volumeBtn,
	volumeEl = null,
	lastVolume = 1,
	repeatBtn,
	isOnRepeat = getUserSetting(USER_SETTINGS.REPEAT, false);
// isShuffleOn = getUserSetting(USER_SETTINGS.SHUFFLE, false);

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

	// init

	// apply shuffle
	// shuffleBtn.classList.toggle('active', isShuffleOn);

	// applly repeat
	audio.loop = isOnRepeat;
	repeatBtn.classList.toggle('active', isOnRepeat);

	// main toggle button (in the player UI)
	toggleBtn.addEventListener('click', e => {
		e.stopPropagation();
		if (audio.paused && audio.src) audio.play();
		else audio.pause();
	});

	// player buttons

	prevBtn?.addEventListener('click', e => {
		e.stopPropagation();
		skipTrack(-1);
	});

	nextBtn?.addEventListener('click', e => {
		e.stopPropagation();
		skipTrack(1);
	});

	repeatBtn?.addEventListener('click', () => {
		isOnRepeat = !isOnRepeat;
		audio.loop = isOnRepeat;

		repeatBtn.classList.toggle('active', isOnRepeat);
		setUserSetting(USER_SETTINGS.REPEAT, isOnRepeat);
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

	// update audio progress
	progressEl?.addEventListener('input', () => {
		if (!audio.duration) return;
		const newTime = (progressEl.value / 100) * audio.duration;
		audio.currentTime = newTime;
	});

	// update volume + ui
	volumeEl?.addEventListener('input', () => {
		const unit = parseFloat(volumeEl.value) || 0;
		audio.volume = unit;

		volumeEl.style.setProperty('--volume', `${unit * 100}%`);

		updateVolumeIcon(unit);

		setUserSetting(USER_SETTINGS.VOLUME, unit);
	});

	//toggle volume mute/unmute
	volumeBtn.addEventListener('click', () => {
		if (audio.volume > 0) {
			lastVolume = audio.volume;
			audio.volume = 0;
			volumeEl.value = 0;
			volumeEl.style.setProperty('--volume', '0%');
			updateVolumeIcon(0);
			setUserSetting(USER_SETTINGS.VOLUME, 0);
		} else {
			const restored = lastVolume || 1;
			audio.volume = restored;
			volumeEl.value = restored;
			volumeEl.style.setProperty('--volume', `${restored * 100}%`);
			updateVolumeIcon(restored);
			setUserSetting(USER_SETTINGS.VOLUME, restored);
		}
	});

	// init volume
	const storedVolume = getUserSetting(USER_SETTINGS.VOLUME, 1);
	audio.volume = storedVolume;
	volumeEl.value = storedVolume;
	volumeEl.style.setProperty('--volume', `${storedVolume * 100}%`);
	updateVolumeIcon(storedVolume);
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

// update volume icon depending on value
function updateVolumeIcon(value) {
	if (value <= 0.01) {
		volumeBtn.innerHTML =
			'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/></svg>';
	} else if (value >= 0.5) {
		volumeBtn.innerHTML =
			'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/></svg>';
	} else {
		volumeBtn.innerHTML =
			'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/></svg>';
	}
}
