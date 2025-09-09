const STORAGE_KEY = 'liked-tracks';

export function getLikedTracks() {
	const raw = localStorage.getItem(STORAGE_KEY);
	return raw ? JSON.parse(raw) : [];
}

export function getLikedTrack(url) {
	const likedTrack = getLikedTracks().some(track => track.previewUrl === url);
	return likedTrack;
}

export function setLikedTracks(tracks) {
	return localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
}

export function addLikedTrack(track) {
	const likedTracks = getLikedTracks();
	// avoid duplicates (based on previewUrl or trackId)
	if (!likedTracks.some(t => t.previewUrl === track.previewUrl)) {
		likedTracks.push(track);
		setLikedTracks(likedTracks);
	}
}

export function removeLikedTrack(url) {
	const likedTracks = getLikedTracks().filter(t => t.previewUrl !== url);
	setLikedTracks(likedTracks);
}

export function toggleLikedTrack(track) {
	const likedTracks = getLikedTracks();
	const exists = likedTracks.some(t => t.previewUrl === track.previewUrl);
	exists ? removeLikedTrack(track.previewUrl) : addLikedTrack(track);

	// notify others
	document.dispatchEvent(new Event('likedUpdated'));
}
