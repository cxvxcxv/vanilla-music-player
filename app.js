import { initLiked } from './components/liked/liked.js';
import { initPlayer } from './components/player/player.js';
import { initSearch } from './components/search/search.js';
import { initSidebar } from './components/sidebar/sidebar.js';

document.addEventListener('DOMContentLoaded', async () => {
	await initPlayer(document.getElementById('player'));
	await initSearch(document.getElementById('search'));
	await initLiked(document.getElementById('liked'));
	await initSidebar(document.getElementById('sidebar'));
});
