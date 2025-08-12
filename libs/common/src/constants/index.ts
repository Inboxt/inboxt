// CONSTANTS
/** Maximum number of inbound email addresses a user can create */
export const USER_INBOUND_EMAIL_ADDRESS_LIMIT = 2;
/** Maximum number of labels a user can create */
export const USER_LABELS_LIMIT = 50;
/** Maximum word count for articles before they're considered too large */
export const MAX_ARTICLE_WORD_COUNT = 32000;
/** Minimum word count for newsletters to be considered valid content */
export const MIN_NEWSLETTER_WORD_COUNT = 100;
/** Maximum word count for newsletters before they're considered too large */
export const MAX_NEWSLETTER_WORD_COUNT = 32000;
/** Maximum number of labels displayed in the label selector */
export const MAX_VISIBLE_SELECTED_LABELS = 3;
/** Sort options for saved items. Backend uses a separate DTO structure with field and direction. */
export const SORT_OPTIONS = [
	{ value: 'date_desc', label: 'Date (newest first)' },
	{ value: 'date_asc', label: 'Date (oldest first)' },
	{ value: 'title_asc', label: 'Title (A–Z)' },
	{ value: 'title_desc', label: 'Title (Z–A)' },
] as const;
export const SORT_VALUES = SORT_OPTIONS.map((option) => option.value);
/** User max storage, saved in bytes  */
export const USER_MAX_STORAGE = 104857600;

// ENUMS
export enum AppViews {
	INBOX = 'inbox',
	NEWSLETTERS = 'newsletters',
	HIGHLIGHTS = 'highlights',
	ARCHIVE = 'archive',
	TRASH = 'trash',
	LABEL = 'label',
	SEARCH = 'search',
}
