const STORAGE_KEY = 'app_url_v1';

export async function getAppUrl(): Promise<string | null> {
	try {
		const { [STORAGE_KEY]: url } = await browser.storage.local.get(STORAGE_KEY);
		return typeof url === 'string' && url.trim() ? url.trim() : null;
	} catch {
		return null;
	}
}

export async function setAppUrl(url: string | null) {
	if (!url || !url.trim()) {
		await browser.storage.local.remove(STORAGE_KEY);
		return;
	}
	// Normalize URL: remove trailing slash
	let normalizedUrl = url.trim();
	if (normalizedUrl.endsWith('/')) {
		normalizedUrl = normalizedUrl.slice(0, -1);
	}
	await browser.storage.local.set({ [STORAGE_KEY]: normalizedUrl });
}
