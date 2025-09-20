import { loadComponent } from '../../utils/loadComponent.js';

export async function initSettings(container) {
	const settingsRoot = await loadComponent(
		'/components/settings/settings.html',
		'/components/settings/settings.css',
		container
	);
}
