import { loadComponent } from '../../utils/loadComponent.js';

let audio,
	coverEl,
	titleEl,
	artistEl,
	playerToggleBtn,
	isPlaying = false,
	currentTrackEl = null;

export async function initPlayer(container) {
	const playerRoot = await loadComponent(
		'/components/player/player.html',
		'/components/player/player.css',
		container
	);

	audio = playerRoot.querySelector('#audio');
	coverEl = playerRoot.querySelector('#player-cover');
	titleEl = playerRoot.querySelector('#player-title');
	artistEl = playerRoot.querySelector('#player-artist');
	playerToggleBtn = playerRoot.querySelector('#player-toggle');

	if (!audio || !playerToggleBtn) {
		console.error('Player elements not found');
		return;
	}

	// main toggle button (in the player UI)
	playerToggleBtn.addEventListener('click', e => {
		e.stopPropagation(); // just in case
		if (audio.paused && audio.src) {
			audio.play();
		} else {
			audio.pause();
		}
	});

	// update icons when state changes
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
}

/**
 * Plays a track preview
 * @param {string} url - the previewUrl from iTunes API
 * @param {object} trackInfo - info about track
 */
export function playTrack(url, trackInfo = {}) {
	if (!audio) return;

	audio.src = url;
	audio.play();

	// update player UI
	if (trackInfo.cover) coverEl.src = trackInfo.cover;
	if (trackInfo.title) titleEl.textContent = trackInfo.title;
	if (trackInfo.artist) artistEl.textContent = trackInfo.artist;

	// reset previous track index if another track is played
	if (currentTrackEl && currentTrackEl !== trackInfo.element) {
		const oldIndex = currentTrackEl.dataset.index;
		const oldIndexEl = currentTrackEl.querySelector('.track-index');
		if (oldIndexEl) oldIndexEl.textContent = oldIndex;
		currentTrackEl.classList.remove('active');
	}

	// highlight new active track
	if (trackInfo.element) {
		currentTrackEl = trackInfo.element;
		currentTrackEl.classList.add('active');

		// replace index with toggle button
		const indexEl = currentTrackEl.querySelector('.track-index');
		if (indexEl) {
			indexEl.innerHTML = `<button class="track-toggle"><img src="/assets/icons/pause.svg"></button>`;
			const trackToggle = indexEl.querySelector('.track-toggle');

			trackToggle.addEventListener('click', e => {
				e.stopPropagation(); // prevent triggering row click
				if (audio.paused) {
					audio.play();
				} else {
					audio.pause();
				}
			});
		}
	}
}

// update icon in the player bar
function updatePlayerToggleIcon() {
	if (!playerToggleBtn) return;
	playerToggleBtn.innerHTML = isPlaying
		? `<img src="/assets/icons/pause.svg" alt="pause" />`
		: `<img src="/assets/icons/play.svg" alt="play" />`;
}

// update icon on the track row
function updateTrackToggleIcon(playing) {
	if (!currentTrackEl) return;

	const trackToggle = currentTrackEl.querySelector('.track-toggle');
	if (trackToggle) {
		trackToggle.innerHTML = playing
			? `<img src="/assets/icons/pause.svg" alt="pause" />`
			: `<img src="/assets/icons/play.svg" alt="play" />`;
	}
}
