export async function fetchFromItunes(params) {
	try {
		const query = new URLSearchParams(params).toString();
		const res = await fetch(`https://itunes.apple.com/search?${query}`);
		return await res.json();
	} catch (error) {
		throw new Error(`API error: ${error}`);
	}
}
