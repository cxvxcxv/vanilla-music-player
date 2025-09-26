import { USER_SETTINGS } from '../../constants/user-settings.constants.js';
import { loadComponent } from '../../utils/loadComponent.js';
import { getUserSetting } from '../../utils/userSettingsStore.js';

export async function initSidebar(container) {
	const sidebarRoot = await loadComponent(
		'components/sidebar/sidebar.html',
		'components/sidebar/sidebar.css',
		container
	);

	const buttons = Array.from(sidebarRoot.querySelectorAll('button'));
	const pages = document.querySelectorAll('[data-page-section]');

	function showPage(pageName) {
		// hide all pages except the one requested
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

	// ---------- DEFAULT PAGE ----------
	const savedPage = getUserSetting(USER_SETTINGS.STARTING_PAGE, null);

	let targetButton;
	if (savedPage) {
		// find a sidebar button whose data-page matches the saved page
		targetButton = buttons.find(btn => btn.dataset.page === savedPage);
	}

	// fallback to first button if no saved setting or invalid
	if (!targetButton && buttons.length > 0) {
		targetButton = buttons[0];
	}

	// mark active + show page
	if (targetButton) {
		targetButton.classList.add('active');
		showPage(targetButton.dataset.page);
	}
}
