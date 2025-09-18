import {
	getHistoryTracks,
	removeHistoryTracks,
} from '../../utils/historyStore.js';
import { loadComponent } from '../../utils/loadComponent.js';
import { renderTrack } from '../track/track.js';

export async function initHistory(container) {
	const historyRoot = await loadComponent(
		'/components/history/history.html',
		'/components/history/history.css',
		container
	);

	const clearBtn = historyRoot.querySelector('#history-clear');
	const results = historyRoot.querySelector('#history-results');

	clearBtn.addEventListener('click', () => {
		removeHistoryTracks();
		renderHistoryList();
	});

	function renderHistoryList() {
		results.innerHTML = '';
		const tracks = getHistoryTracks();
		if (!tracks.length) {
			clearBtn.classList.add('hidden');
			results.innerHTML = '<h2>Your history is clear.</h2>';
			return;
		}

		clearBtn.classList.remove('hidden');
		tracks.forEach(async (track, index) => {
			const el = await renderTrack(track, index);
			results.appendChild(el);
		});
	}

	// initial render
	renderHistoryList();

	// refresh history list on every update
	document.addEventListener('historyUpdated', renderHistoryList);
}
