import { loadComponent } from '../../utils/loadComponent.js';

export async function initSidebar(container) {
	const sidebarRoot = await loadComponent(
		'/components/sidebar/sidebar.html',
		'/components/sidebar/sidebar.css',
		container
	);

	const buttons = sidebarRoot.querySelectorAll('button');
	const searchEl = document.querySelector('.search');
	const likedEl = document.querySelector('.liked');

	buttons.forEach(btn => {
		btn.addEventListener('click', () => {
			// update active tab
			buttons.forEach(b => b.classList.remove('active'));
			btn.classList.add('active');

			// show the right section
			const page = btn.dataset.page;
			if (page === 'search') {
				searchEl.classList.remove('hidden');
				likedEl.classList.add('hidden');
			} else if (page === 'liked') {
				searchEl.classList.add('hidden');
				likedEl.classList.remove('hidden');
			}
		});
	});

	// default: show search, hide liked
	searchEl.classList.remove('hidden');
	likedEl.classList.add('hidden');
}
