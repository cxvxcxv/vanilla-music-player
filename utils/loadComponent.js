import { BASE_PATH } from '../constants/app.constants.js';

export async function loadComponent(htmlPath, cssPath, container) {
	if (!container) {
		console.error('container not found');
		return;
	}

	try {
		const res = await fetch(BASE_PATH + htmlPath);
		if (!res.ok) {
			throw new Error(`Failed to fetch ${htmlPath}: ${res.status}`);
		}
		const html = await res.text();

		const temp = document.createElement('div');
		temp.innerHTML = html.trim();

		const newEl = temp.firstElementChild;
		if (!newEl) {
			throw new Error(`Component at ${htmlPath} is empty or invalid`);
		}

		container.replaceWith(newEl);

		if (
			cssPath &&
			!document.querySelector(`link[href="${BASE_PATH + cssPath}"]`)
		) {
			const link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = BASE_PATH + cssPath;
			document.head.appendChild(link);
		}

		return newEl;
	} catch (err) {
		console.error('Component load error:', err);
	}
}
