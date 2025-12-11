export type JobStatus = 'pending' | 'saving' | 'saved' | 'error';

export type SaveJob = {
	id: string;
	status: JobStatus;
	error?: string | null;
	pageUrl?: string;
	title?: string;
	itemId?: string;
	labelIds: string[];
	tabId?: number;
};
