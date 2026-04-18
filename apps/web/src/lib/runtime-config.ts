export type RuntimeConfig = {
	appUrl: string;
	webErrorsDsn?: string;
	apiErrorsDsnConfigured: boolean;
};

export const runtimeConfig: RuntimeConfig = {
	appUrl: window.location.origin,
	webErrorsDsn: undefined,
	apiErrorsDsnConfigured: false,
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
			if (typeof config.apiErrorsDsnConfigured === 'boolean') {
				runtimeConfig.apiErrorsDsnConfigured = config.apiErrorsDsnConfigured;
			}
		}
	} catch (err) {
		console.error('Failed to fetch runtime config', err);
	}
}
