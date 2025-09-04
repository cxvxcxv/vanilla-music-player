import { formatDate } from '../../utils/formatDate.js';
import { loadComponent } from '../../utils/loadComponent.js';

export async function renderTrack(track) {
	const el = await loadComponent(
		'/components/track/track.html',
		'/components/track/track.css',
		document.createElement('div') // temp container, will be replaced
	);

	// populate content
	const cover = el.querySelector('.cover');
	if (cover) cover.src = track.artworkUrl100;

	const title = el.querySelector('.title');
	if (title) title.textContent = track.trackName;

	const artist = el.querySelector('.artist');
	if (artist) artist.textContent = track.artistName;

	const date = el.querySelector('.date');
	if (date) date.textContent = formatDate(track.releaseDate);

	el.dataset.url = track.previewUrl;

	return el;
}
