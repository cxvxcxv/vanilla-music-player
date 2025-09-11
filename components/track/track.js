import { formatDate } from '../../utils/formatDate.js';
import { getLikedTrack, toggleLikedTrack } from '../../utils/likedStore.js';
import { loadComponent } from '../../utils/loadComponent.js';
import { setText } from '../../utils/setText.js';
import { playTrack } from '../player/player.js';

let cachedTrackTemplate = null;

export async function renderTrack(track, index) {
	// Load template once
	if (!cachedTrackTemplate) {
		const templateRoot = document.createElement('div');
		cachedTrackTemplate = await loadComponent(
			'/components/track/track.html',
			'/components/track/track.css',
			templateRoot
		);
	}

	// clone fresh element
	const el = cachedTrackTemplate.cloneNode(true);
	el.dataset.index = index + 1;
	el.dataset.url = track.previewUrl;

	// dynamically set text
	setText(el, '.track-index', String(index + 1));
	setText(el, '.track-title', track.trackName);
	setText(el, '.track-artist', track.artistName);
	setText(el, '.track-date', formatDate(track.releaseDate));

	const cover = el.querySelector('.track-cover');
	if (cover) cover.src = track.artworkUrl100;

	// like button logic
	const likeBtn = el.querySelector('.track-like');
	if (likeBtn) {
		const updateLikeState = () => {
			likeBtn.classList.toggle('liked', !!getLikedTrack(track.previewUrl));
		};

		// init state
		updateLikeState();

		// toggle on click
		likeBtn.addEventListener('click', e => {
			e.stopPropagation();
			toggleLikedTrack(track);
			updateLikeState();
		});
	}

	// play track on click
	el.addEventListener('click', () => {
		playTrack(track.previewUrl, {
			cover: track.artworkUrl100,
			title: track.trackName,
			artist: track.artistName,
			element: el,
		});
	});

	return el;
}
