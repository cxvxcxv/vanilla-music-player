import { getLikedTracks } from '../../utils/likedStore.js';
import { loadComponent } from '../../utils/loadComponent.js';
import { renderTrack } from '../track/track.js';

export async function initLiked(container) {
	const likedRoot = await loadComponent(
		'/components/liked/liked.html',
		'/components/liked/liked.css',
		container
	);

	const results = likedRoot.querySelector('#liked-results');
	const tracks = getLikedTracks();

	if (!tracks.length) {
		results.innerHTML = "<h2>You don't have liked tracks yet</h2>";
		return;
	}

	//render liked tracks
	tracks.forEach(async (track, index) => {
		const el = await renderTrack(track, index);
		results.appendChild(el);
	});
}
