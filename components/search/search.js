export async function initSearch(container) {
	//load component html
	const res = await fetch('/components/search/search.html');
	const html = await res.text();
	container.innerHTML = html;

	//attach styles dynamically
	const link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = '/components/search/search.css';
	document.head.appendChild(link);

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
