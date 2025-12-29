import { HttpStatus, Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';

import { MAX_ARTICLE_WORD_COUNT } from '@inboxt/common';
import { Prisma } from '@inboxt/prisma';

import { AppException } from '~common/utils/app-exception';
import { PrismaService } from '~modules/prisma/prisma.service';
import { QuotaOptions, StorageQuotaService } from '~modules/storage/storage-quota.service';
import { ContentExtractionService } from '~services/content-extraction.service';

export type ProcessArticleInput =
	| { url: string; html?: string }
	| { url?: string; html: string }
	| { url: string; html: string };

@Injectable()
export class ArticleService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly contentExtractionService: ContentExtractionService,
		private readonly storageQuota: StorageQuotaService,
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
						'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
					Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
					'Accept-Language': 'en-US,en;q=0.5',
					Referer: 'https://www.google.com/',
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
		opts?: QuotaOptions,
	) {
		const skipQuota = opts?.skipQuota ?? false;
		const run = async (client: Prisma.TransactionClient) => {
			const owner = await client.saved_item.findUnique({
				where: { id: savedItemId },
				select: { id: true, userId: true },
			});

			if (!owner) {
				throw new AppException('Saved item not found', HttpStatus.NOT_FOUND);
			}

			const sizeBytes = skipQuota
				? 0n
				: this.storageQuota.computeSizeBytes({
						contentHtml: data.contentHtml,
						contentText: data.contentText,
					});

			if (!skipQuota) {
				await this.storageQuota.ensureWithinQuota(owner.userId, sizeBytes);
			}

			const created = await client.article.create({
				data: { ...data, savedItemId, sizeBytes },
			});

			if (!skipQuota) {
				await this.storageQuota.incrementUsage(client, owner.userId, sizeBytes);
			}

			return created;
		};

		if (tx) {
			return run(tx);
		}

		return this.prisma.$transaction(async (client) => run(client));
	}

	async parse(input: ProcessArticleInput) {
		let htmlFromUrl: string | undefined;
		let ogImage: string | null = null;
		if (input.url) {
			htmlFromUrl = await this.fetchHtml(input.url);
			ogImage = this.extractOgImage(htmlFromUrl, input.url);
		}

		const sourceHtml = input.html || htmlFromUrl;
		if (!sourceHtml) {
			throw new AppException('No HTML content provided', HttpStatus.BAD_REQUEST);
		}

		if (input.url) {
			const { hostname } = new URL(input.url);
			const appHostname = process.env.WEB_URL ? new URL(process.env.WEB_URL).hostname : null;
			if (appHostname && hostname === appHostname) {
				throw new AppException(
					'This page is part of the Inboxt app and can’t be saved for later. Try saving articles from external sites instead.',
					HttpStatus.BAD_REQUEST,
					'APP_DOMAIN_BLOCKED',
				);
			}
		}

		const $ = cheerio.load(sourceHtml);
		$(
			'script, style, iframe, nav, footer, aside, .sidebar, .ad-container, noscript, svg, canvas',
		).remove();
		const cleanedHtml = $.html();

		const result = this.contentExtractionService.extractReadableContent(cleanedHtml, {
			url: input.url,
			maxWords: MAX_ARTICLE_WORD_COUNT,
		});

		return {
			leadImage: ogImage,
			...result,
		};
	}
}
