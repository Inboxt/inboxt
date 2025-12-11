export default defineContentScript({
	matches: ['<all_urls>'],
	main() {
		browser.runtime.onMessage.addListener(
			(
				message: { type: string },
				_sender,
				_sendResponse,
			): Promise<
				| {
						ok: true;
						url: string;
						html: string;
				  }
				| {
						ok: false;
						error: { message: string };
				  }
			> | void => {
				if (message.type !== 'capture_page_html') {
					return;
				}

				return (async () => {
					try {
						const url = window.location.href;
						const html = document.documentElement.outerHTML;

						return {
							ok: true,
							url,
							html,
						};
					} catch (e: any) {
						return {
							ok: false,
							error: {
								message: e?.message ?? 'Failed to capture page HTML',
							},
						};
					}
				})();
			},
		);
	},
});
