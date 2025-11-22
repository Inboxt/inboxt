import { HttpStatus, Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';

import { MAX_ARTICLE_WORD_COUNT } from '@inboxt/common';

import { Prisma } from '../../../../../prisma/client';
import { PrismaService } from '../../../../services/prisma.service';
import { AppException } from '../../../../utils/app-exception';
import { ContentExtractionService } from '../../../../services/content-extraction.service';
import { QuotaOptions, StorageQuotaService } from '../../../storage/storage-quota.service';

export type ProcessArticleInput =
	| { url: string; html?: string }
	| { url?: string; html: string }
	| { url: string; html: string };

@Injectable()
export class ArticleService {
	constructor(
		private readonly prismaService: PrismaService,
		private contentExtractionService: ContentExtractionService,
		private storageQuota: StorageQuotaService,
	) {}

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

		if (!res.ok) {
			throw new AppException(
				`Fetch failed: ${res.status}`,
				HttpStatus.BAD_REQUEST,
				'FETCH_FAILED',
			);
		}

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

	async get(userId: string, query: Prisma.articleFindFirstArgs) {
		return this.prismaService.article.findFirst({
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

		return this.prismaService.$transaction(async (client) => run(client));
	}

	async parse(input: ProcessArticleInput) {
		let htmlFromUrl;
		let ogImage: string | null = null;
		if (input.url) {
			htmlFromUrl = await this.fetchHtml(input.url);
			ogImage = this.extractOgImage(htmlFromUrl, input.url);
		}

		const result = this.contentExtractionService.extractReadableContent(
			input.html || htmlFromUrl,
			{
				url: input.url,
				maxWords: MAX_ARTICLE_WORD_COUNT,
			},
		);

		return {
			leadImage: ogImage,
			...result,
		};
	}
}
