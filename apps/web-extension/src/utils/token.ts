const STORAGE_KEY = 'api_token_v1';

export async function getApiToken(): Promise<string | null> {
	try {
		const { [STORAGE_KEY]: token } = await browser.storage.local.get(STORAGE_KEY);
		return typeof token === 'string' && token.trim() ? token : null;
	} catch {
		return null;
	}
}

export async function setApiToken(token: string | null) {
	if (!token || !token.trim()) {
		await browser.storage.local.remove(STORAGE_KEY);
		return;
	}
	await browser.storage.local.set({ [STORAGE_KEY]: token.trim() });
}
