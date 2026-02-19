export type RuntimeConfig = {
	appUrl: string;
	webErrorsDsn?: string;
};

export const runtimeConfig: RuntimeConfig = {
	appUrl: window.location.origin,
	webErrorsDsn: undefined,
};

export async function fetchRuntimeConfig() {
	try {
		const response = await fetch('/api/config');
		if (response.ok) {
			const config = await response.json();
			if (config.appUrl) {
				runtimeConfig.appUrl = config.appUrl;
			}
			if (config.webErrorsDsn) {
				runtimeConfig.webErrorsDsn = config.webErrorsDsn;
			}
		}
	} catch (err) {
		console.error('Failed to fetch runtime config', err);
	}
}
