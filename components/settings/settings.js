import { USER_SETTINGS } from '../../constants/user-settings.constants.js';
import { loadComponent } from '../../utils/loadComponent.js';
import {
	getUserSettings,
	setUserSetting,
} from '../../utils/userSettingsStore.js';

let startingPageSelect;

export async function initSettings(container) {
	const settingsRoot = await loadComponent(
		'/components/settings/settings.html',
		'/components/settings/settings.css',
		container
	);

	startingPageSelect = settingsRoot.querySelector(
		'#settings-starting-page-select'
	);

	startingPageSelect.addEventListener('change', () => {
		const currentValue = startingPageSelect?.value;

		if (!currentValue) return;

		setUserSetting(USER_SETTINGS.STARTING_PAGE, currentValue);
	});

	// initialize state
	loadSavedSettings();
}

function loadSavedSettings() {
	const userSettings = getUserSettings();
	console.log(userSettings);

	startingPageSelect.value = userSettings[USER_SETTINGS.STARTING_PAGE];
}
