const STORAGE_KEY = 'user-settings';

export function getUserSettings() {
	const raw = localStorage.getItem(STORAGE_KEY);
	return raw ? JSON.parse(raw) : {};
}

export function setUserSettings(newSettings) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
}

export function getUserSetting(key, defaultValue) {
	const settings = getUserSettings();
	return settings[key] ?? defaultValue;
}

export function setUserSetting(key, value) {
	const settings = getUserSettings();
	settings[key] = value;
	setUserSettings(settings);
}
