import { loadComponent } from '../../utils/loadComponent.js';

export async function initSidebar(container) {
	await loadComponent(
		'/components/sidebar/sidebar.html',
		'/components/sidebar/sidebar.css',
		container
	);
}
