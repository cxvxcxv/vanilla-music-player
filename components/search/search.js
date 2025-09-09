import { fetchFromItunes } from '../../utils/api.js';
import { loadComponent } from '../../utils/loadComponent.js';
import { renderTrack } from '../track/track.js';

export async function initSearch(container) {
	const searchRoot = await loadComponent(
		'/components/search/search.html',
		'/components/search/search.css',
		container
	);

	// attach event
	const input = searchRoot.querySelector('#search-input');
	const form = searchRoot.querySelector('#search-form');
	const results = searchRoot.querySelector('#search-results');

	if (!input) {
		console.error('Search input or button not found');
		return;
	}

	// add listener to the form submition
	form.addEventListener('submit', async e => {
		e.preventDefault();

		const query = input.value.trim();
		if (!query) return;

		// fetch
		const data = await fetchFromItunes({
			term: query,
			entity: 'musicTrack',
			limit: 10,
		});

		// display a msg if a track is not found
		if (!data.results.length) {
			results.innerHTML = `<h1>${query} not found. Try another search</h1>`;
			return;
		}

		// add header row once
		results.innerHTML = `
		<div class="search-headings">
			<h6 class="title">TITLE</h6>
			<h6 class="release">RELEASE</h6>
		</div>
	`;

		//render tracks
		data.results.forEach(async (track, index) => {
			const el = await renderTrack(track, index);
			results.appendChild(el);
		});
	});
}
