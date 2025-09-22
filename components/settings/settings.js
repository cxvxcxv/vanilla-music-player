import { USER_SETTINGS } from '../../constants/user-settings.constants.js';
import { loadComponent } from '../../utils/loadComponent.js';
import {
	getUserSetting,
	setUserSetting,
} from '../../utils/userSettingsStore.js';

export async function initSettings(container) {
	const settingsRoot = await loadComponent(
		'/components/settings/settings.html',
		'/components/settings/settings.css',
		container
	);

	// cache elements
	const startingPageSelect = settingsRoot.querySelector(
		'#settings-starting-page'
	);
	const colorInput = settingsRoot.querySelector('#settings-primary-color');
	const themeToggle = settingsRoot.querySelector('#settings-theme');

	// ---------- INIT ----------
	loadSavedSettings();

	// ---------- EVENT LISTENERS ----------
	startingPageSelect.addEventListener('change', e => {
		setUserSetting(USER_SETTINGS.STARTING_PAGE, e.target.value);
	});

	colorInput.addEventListener('input', e => {
		const newColor = e.target.value;
		document.documentElement.style.setProperty('--primary-color', newColor);
		setUserSetting(USER_SETTINGS.PRIMARY_COLOR, newColor);
	});

	// themeToggle.addEventListener('change', e => {
	// 	const isDark = e.target.checked;
	// 	document.documentElement.classList.toggle('dark', isDark);
	// 	setUserSetting(USER_SETTINGS.THEME, isDark ? 'dark' : 'light');
	// });

	// ---------- HELPERS ----------
	function loadSavedSettings() {
		// starting page
		const savedPage = getUserSetting(USER_SETTINGS.STARTING_PAGE, 'search');
		startingPageSelect.value = savedPage;

		// primary color
		const savedColor = getUserSetting(USER_SETTINGS.PRIMARY_COLOR, '#ff5656');
		document.documentElement.style.setProperty('--primary-color', savedColor);
		colorInput.value = savedColor;

		// theme
		// const savedTheme = getUserSetting(USER_SETTINGS.THEME, 'light');
		// document.documentElement.classList.toggle('dark', savedTheme === 'dark');
		// themeToggle.checked = savedTheme === 'dark';
	}
}
