import { fetchFromItunes } from '../../utils/api.js';
import { loadComponent } from '../../utils/loadComponent.js';
import { playTrack } from '../player/player.js';
import { renderTrack } from '../track/track.js';

export async function initSearch(container) {
	const searchRoot = await loadComponent(
		'/components/search/search.html',
		'/components/search/search.css',
		container
	);

	//attach event
	const input = searchRoot.querySelector('#searchInput');
	const btn = searchRoot.querySelector('#searchBtn');
	const results = searchRoot.querySelector('#results');

	if (!input || !btn) {
		console.error('Search input or button not found');
		return;
	}

	//add listener to the search button
	btn.addEventListener('click', async () => {
		const query = input.value.trim();
		if (!query) return;

		//fetch
		const data = await fetchFromItunes({
			term: query,
			entity: 'musicTrack',
			limit: 10,
		});

		//render each track
		if (data.results?.length) {
			// add header row once
			results.innerHTML = `
		<div class="search-headings">
			<h6 class="title">TITLE</h6>
			<h6 class="release">RELEASE</h6>
		</div>
	`;

			// add tracks
			data.results.forEach(async (track, index) => {
				const el = await renderTrack(track, index);
				results.appendChild(el);
			});
		} else {
			results.innerHTML = `<h1>${query} not found. Try another search</h1>`;
		}
	});

	//play track on click
	results.addEventListener('click', e => {
		const trackEl = e.target.closest('.track');
		if (!trackEl || !results.contains(trackEl)) return;

		const url = trackEl.dataset.url;
		if (!url) return;

		playTrack(url, {
			cover: trackEl.querySelector('.track-cover')?.src,
			title: trackEl.querySelector('.track-title')?.textContent,
			artist: trackEl.querySelector('.track-artist')?.textContent,
			element: trackEl,
		});
	});
}
