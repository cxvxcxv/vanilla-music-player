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
	const primaryColorInput = settingsRoot.querySelector(
		'#settings-primary-color'
	);
	const headerColor1Input = settingsRoot.querySelector(
		'#settings-header-color-1'
	);
	const headerColor2Input = settingsRoot.querySelector(
		'#settings-header-color-2'
	);

	// ---------- INIT ----------
	loadSavedSettings();

	// ---------- EVENT LISTENERS ----------
	startingPageSelect.addEventListener('change', e => {
		setUserSetting(USER_SETTINGS.STARTING_PAGE, e.target.value);
	});

	primaryColorInput.addEventListener('input', e => {
		const newColor = e.target.value;
		document.documentElement.style.setProperty('--primary-color', newColor);
		setUserSetting(USER_SETTINGS.PRIMARY_COLOR, newColor);
	});

	headerColor1Input.addEventListener('input', e => {
		const newColor = e.target.value;
		document.documentElement.style.setProperty('--header-color-1', newColor);
		setUserSetting(USER_SETTINGS.HEADER_COLOR_1, newColor);
	});

	headerColor2Input.addEventListener('input', e => {
		const newColor = e.target.value;
		document.documentElement.style.setProperty('--header-color-2', newColor);
		setUserSetting(USER_SETTINGS.HEADER_COLOR_2, newColor);
	});

	// ---------- HELPERS ----------
	function loadSavedSettings() {
		// starting page
		const savedPage = getUserSetting(USER_SETTINGS.STARTING_PAGE, 'search');
		startingPageSelect.value = savedPage;

		// primary color
		const primaryColor = getUserSetting(USER_SETTINGS.PRIMARY_COLOR, '#ff5656');
		document.documentElement.style.setProperty('--primary-color', primaryColor);
		primaryColorInput.value = primaryColor;

		// header colors
		const headerColor1 = getUserSetting(
			USER_SETTINGS.HEADER_COLOR_1,
			'#56ff9f'
		);
		const headerColor2 = getUserSetting(
			USER_SETTINGS.HEADER_COLOR_2,
			'#5656ff'
		);

		document.documentElement.style.setProperty(
			'--header-color-1',
			headerColor1
		);

		document.documentElement.style.setProperty(
			'--header-color-2',
			headerColor2
		);

		headerColor1Input.value = headerColor1;
		headerColor2Input.value = headerColor2;
	}
}
