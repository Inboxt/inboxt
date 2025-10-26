export const DEFAULT_PROCESSED_ITEM_TITLE = 'Unknown Title';
export const DEFAULT_PROCESSED_ITEM_CONTENT = 'Sorry, we were unable to parse the content.';
export const ITEM_PROCESSING_BASE_TITLE = 'Processing item';
export const ITEM_PROCESSING_TITLE = (url: string) =>
	`${ITEM_PROCESSING_BASE_TITLE} from ${url}...`;
export const ITEM_PROCESSING_CONTENT = (domain: string) =>
	`Your article from ${domain} is being prepared for your reading library. We're removing ads, formatting content, and optimizing for readability. Once processing is complete, you'll be able to read it offline, highlight important sections, and add notes.`;

export const IMPORT_PROCESSED_ARTICLE_CONTENT = `${DEFAULT_PROCESSED_ITEM_CONTENT}. You can try to re-import again, or add it manually to the app using its URL.`;
export const IMPORT_PROCESSED_NEWSLETTER_CONTENT = `${DEFAULT_PROCESSED_ITEM_CONTENT}. You can forward the newsletter again to regenerate content.`;
