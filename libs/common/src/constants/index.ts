// CONSTANTS
// TODO: Should these limits be adjusted by .env variables?
/** Maximum word count for articles before they're considered too large */
export const MAX_ARTICLE_WORD_COUNT = 15000;
/** Minimum word count for newsletters to be considered valid content */
export const MIN_NEWSLETTER_WORD_COUNT = 100;
/** Maximum word count for newsletters before they're considered too large */
export const MAX_NEWSLETTER_WORD_COUNT = 15000;
/** Sort options for saved items. Backend uses a separate DTO structure with field and direction. */
export const SORT_OPTIONS = [
	{ value: 'date_desc', label: 'Date (newest first)' },
	{ value: 'date_asc', label: 'Date (oldest first)' },
	{ value: 'title_asc', label: 'Title (A–Z)' },
	{ value: 'title_desc', label: 'Title (Z–A)' },
] as const;
export const SORT_VALUES = SORT_OPTIONS.map((option) => option.value);

export const APP_PRIMARY_COLOR = '#55a57e';
// READER VIEW SETTINGS
/** theme settings */
export type ReaderThemeName = 'light' | 'dark' | 'sepia';
export type ReaderTheme = 'auto' | ReaderThemeName;

export type ReaderThemeTokens = {
	background: string;
	text: string;
	border: string;
	link: string | null;
	highlight: string;
};

export const READER_THEMES: Record<ReaderThemeName, ReaderThemeTokens> = {
	light: {
		background: '#ffffff',
		text: '#000000',
		border: 'var(--mantine-color-gray-4)',
		link: null,
		highlight: '#FFF9B0',
	},
	dark: {
		background: '#1A1B1E',
		text: '#C1C2C5',
		border: '#373A40',
		link: null,
		highlight: '#FFF9B0',
	},
	sepia: {
		background: '#f4ecd8',
		text: '#3b3a36',
		border: '#e3d7b9',
		link: null,
		highlight: '#ffec99',
	},
};

/** content settings */
export const MIN_READER_FONT_SIZE = 12;
export const MAX_READER_FONT_SIZE = 40;

export const READER_FONT_FAMILIES = ['Sans-serif', 'Serif', 'Monospace'] as const;
export const READER_FONT_WEIGHTS = ['Regular', 'Light', 'Bold'] as const;

export const READER_CONTENT_WIDTHS = [20, 25, 30, 37, 45, 50, 55, 60] as const; // em
export const MIN_READER_CONTENT_WIDTH = READER_CONTENT_WIDTHS[0];
export const MAX_READER_CONTENT_WIDTH = READER_CONTENT_WIDTHS[READER_CONTENT_WIDTHS.length - 1];

export const READER_LINE_HEIGHTS = [1, 1.2, 1.4, 1.55, 1.6, 1.8, 2, 2.2, 2.4, 2.6] as const;
export const MIN_READER_LINE_HEIGHT = READER_LINE_HEIGHTS[0];
export const MAX_READER_LINE_HEIGHT = READER_LINE_HEIGHTS[READER_LINE_HEIGHTS.length - 1];

export const READER_LETTER_SPACING = [0, 0.03, 0.06, 0.09, 0.12, 0.15, 0.18, 0.21, 0.24] as const;
export const MIN_READER_LETTER_SPACING = READER_LETTER_SPACING[0];
export const MAX_READER_LETTER_SPACING = READER_LETTER_SPACING[READER_LETTER_SPACING.length - 1];

export const READER_WORD_SPACING = [0, 0.03, 0.06, 0.09, 0.12, 0.15, 0.18, 0.21, 0.24] as const;
export const MIN_READER_WORD_SPACING = READER_WORD_SPACING[0];
export const MAX_READER_WORD_SPACING = READER_WORD_SPACING[READER_WORD_SPACING.length - 1];

export type ReaderContentSettings = {
	textSize: number; // px
	font: (typeof READER_FONT_FAMILIES)[number];
	fontWeight: (typeof READER_FONT_WEIGHTS)[number];
	contentWidth: (typeof READER_CONTENT_WIDTHS)[number]; // em
	lineHeight: (typeof READER_LINE_HEIGHTS)[number];
	letterSpacing: (typeof READER_LETTER_SPACING)[number]; // em
	wordSpacing: (typeof READER_WORD_SPACING)[number]; // em
	alignment: 'Left' | 'Center' | 'Right';
};

export const READER_DEFAULT_SETTINGS = {
	textSize: 16,
	font: 'Sans-serif' as const,
	fontWeight: 'Regular' as const,
	contentWidth: 45 as const,
	lineHeight: 1.55 as const,
	letterSpacing: 0 as const,
	wordSpacing: 0 as const,
	alignment: 'Left' as const,
};
