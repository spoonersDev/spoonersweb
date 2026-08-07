const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

export async function getPageContent(slug) {
	const response = await fetch(`${API_BASE_URL}/api/content/${encodeURIComponent(slug)}`);
	const contentType = response.headers.get("content-type") || "";

	if (!contentType.includes("application/json")) {
		const rawBody = await response.text();
		throw new Error(`Unerwartete API-Antwort: ${rawBody.slice(0, 80)}`);
	}

	const data = await response.json();

	if (!response.ok || !data.success) {
		throw new Error(data.message || "Inhalt konnte nicht geladen werden");
	}

	return data.content;
}
