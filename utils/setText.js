export function setText(el, selector, value) {
	const node = el.querySelector(selector);
	if (node) node.textContent = value;
}
