const STORAGE_KEY = 'history-tracks';

export function getHistoryTracks() {
	const raw = localStorage.getItem(STORAGE_KEY);
	return raw ? JSON.parse(raw) : [];
}

export function setHistoryTracks(tracks) {
	return localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
}

export function addHistoryTrack(track) {
	const historyTracks = getHistoryTracks().filter(
		t => t.previewUrl !== track.previewUrl
	);
	historyTracks.push(track);
	setHistoryTracks(historyTracks);

	//notify others
	document.dispatchEvent(new Event('historyUpdated'));
}

export function removeHistoryTracks() {
	localStorage.setItem(STORAGE_KEY, []);
	return true;
}
