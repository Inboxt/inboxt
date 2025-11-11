export const DEFAULT_PROCESSED_ITEM_TITLE = 'Unknown Title';
export const DEFAULT_PROCESSED_ITEM_CONTENT =
	'Sorry, we couldn’t process this content. Please try again later.';

export const ITEM_PROCESSING_BASE_TITLE = 'Processing item';
export const ITEM_PROCESSING_TITLE = (url: string) =>
	`${ITEM_PROCESSING_BASE_TITLE} from ${url}...`;
export const ITEM_PROCESSING_CONTENT = (domain: string) =>
	`Your article from ${domain} is being prepared for your reading library. We're removing ads, formatting content, and optimizing for readability.`;

export const NEWSLETTER_PROCESSING_TITLE = 'Processing newsletter...';
export const NEWSLETTER_PROCESSING_CONTENT =
	"Your newsletter is being prepared for your reading library. We're removing ads, formatting content, and optimizing for readability.";
