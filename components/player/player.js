import { loadComponent } from '../../utils/loadComponent.js';

export async function initPlayer(container) {
	await loadComponent(
		'/components/player/player.html',
		'/components/player/player.css',
		container
	);
}

let currentAudio = null;

/**
 * Plays a track preview
 * @param {string} url - The previewUrl from iTunes API
 */

export function playTrack(url) {
	// stop previous
	if (currentAudio) {
		currentAudio.pause();
	}

	currentAudio = new Audio(url);
	currentAudio.play();
	console.log('play');
}
