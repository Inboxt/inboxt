import { SavedItemStatus } from '../../enums/saved-item-status.enum';
import { SavedItemType } from '../../enums/saved-item-type.enum';
import { EntrySort } from '../../managers/entry-manager/dto/entry-sort.input';

export interface GetSavedItemsQuery {
	status?: SavedItemStatus;
	type?: SavedItemType;
	sort?: EntrySort;
	labels?: {
		and?: string[][];
		not?: string[];
	};
	text?: string;
	source?: string;
	hasHighlights?: boolean;
	saved?: { from?: string; to?: string };
	first?: number;
	after?: string;
}

export interface GetHighlightsQuery {
	sort?: EntrySort;
	text?: string;
	source?: string;
	saved?: { from?: string; to?: string };
	first?: number;
	after?: string;
}

export interface ParsedQuery {
	in?: string;
	type?: string;
	labels?: {
		and?: string[][]; // array of OR-groups that must all exist (AND of ORs)
		not?: string[]; // labels that must NOT exist
	};
	hasHighlights?: boolean;
	text?: string;
	site?: string;
	saved?: { from?: string; to?: string };
}

export type SavedItemExportJson = {
	id: string;
	createdAt: Date | string;
	title: string | null;
	originalUrl: string | null;
	sourceDomain: string | null;
	description: string | null;
	leadImage: string | null;
	wordCount: number | null;
	author: string | null;
	type: 'ARTICLE' | 'NEWSLETTER';
	status: string;
	deletedSince: Date | string | null;
	labels: Array<{
		id: string;
		createdAt: Date | string;
		name: string;
		color: string | null;
	}>;
	contentHtml: string | null;
	contentText: string | null;
	messageId: string | null;
	inboundEmailAddressId: string | null;
	subscription: string | null;
};
