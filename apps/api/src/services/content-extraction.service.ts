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

	prepareDom = (html: string, url?: string) => {
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

	purifyAndSanitizeHtml = (html: string, window: WindowLike) => {
		const purify = DOMPurify(window);
		return purify.sanitize(html, {
			FORBID_TAGS: ['style', 'iframe', 'object', 'embed'],
			FORBID_ATTR: ['onerror', 'onclick', 'onload', 'style'],
		});
	};

	extractReadableContent(
		html: string,
		options: {
			url?: string;
			maxWords?: number;
			minWords?: number;
			allowUnreadable?: boolean;
		} = {},
	) {
		const { window, doc } = this.prepareDom(html, options.url);

		const allText = doc.body?.textContent || '';
		const wordCount = allText.split(/\s+/).length;
		if (options.maxWords && wordCount > options.maxWords) {
			throw new AppException(
				'This content is too large to process safely. \n If you believe this is an error, please contact support for further assistance.',
				HttpStatus.BAD_REQUEST,
			);
		}

		if (options.minWords && wordCount < options.minWords) {
			throw new AppException(
				'This content does not contain enough readable text to be processed. \n If you believe this is an error, please contact support for further assistance.',
				HttpStatus.BAD_REQUEST,
			);
		}

		let readerRes;
		let withReadability = true;

		try {
			if (!options.allowUnreadable && !isProbablyReaderable(doc)) {
				throw new AppException(
					'We were unable to extract the readable portion of this content. \n The page or document may not contain structured text, or it may be unsupported. \n\n Please check the source and try again. If the issue persists, contact support for assistance.',
					HttpStatus.BAD_REQUEST,
				);
			}

			readerRes = new Readability(doc).parse();
		} catch (_err) {
			if (!options.allowUnreadable) {
				throw new AppException(
					'We were unable to extract the readable portion of this content. \n The page or document may not contain structured text, or it may be unsupported. \n\n Please check the source and try again. If the issue persists, contact support for assistance.',
					HttpStatus.BAD_REQUEST,
				);
			}

			readerRes = null;
			withReadability = false;
		}

		const sanitizedHtml = this.purifyAndSanitizeHtml(
			(readerRes?.content as string) || html,
			window,
		);

		return {
			title: readerRes?.title || DEFAULT_PROCESSED_ITEM_TITLE,
			contentHtml: sanitizedHtml,
			contentText: readerRes?.textContent || null,
			description: readerRes?.excerpt || null,
			author: readerRes?.byline || null,
			wordCount,
			withReadability,
		};
	}
}
