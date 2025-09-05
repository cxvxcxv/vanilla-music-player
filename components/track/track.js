import { formatDate } from '../../utils/formatDate.js';
import { loadComponent } from '../../utils/loadComponent.js';

export async function renderTrack(track, index) {
	const el = await loadComponent(
		'/components/track/track.html',
		'/components/track/track.css',
		document.createElement('div') // temp container, will be replaced
	);

	el.dataset.index = index + 1;

	// populate content
	const indexEl = el.querySelector('.track-index');
	if (indexEl) indexEl.textContent = String(index + 1);

	const cover = el.querySelector('.track-cover');
	if (cover) cover.src = track.artworkUrl100;

	const title = el.querySelector('.track-title');
	if (title) title.textContent = track.trackName;

	const artist = el.querySelector('.track-artist');
	if (artist) artist.textContent = track.artistName;

	const date = el.querySelector('.track-date');
	if (date) date.textContent = formatDate(track.releaseDate);

	el.dataset.url = track.previewUrl;

	return el;
}
