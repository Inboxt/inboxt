export default defineContentScript({
	matches: ['<all_urls>'],
	main() {
		browser.runtime.onMessage.addListener(
			(message: { type: string }, _sender, sendResponse): boolean | void => {
				if (message.type !== 'capture_page_html') {
					return;
				}

				(async () => {
					try {
						const url = window.location.href;
						const html = document.documentElement.outerHTML;

						sendResponse({
							ok: true,
							url,
							html,
						});
					} catch (e: any) {
						sendResponse({
							ok: false,
							error: {
								message: e?.message ?? 'Failed to capture page HTML',
							},
						});
					}
				})();

				return true;
			},
		);
	},
});
