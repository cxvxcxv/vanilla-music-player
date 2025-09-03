import { loadComponent } from '../../utils/loadComponent.js';

export async function initSearch(container) {
	await loadComponent(
		'/components/search/search.html',
		'/components/search/search.css',
		container
	);

	//attach event
	const input = container.querySelector('#searchInput');
	const btn = container.querySelector('#searchBtn');

	btn.addEventListener('click', () => {
		const query = input.value.trim();
		if (query) {
			console.log('search for:', query);
			//* later call api
		}
	});
}
