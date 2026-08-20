import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cheerio from 'cheerio';

import { Prisma } from '@inboxt/prisma';

import { AppException } from '~common/utils/app-exception';
import { Config } from '~config/index';
import { PrismaService } from '~modules/prisma/prisma.service';
import { ContentExtractionService } from '~services/content-extraction.service';

export type ProcessArticleInput =
	{ url: string; html?: string } | { url?: string; html: string } | { url: string; html: string };

@Injectable()
export class ArticleService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly contentExtractionService: ContentExtractionService,
		private readonly configService: ConfigService<Config>,
	) {}

	/* ------------ Private Helpers ------------ */
	private async fetchHtml(url: string) {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 30000); // time out after 30s

		try {
			const res = await fetch(url, {
				signal: controller.signal,
				headers: {
					'User-Agent':
						'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
					Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
					'Accept-Language': 'en-US,en;q=0.9',
					'Sec-Ch-Ua':
						'"Not;A=Brand";v="99", "Chromium";v="128", "Google Chrome";v="128"',
					'Sec-Ch-Ua-Mobile': '?0',
					'Sec-Ch-Ua-Platform': '"Windows"',
					'Sec-Fetch-Dest': 'document',
					'Sec-Fetch-Mode': 'navigate',
					'Sec-Fetch-Site': 'none',
					'Sec-Fetch-User': '?1',
					'Upgrade-Insecure-Requests': '1',
				},
			});

			clearTimeout(timeoutId);

			if (!res.ok) {
				throw new AppException(
					`Fetch failed: ${res.status}`,
					HttpStatus.BAD_REQUEST,
					'FETCH_FAILED',
				);
			}

			return res.text();
		} catch (error: any) {
			clearTimeout(timeoutId);
			if (error.name === 'AbortError') {
				throw new AppException(
					'The request timed out while trying to reach the website.',
					HttpStatus.REQUEST_TIMEOUT,
					'TIMEOUT',
				);
			}
			throw error;
		}
	}

	private extractOgImage(html: string, base: string): string | null {
		const $ = cheerio.load(html);
		const raw =
			$('meta[property="og:image"]').attr('content') ??
			$('meta[name="twitter:image"]').attr('content') ??
			$('link[rel="image_src"]').attr('href');

		if (!raw) {
			return null;
		}

		try {
			return new URL(raw, base).toString();
		} catch {
			return raw;
		}
	}

	async get(userId: string, query: Prisma.articleFindFirstArgs) {
		return this.prisma.article.findFirst({
			...query,
			where: {
				...query.where,
				saved_item: {
					userId,
				},
			},
		});
	}

	async create(
		savedItemId: string,
		data: Omit<Prisma.articleCreateInput, 'savedItemId' | 'saved_item'>,
		tx?: Prisma.TransactionClient,
	) {
		const run = async (client: Prisma.TransactionClient) => {
			const owner = await client.saved_item.findUnique({
				where: { id: savedItemId },
				select: { id: true, userId: true },
			});

			if (!owner) {
				throw new AppException('Saved item not found', HttpStatus.NOT_FOUND);
			}

			return client.article.create({
				data: { ...data, savedItemId },
			});
		};

		if (tx) {
			return run(tx);
		}

		return this.prisma.$transaction(async (client) => run(client));
	}

	async parse(input: ProcessArticleInput) {
		let htmlFromUrl: string | undefined;
		let ogImage: string | null = null;

		if (!input.html && input.url) {
			htmlFromUrl = await this.fetchHtml(input.url);
		}

		const sourceHtml = input.html || htmlFromUrl;
		if (!sourceHtml) {
			throw new AppException('No HTML content provided', HttpStatus.BAD_REQUEST);
		}

		if (input.url) {
			const { hostname } = new URL(input.url);
			const appUrl = this.configService.getOrThrow('appUrl', { infer: true });
			const appHostname = appUrl ? new URL(appUrl).hostname : null;

			if (appHostname && hostname === appHostname) {
				throw new AppException(
					'This page is part of the Inboxt app and can’t be saved for later. Try saving articles from external sites instead.',
					HttpStatus.BAD_REQUEST,
					'APP_DOMAIN_BLOCKED',
				);
			}

			ogImage = this.extractOgImage(sourceHtml, input.url);
		}

		const $ = cheerio.load(sourceHtml);
		$(
			'script, style, iframe, nav, footer, aside, .sidebar, .ad-container, noscript, svg, canvas',
		).remove();
		const cleanedHtml = $.html();

		const result = this.contentExtractionService.extractReadableContent(cleanedHtml, {
			url: input.url,
			maxWords: this.configService.get('content.articleMaxWordCount', { infer: true }),
		});

		return {
			leadImage: ogImage,
			...result,
		};
	}
}
