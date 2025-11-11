import { HttpStatus, Injectable } from '@nestjs/common';
import { JSDOM, VirtualConsole } from 'jsdom';
import { isProbablyReaderable, Readability } from '@mozilla/readability';
import DOMPurify, { WindowLike } from 'dompurify';

import { AppException } from '../utils/app-exception';
import { applyArticleDomainFilter } from '../filters/articleDomainFilters';
import { DEFAULT_PROCESSED_ITEM_TITLE } from '../common/constants/content-extraction.constants';

@Injectable()
export class ContentExtractionService {
	private preprocessDom(dom: JSDOM) {
		// Fix to make sure that headers are included in the final content from @mozilla/readability
		const document = dom.window.document;
		const headers = document.querySelectorAll('h1, h2, h3, h4, h5, h6');

		// Remove anchor links from the article
		headers.forEach((header) => {
			header.querySelectorAll('a[href^="#"]').forEach((anchor) => {
				while (anchor.firstChild) {
					header.insertBefore(anchor.firstChild, anchor);
				}
				anchor.remove();
			});
		});

		// Fixes for missing images in the content of @mozilla/readability
		document.querySelectorAll('[data-testid="ImageGraphicContainer"]').forEach((container) => {
			const img = container.querySelector('img');
			const nextFigcaption = container.nextElementSibling;

			if (img && nextFigcaption && nextFigcaption.tagName === 'FIGCAPTION') {
				const figure = document.createElement('figure');
				figure.appendChild(img.cloneNode(true));
				figure.appendChild(nextFigcaption.cloneNode(true));
				container.parentNode?.insertBefore(figure, container);
				container.remove();
				nextFigcaption.remove();
			}
		});

		// Normalize proxied/omnivore images to real source
		document.querySelectorAll('img').forEach((img) => {
			const omnivoreOrig = img.getAttribute('data-omnivore-original-src');
			const dataSrc = img.getAttribute('data-src');
			const dataImage = img.getAttribute('data-image');
			let chosenSrc: string | null = null;

			if (omnivoreOrig) {
				chosenSrc = omnivoreOrig;
			} else {
				const dataAttrs = img.getAttribute('data-attrs');
				if (dataAttrs) {
					try {
						const parsed = JSON.parse(dataAttrs);
						if (parsed?.src && typeof parsed.src === 'string') {
							chosenSrc = parsed.src;
						}
					} catch {
						// ignore malformed data-attrs
					}
				}
				// Squarespace / lazy-loaded patterns
				if (!chosenSrc && dataSrc) chosenSrc = dataSrc;
				if (!chosenSrc && dataImage) chosenSrc = dataImage;
			}

			const currentSrc = img.getAttribute('src') || '';
			const looksLikeOmnivoreProxy = /omnivore[-]?image[-]?cache|proxy-prod\.omnivore/i.test(
				currentSrc,
			);

			if (chosenSrc && (looksLikeOmnivoreProxy || !currentSrc)) {
				img.setAttribute('src', chosenSrc);
			}

			// Cleanup attributes
			img.removeAttribute('data-omnivore-original-src');
			img.removeAttribute('data-omnivore-anchor-idx');
			img.removeAttribute('data-attrs');
			img.removeAttribute('data-src');
			img.removeAttribute('data-image');
			img.removeAttribute('data-loader');
			img.removeAttribute('srcset');

			img.removeAttribute('loading');
			img.removeAttribute('decoding');
		});
	}

	private prepareDom = (html: string, url?: string) => {
		const virtualConsole = new VirtualConsole();
		const dom = new JSDOM(html, { url, virtualConsole });
		this.preprocessDom(dom);

		const window = dom.window;
		const doc = window.document;
		if (url) {
			const host = new URL(url).host;
			applyArticleDomainFilter(host, doc);
		}

		return {
			window,
			doc,
		};
	};

	private purifyAndSanitizeHtml = (html: string, window: WindowLike) => {
		const purify = DOMPurify(window);
		return purify.sanitize(html, {
			FORBID_TAGS: ['style', 'iframe', 'object', 'embed'],
			FORBID_ATTR: ['onerror', 'onclick', 'onload', 'style'],
		});
	};

	private buildFallbackDescription(text: string, maxLen = 160): string | null {
		const cleaned = (text || '')
			.replace(/\s+/g, ' ')
			.replace(/\u00A0/g, ' ')
			.trim();
		if (!cleaned) return null;

		// Prefer up to the end of the first sentence that fits
		const sentenceEnd = cleaned.search(/([.!?])\s/);
		if (sentenceEnd !== -1 && sentenceEnd + 1 <= maxLen) {
			const firstSentence = cleaned.slice(0, sentenceEnd + 1).trim();
			if (firstSentence.length >= 40) return firstSentence; // avoid too-short snippets
		}

		// Otherwise trim to maxLen without cutting a word
		if (cleaned.length <= maxLen) return cleaned;
		const slice = cleaned.slice(0, maxLen + 1);
		const lastSpace = slice.lastIndexOf(' ');
		const clipped = (
			lastSpace > 60 ? slice.slice(0, lastSpace) : cleaned.slice(0, maxLen)
		).trim();
		return clipped.endsWith('.') ? clipped : `${clipped}…`;
	}

	isProbablyReaderable = (html: string) => {
		const { doc } = this.prepareDom(html);
		return isProbablyReaderable(doc);
	};

	extractReadableContent(
		html: string,
		options: {
			url?: string;
			maxWords?: number;
			minWords?: number;
		} = {},
	) {
		const { window, doc } = this.prepareDom(html, options.url);

		const allText = doc.body?.textContent || '';
		const wordCount = allText.split(/\s+/).length;
		if (options.maxWords && wordCount > options.maxWords) {
			throw new AppException(
				'This content is too large to process safely. \n If you believe this is an error, please contact support for further assistance.',
				HttpStatus.BAD_REQUEST,
				'TOO_LARGE',
			);
		}

		if (options.minWords && wordCount < options.minWords) {
			throw new AppException(
				'This content does not contain enough readable text to be processed. \n If you believe this is an error, please contact support for further assistance.',
				HttpStatus.BAD_REQUEST,
				'TOO_SMALL',
			);
		}

		if (!isProbablyReaderable(doc)) {
			throw new AppException(
				'We were unable to extract the readable portion of this content. \n The page or document may not contain structured text, or it may be unsupported. \n\n Please check the source and try again. If the issue persists, contact support for assistance.',
				HttpStatus.BAD_REQUEST,
				'NOT_READABLE',
			);
		}

		const readabilityResult = new Readability(doc).parse();
		const sanitizedHtml = this.purifyAndSanitizeHtml(
			(readabilityResult?.content as string) || html,
			window,
		);

		const fallbackBaseText = readabilityResult?.textContent || allText?.trim() || '';
		const description =
			readabilityResult?.excerpt ||
			this.buildFallbackDescription(fallbackBaseText, 160) ||
			null;

		return {
			title: readabilityResult?.title || DEFAULT_PROCESSED_ITEM_TITLE,
			contentHtml: sanitizedHtml,
			contentText: readabilityResult?.textContent || null,
			description,
			author: readabilityResult?.byline || null,
			wordCount,
		};
	}
}
