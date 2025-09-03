import { initPlayer } from './components/player/player.js';
import { initSearch } from './components/search/search.js';
import { initSidebar } from './components/sidebar/sidebar.js';

document.addEventListener('DOMContentLoaded', () => {
	initSearch(document.getElementById('search'));
	initSidebar(document.getElementById('sidebar'));
	initPlayer(document.getElementById('player'));
});
