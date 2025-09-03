import { loadComponent } from '../../utils/loadComponent.js';

export async function initPlayer(container) {
	await loadComponent(
		'/components/player/player.html',
		'/components/player/player.css',
		container
	);
}
