import { SaveJob } from '@/types';
import { graphqlFetch } from '@/utils/graphql.ts';

const ADD_ARTICLE_FROM_HTML_SNAPSHOT = `
  mutation AddArticleFromHtmlSnapshot($data: AddArticleFromHtmlSnapshotInput!) {
    addArticleFromHtmlSnapshot(data: $data)
  }
`;

const SET_SAVED_ITEM_LABELS = `
  mutation SetSavedItemLabels($data: SetSavedItemLabelsInput!) {
    setSavedItemLabels(data: $data) {
      success
    }
  }
`;

type SaveJobResponse =
	| { ok: true; jobId: string }
	| { ok: true; job: ReturnType<typeof serializeJob> }
	| { ok: false; error: { message: string } };

const jobs = new Map<string, SaveJob>();

function createJob(): SaveJob {
	const id = crypto.randomUUID();
	const job: SaveJob = {
		id,
		status: 'pending',
		error: null,
		labelIds: [],
	};
	jobs.set(id, job);
	return job;
}

function serializeJob(job: SaveJob) {
	return {
		id: job.id,
		status: job.status,
		error: job.error ?? null,
		pageUrl: job.pageUrl ?? null,
		title: job.title ?? null,
		itemId: job.itemId ?? null,
		labelIds: job.labelIds,
	};
}

function findActiveJobForTab(tabId: number): SaveJob | undefined {
	for (const job of jobs.values()) {
		if (job.tabId === tabId && (job.status === 'pending' || job.status === 'saving')) {
			return job;
		}
	}
	return undefined;
}

export default defineBackground(() => {
	browser.runtime.onMessage.addListener(
		(
			message:
				| { type: 'start_save_for_active_tab' }
				| { type: 'get_job_status'; jobId: string }
				| { type: 'set_item_labels'; jobId: string; labelIds: string[] },
			_sender,
			sendResponse,
		): boolean | void => {
			if (message.type === 'start_save_for_active_tab') {
				(async () => {
					let activeTab;
					try {
						const tabs = await browser.tabs.query({
							active: true,
							currentWindow: true,
						});
						activeTab = tabs[0];
					} catch (e: any) {
						sendResponse({
							ok: false,
							error: { message: `Failed to query tabs: ${e.message}` },
						});
						return;
					}

					if (!activeTab?.id) {
						try {
							const tabs = await browser.tabs.query({ active: true });
							activeTab = tabs.find((t) => t.id !== undefined) || tabs[0];
						} catch (e: any) {
							// Ignore query errors in fallback
						}
					}

					if (!activeTab?.id) {
						sendResponse({
							ok: false,
							error: { message: 'No active tab found' },
						});

						return;
					}

					const existingJob = findActiveJobForTab(activeTab.id);
					if (existingJob) {
						sendResponse({
							ok: true,
							jobId: existingJob.id,
						});

						return;
					}

					const job = createJob();
					job.tabId = activeTab.id;

					void (async () => {
						try {
							job.status = 'saving';

							const captureResponse = await (async () => {
								try {
									return await browser.tabs.sendMessage(activeTab.id!, {
										type: 'capture_page_html',
									});
								} catch (e: any) {
									if (e.message?.includes('Could not establish connection')) {
										return {
											ok: false,
											error: {
												message:
													'Content script not found. Please refresh the page and try again.',
											},
										};
									}
									return {
										ok: false,
										error: {
											message: `Tab communication failed: ${e.message}`,
										},
									};
								}
							})();

							if (!captureResponse?.ok) {
								job.status = 'error';
								job.error =
									captureResponse?.error?.message ??
									(captureResponse === undefined
										? 'Failed to capture page HTML (content script did not respond)'
										: 'Failed to capture page HTML');
								return;
							}

							const { url, html } = captureResponse;
							job.pageUrl = url;
							job.title = url;

							const data = await graphqlFetch<{
								addArticleFromHtmlSnapshot: string;
							}>(ADD_ARTICLE_FROM_HTML_SNAPSHOT, {
								data: { url, html },
							});

							const savedItemId = data.addArticleFromHtmlSnapshot;
							if (!savedItemId) {
								throw new Error('No id returned from addArticleFromHtmlSnapshot');
							}

							job.itemId = savedItemId;
							job.status = 'saved';
						} catch (err: unknown) {
							console.error('Save job failed:', err);
							job.status = 'error';
							if (err instanceof Error) {
								job.error = err.message;
							} else if (typeof err === 'string') {
								job.error = err;
							} else {
								job.error = 'Unexpected error';
							}
						}
					})();

					sendResponse({
						ok: true,
						jobId: job.id,
					});
				})();

				return true;
			}

			if (message.type === 'get_job_status') {
				const job = jobs.get(message.jobId);
				if (!job) {
					sendResponse({
						ok: false,
						error: { message: 'Job not found' },
					});
					return;
				}

				sendResponse({
					ok: true,
					job: serializeJob(job),
				});
				return;
			}

			if (message.type === 'set_item_labels') {
				const job = jobs.get(message.jobId);
				if (!job) {
					sendResponse({
						ok: false,
						error: { message: 'Job not found' },
					});
					return;
				}

				job.labelIds = message.labelIds;

				if (!job.itemId) {
					sendResponse({
						ok: true,
						job: serializeJob(job),
					});
					return;
				}

				(async () => {
					try {
						const data = await graphqlFetch<{
							setSavedItemLabels: { success: boolean };
						}>(SET_SAVED_ITEM_LABELS, {
							data: {
								id: job.itemId!,
								labelIds: job.labelIds,
							},
						});

						if (!data.setSavedItemLabels.success) {
							throw new Error('Failed to set labels');
						}

						sendResponse({
							ok: true,
							job: serializeJob(job),
						});
					} catch (err: unknown) {
						let message = 'Failed to update labels';

						if (err instanceof Error) {
							message = err.message;
						} else if (typeof err === 'string') {
							message = err;
						}

						job.error = message;
						sendResponse({
							ok: false,
							error: { message: job.error },
						});
					}
				})();

				return true;
			}
		},
	);
});
