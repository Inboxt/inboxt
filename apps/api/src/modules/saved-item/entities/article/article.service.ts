import { HttpStatus, Injectable } from '@nestjs/common';
import { Readability, isProbablyReaderable } from '@mozilla/readability';
import { JSDOM, VirtualConsole } from 'jsdom';
import * as cheerio from 'cheerio';
import { fetch } from 'undici';
import DOMPurify from 'dompurify';

import { Prisma } from '../../../../../prisma/client';
import { PrismaService } from '../../../../services/prisma.service';
import { AppException } from '../../../../utils/app-exception';
import { applyArticleDomainFilter } from '../../../../filters/articleDomainFilters';

@Injectable()
export class ArticleService {
	constructor(private readonly prismaService: PrismaService) {}

	/* ------------ Private Helpers ------------ */
	private async fetchHtml(url: string) {
		const res = await fetch(url, {
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
				Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
				'Accept-Language': 'en-US,en;q=0.5',
				Referer: 'https://www.google.com/',
			},
		});
		if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
		return res.text();
	}

	private extractOgImage(html: string, base: string): string | null {
		const $ = cheerio.load(html);
		const raw =
			$('meta[property="og:image"]').attr('content') ??
			$('meta[name="twitter:image"]').attr('content') ??
			$('link[rel="image_src"]').attr('href');

		if (!raw) return null;
		try {
			return new URL(raw, base).toString();
		} catch {
			return raw;
		}
	}

	private preprocessDom(dom) {
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
	}

	async get(query: Prisma.articleFindFirstArgs) {
		return this.prismaService.article.findFirst(query);
	}

	async create(
		savedItemId: number,
		data: Omit<Prisma.articleCreateInput, 'savedItemId' | 'saved_item'>,
	) {
		return this.prismaService.article.create({
			data: {
				...data,
				savedItemId,
			},
		});
	}

	async parse(url: string) {
		const html = await this.fetchHtml(url);
		const ogImage = this.extractOgImage(html, url);

		const virtualConsole = new VirtualConsole();
		const dom = new JSDOM(html, { url, virtualConsole });
		this.preprocessDom(dom);

		const doc = dom.window.document;
		const host = new URL(url).hostname;
		applyArticleDomainFilter(host, doc);

		const isReadable = isProbablyReaderable(doc);
		if (!isReadable) {
			throw new AppException(
				'Could not extract the article content. \n The page might be unsupported or does not contain a readable article. Please check the URL and try again. \n\n If this issue persists, please contact support for further assistance.',
				HttpStatus.BAD_REQUEST,
			);
		}

		const readerRes = new Readability(doc).parse();
		if (!readerRes) {
			throw new AppException(
				'Could not extract the article content. \n The page might be unsupported or does not contain a readable article. Please check the URL and try again. \n\n If this issue persists, please contact support for further assistance.',
				HttpStatus.BAD_REQUEST,
			);
		}

		const window = dom.window;
		const purify = DOMPurify(window);

		return {
			title: readerRes.title,
			contentHtml: readerRes?.content ? purify.sanitize(readerRes.content) : null,
			contentText: readerRes.textContent,
			description: readerRes.excerpt,
			leadImage: ogImage,
			wordCount: readerRes.textContent?.split(/\s+/)?.length || 0,
			author: readerRes.byline,
		};
	}
}
