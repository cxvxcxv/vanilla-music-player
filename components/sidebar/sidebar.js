import { loadComponent } from '../../utils/loadComponent.js';

export async function initSidebar(container) {
	const sidebarRoot = await loadComponent(
		'/components/sidebar/sidebar.html',
		'/components/sidebar/sidebar.css',
		container
	);

	const buttons = sidebarRoot.querySelectorAll('button');
	const pages = document.querySelectorAll('[data-page-section]');

	function showPage(pageName) {
		// hide all pages
		pages.forEach(page => {
			page.classList.toggle('hidden', page.dataset.pageSection !== pageName);
		});
	}

	buttons.forEach(btn => {
		btn.addEventListener('click', () => {
			// update active tab
			buttons.forEach(b => b.classList.remove('active'));
			btn.classList.add('active');

			// show the main section
			showPage(btn.dataset.page);
		});
	});

	// default: show first button page
	if (buttons.length > 0) {
		buttons[0].classList.add('active');
		showPage(buttons[0].dataset.page);
	}
}
