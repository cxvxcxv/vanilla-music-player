/**
 * @param {string} htmlPath - path to the component html file
 * @param {string} cssPath - path to the component css file
 * @param {HTMLElement} container - target container element (will be replaced)
 */
export async function loadComponent(htmlPath, cssPath, container) {
	try {
		// fetch html
		const res = await fetch(htmlPath);
		if (!res.ok) {
			throw new Error(`Failed to fetch ${htmlPath}: ${res.status}`);
		}
		const html = await res.text();

		// create a temporary wrapper to parse html string
		const temp = document.createElement('div');
		temp.innerHTML = html.trim();

		// grab first element (component root)
		const newEl = temp.firstElementChild;
		if (!newEl) {
			throw new Error(`Component at ${htmlPath} is empty or invalid`);
		}

		// replace container with the new element
		container.replaceWith(newEl);

		// inject css only once
		if (cssPath && !document.querySelector(`link[href="${cssPath}"]`)) {
			const link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = cssPath;
			document.head.appendChild(link);
		}

		return newEl; // return reference to new element in case caller needs it
	} catch (err) {
		console.error('Component load error:', err);
	}
}
