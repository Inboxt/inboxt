import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { createReadStream, promises as fs } from 'fs';
import { parse as csvParse } from 'csv-parse';
import dayjs from 'dayjs';
import unzipper from 'unzipper';
import fg from 'fast-glob';
import crypto from 'crypto';

import { APP_PRIMARY_COLOR, USER_LABELS_LIMIT, MAX_ARTICLE_WORD_COUNT } from '@inboxt/common';

import { SavedItemService } from '../saved-item/saved-item.service';
import { LabelService } from '../saved-item/entities/label/label.service';
import { ImportType } from '../../common/enums/import-type.enum';
import { MAX_NEWSLETTER_WORD_COUNT, MIN_NEWSLETTER_WORD_COUNT } from '@inboxt/common';
import {
	DEFAULT_PROCESSED_ITEM_CONTENT,
	DEFAULT_PROCESSED_ITEM_TITLE,
	IMPORT_PROCESSED_ARTICLE_CONTENT,
	IMPORT_PROCESSED_NEWSLETTER_CONTENT,
	ITEM_PROCESSING_BASE_TITLE,
	ITEM_PROCESSING_TITLE,
} from '../../common/constants/content-extraction.constants';
import { MailService } from '../mail/mail.service';
import { UserService } from '../user/user.service';
import { SavedItemManagerService } from '../../managers/saved-item-manager/saved-item-manager.service';
import { ArticleService } from '../saved-item/entities/article/article.service';
import { ContentExtractionService } from '../../services/content-extraction.service';
import { NewsletterService } from '../saved-item/entities/newsletter/newsletter.service';
import { EMAIL_IMPORT_COMPLETED } from '../../common/constants/email.constants';
import { importCompletedTemplate } from '../../mail-templates/importCompletedTemplate';

type DiskSource = {
	kind: 'disk';
	path: string;
	originalName: string;
	mime: string;
	size: number;
};

@Injectable()
export class ImportService {
	protected readonly logger = new Logger(ImportService.name);
	constructor(
		private mail: MailService,
		private userService: UserService,
		private savedItemManagerService: SavedItemManagerService,
		private labelService: LabelService,
		private articleService: ArticleService,
		private savedItemService: SavedItemService,
		private contentExtractionService: ContentExtractionService,
		private newsletterService: NewsletterService,
		@InjectQueue('import') private readonly importQueue: Queue,
	) {}

	/* ======================== HELPERS ========================= */
	private randomDelay(min = 500, max = 2000) {
		const delay = Math.floor(min + Math.random() * (max - min));
		return new Promise((resolve) => setTimeout(resolve, delay));
	}

	private extractCsvLabels(row) {
		const uniqueLabelNames = new Set<string>();

		const labelsRaw = row.labels || row.tags || row.Tags || '';
		let labels: string[] = [];
		if (typeof labelsRaw === 'string') {
			const trimmed = labelsRaw.trim();
			if (trimmed === '[]') {
				labels = [];
			} else if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
				try {
					const parsed = JSON.parse(trimmed);
					if (Array.isArray(parsed)) {
						labels = parsed
							.map((v) => (typeof v === 'string' ? v.trim() : ''))
							.filter(Boolean);
					}
				} catch {
					labels = [];
				}
			} else {
				labels = trimmed
					.split(/[;,]/)
					.map((s) => s.trim())
					.filter(Boolean);
			}
		} else if (Array.isArray(labelsRaw)) {
			labels = labelsRaw.map((v) => (typeof v === 'string' ? v.trim() : '')).filter(Boolean);
		}

		for (const name of labels) {
			const normalized = name.trim();
			if (normalized) uniqueLabelNames.add(normalized);
		}

		return uniqueLabelNames;
	}

	private async unzipToTemp(zipPath: string): Promise<string> {
		const tmpBase = '/tmp';
		const dir = `${tmpBase}/inboxt_import_${Date.now()}_${crypto.randomUUID()}`;
		await fs.mkdir(dir, { recursive: true });
		await new Promise<void>((resolve, reject) => {
			createReadStream(zipPath)
				.pipe(unzipper.Extract({ path: dir }))
				.on('close', () => resolve())
				.on('error', reject);
		});
		return dir;
	}

	private async readJson<T>(baseDir: string, file: string): Promise<T | null> {
		try {
			const raw = await fs.readFile(`${baseDir}/${file}`, 'utf8');
			return JSON.parse(raw) as T;
		} catch {
			return null;
		}
	}

	private async ensureLabels(
		userId: string,
		labelsFromExport: Array<{ name: string; color?: string | null }>,
	) {
		const existing = await this.labelService.getMany(userId, {});
		const byName = new Map(existing.map((l) => [l.name, l.id]));

		let count = existing.length;
		let createdCount = 0;
		let failedCount = 0;
		const map = new Map<string, string>(byName);

		for (const l of labelsFromExport) {
			const name = l.name.trim();
			if (!name) continue;
			if (map.has(name)) continue;

			if (count >= USER_LABELS_LIMIT) {
				this.logger.warn(`Label limit reached. Skipping label: ${name}`);
				failedCount += 1;
				continue;
			}

			const created = await this.labelService.create(userId, {
				name,
				color: l.color || APP_PRIMARY_COLOR,
			});

			createdCount += 1;
			count += 1;
			map.set(name, created.id);
		}

		return {
			map,
			createdCount,
			failedCount,
		};
	}

	private async addArticleFromHtml(userId: string, savedItemId: string, html: string, data: any) {
		const parsed = this.contentExtractionService.extractReadableContent(html, {
			maxWords: MAX_ARTICLE_WORD_COUNT,
			url: data?.originalUrl || undefined,
			allowUnreadable: true,
		});

		await this.articleService.create(savedItemId, {
			contentHtml: parsed.contentHtml || DEFAULT_PROCESSED_ITEM_CONTENT,
			contentText: parsed.contentText || DEFAULT_PROCESSED_ITEM_CONTENT,
		});

		await this.savedItemService.update(userId, savedItemId, {
			title: data?.title || parsed.title || DEFAULT_PROCESSED_ITEM_TITLE,
			description: data?.description ?? parsed.description ?? null,
			wordCount: typeof data?.wordCount === 'number' ? data?.wordCount : parsed.wordCount,
			author: data?.author ?? parsed.author ?? null,
		});
	}

	private async addNewsletterFromHtml(
		userId: string,
		savedItemId: string,
		html: string,
		data: any,
	) {
		const parsed = this.contentExtractionService.extractReadableContent(html, {
			minWords: MIN_NEWSLETTER_WORD_COUNT,
			maxWords: MAX_NEWSLETTER_WORD_COUNT,
			allowUnreadable: true,
		});

		await this.savedItemService.update(userId, savedItemId, {
			title: data?.title || parsed.title || DEFAULT_PROCESSED_ITEM_TITLE,
			description: data?.description ?? parsed.description ?? null,
			wordCount: typeof data?.wordCount === 'number' ? data?.wordCount : parsed.wordCount,
			author: data?.author ?? parsed.author ?? null,
			type: 'NEWSLETTER',
		});

		await this.newsletterService.create(savedItemId, null, {
			contentHtml: parsed.contentHtml,
			contentText: parsed.contentText,
		});
	}

	private async importSingleSavedItem(params: {
		userId: string;
		itemDir: string;
		itemJson: any;
		labelNameToId: Map<string, string>;
	}) {
		const { userId, itemDir, itemJson, labelNameToId } = params;

		const type = itemJson?.type as 'ARTICLE' | 'NEWSLETTER';
		if (type !== 'ARTICLE' && type !== 'NEWSLETTER') {
			this.logger.warn(`Skipping item with invalid type: ${itemJson?.type}`);
			return { created: false };
		}

		const createdItem = await this.savedItemService.create(userId, {
			title: itemJson.title || ITEM_PROCESSING_TITLE(itemJson.originalUrl || 'unknown url'),
			originalUrl: itemJson.originalUrl ?? null,
			sourceDomain: itemJson.sourceDomain ?? null,
			description: itemJson.description ?? null,
			leadImage: itemJson.leadImage ?? null,
			wordCount: typeof itemJson.wordCount === 'number' ? itemJson.wordCount : 0,
			author: itemJson.author ?? null,
			type,
			status: itemJson.status || 'ACTIVE',
			createdAt: itemJson.createdAt ? new Date(itemJson.createdAt) : undefined,
			deletedSince: itemJson.deletedSince ? new Date(itemJson.deletedSince) : null,
		});

		// Labels
		const labels = Array.isArray(itemJson.labels) ? itemJson.labels : [];
		if (labels.length) {
			const ids = labels
				.map((l) => labelNameToId.get(l.name.trim()))
				.filter(Boolean) as string[];
			if (ids.length) {
				await this.savedItemService.setLabels(userId, createdItem.id, ids);
			}
		}

		// Content
		const htmlPath = `${itemDir}/content.html`;
		let html: string | null = null;

		try {
			html = await fs.readFile(htmlPath, 'utf8');
		} catch {}

		if (type === 'ARTICLE') {
			if (html) {
				await this.addArticleFromHtml(userId, createdItem.id, html, itemJson);
			} else {
				await this.articleService.create(createdItem.id, {
					contentHtml: IMPORT_PROCESSED_ARTICLE_CONTENT,
					contentText: IMPORT_PROCESSED_ARTICLE_CONTENT,
				});
			}
		} else {
			if (html) {
				await this.addNewsletterFromHtml(userId, createdItem.id, html, itemJson);
			} else {
				await this.newsletterService.create(createdItem.id, null, {
					contentHtml: IMPORT_PROCESSED_NEWSLETTER_CONTENT,
					contentText: IMPORT_PROCESSED_NEWSLETTER_CONTENT,
				});
			}
		}

		return { created: true, newSavedItemId: createdItem.id, importedType: type };
	}

	// ======================== IMPORTS =========================
	async enqueueImport(input: { userId: string; type: ImportType; source: DiskSource }) {
		if (input.type === ImportType.CSV) {
			await this.importQueue.add('import-csv', {
				userId: input.userId,
				filePath: input.source.path,
				originalName: input.source.originalName,
				mime: input.source.mime,
				size: input.source.size,
			});
			return;
		}

		if (input.type === ImportType.ZIP_ARCHIVE) {
			await this.importQueue.add('import-app-export', {
				userId: input.userId,
				filePath: input.source.path,
				originalName: input.source.originalName,
				mime: input.source.mime,
				size: input.source.size,
			});
			return;
		}
	}

	async importCsvFile(data: { userId: string; filePath: string; originalName: string }) {
		const user = await this.userService.get({ where: { id: data.userId } });
		if (!user) {
			return;
		}

		const stream = createReadStream(data.filePath);
		const parser = stream.pipe(
			csvParse({
				columns: true,
				skip_empty_lines: true,
				trim: true,
			}),
		);

		let articlesImportedCount = 0;
		let skippedCount = 0;

		let uniqueLabelNames = new Set<string>();
		const rows: any[] = [];
		for await (const row of parser) {
			rows.push(row);

			const url = row.url?.toString()?.trim() || row.URL?.toString()?.toString() || null;
			const readwiseChangelog = url?.includes('docs.readwise.io/changelog');
			if (!url || readwiseChangelog) {
				continue;
			}

			uniqueLabelNames = this.extractCsvLabels(row);
		}

		const {
			map: nameToId,
			createdCount: labelsCreatedCount,
			failedCount: labelsFailedCount,
		} = await this.ensureLabels(
			data.userId,
			[...uniqueLabelNames].map((name) => ({ name, color: APP_PRIMARY_COLOR })),
		);

		for (const row of rows) {
			const url = row.url?.toString()?.trim() || row.URL?.toString()?.toString() || null;
			const readwiseChangelog = url?.includes('docs.readwise.io/changelog');
			if (!url || readwiseChangelog) {
				skippedCount++;
				continue;
			}

			// Saved item fields
			const title =
				row.title?.toString()?.trim() ||
				row.name?.toString()?.trim() ||
				row.Title ||
				undefined;
			const description =
				row.description?.toString()?.trim() ||
				row.Selection?.toString()?.trim() ||
				undefined;

			const date = row.date || row.created || row['Saved date'] || undefined;
			const unixTimestamp = row.Timestamp || undefined;
			const parsedDate = date
				? dayjs(date).toDate()
				: typeof unixTimestamp === 'number'
					? dayjs.unix(unixTimestamp).toDate()
					: undefined;

			const labels = this.extractCsvLabels(row);
			const labelIds: string[] = [];
			for (const name of labels) {
				const id = nameToId.get(name.trim());
				if (id) labelIds.push(id);
			}

			await this.savedItemManagerService.addArticleFromUrl(data.userId, url, labelIds, {
				description,
				title,
				createdAt: parsedDate,
			});

			articlesImportedCount++;
		}

		await this.mail.sendTemplate({
			to: user.emailAddress,
			subject: EMAIL_IMPORT_COMPLETED.subject,
			template: importCompletedTemplate,
			templateData: {
				source: 'CSV file',
				articlesImportedCount,
				newslettersImportedCount: 0,
				skippedCount,
				labelsCreatedCount,
				labelsFailedCount,
			},
		});

		await this.randomDelay();
		this.logger.log(`CSV import completed for user ${data.userId} from ${data.originalName}`);
		return;
	}

	async importZipArchive(data: { userId: string; filePath: string; originalName: string }) {
		this.logger.log(
			`Zip archive import started for user ${data.userId} from ${data.originalName}`,
		);

		const user = await this.userService.get({ where: { id: data.userId } });
		if (!user) {
			return;
		}

		const baseDir = await this.unzipToTemp(data.filePath);
		const labelsJson =
			(await this.readJson<Array<{ id: string; name: string; color?: string | null }>>(
				baseDir,
				'json/labels.json',
			)) || [];

		const {
			map: labelNameToId,
			createdCount: labelsCreatedCount,
			failedCount: labelsFailedCount,
		} = await this.ensureLabels(
			data.userId,
			labelsJson.map((l) => ({ name: l.name, color: l.color || undefined })),
		);

		// saved_items/saved_items.json gives the list
		const itemsList =
			(await this.readJson<
				Array<{
					id: string;
					title: string;
					createdAt: string;
				}>
			>(baseDir, 'saved_items/saved_items.json')) || [];

		let articlesImportedCount = 0;
		let newslettersImportedCount = 0;
		let skippedCount = 0;

		for (const listing of itemsList) {
			const oldId = listing.id;
			const itemDir = `${baseDir}/saved_items/${oldId}`;
			const itemJson = await this.readJson<any>(itemDir, 'item.json');

			if (!itemJson) {
				this.logger.warn(`Missing item.json for saved_items/${oldId}, skipping`);
				skippedCount++;
				continue;
			}

			try {
				const res = await this.importSingleSavedItem({
					userId: data.userId,
					itemDir,
					itemJson,
					labelNameToId,
				});

				if (res.created && res.newSavedItemId) {
					if (res.importedType === 'ARTICLE') {
						articlesImportedCount += 1;
					} else {
						newslettersImportedCount += 1;
					}
				} else {
					skippedCount++;
				}
			} catch (e: any) {
				this.logger.error(`Failed to import item ${oldId}: ${e?.message || e}`);
				skippedCount++;
			}
		}

		// Other html files in zip archive
		const allHtmlFiles = await fg('**/*.html', {
			cwd: baseDir,
			absolute: true,
			ignore: ['json/**', 'highlights/**', 'saved_items/**'],
		});

		if (allHtmlFiles.length > 0) {
			this.logger.log(`Found ${allHtmlFiles.length} standalone HTML files to process`);

			for (const htmlPath of allHtmlFiles) {
				try {
					const htmlContent = await fs.readFile(htmlPath, 'utf-8');
					const fileName = htmlPath.split('/').pop() || 'Imported.html';
					const baseName = fileName.replace(/\.html?$/i, '');
					const looksLikeNewsletter = /newsletter|email/i.test(baseName);

					const title = baseName || fileName || ITEM_PROCESSING_BASE_TITLE;
					const createdItem = await this.savedItemService.create(data.userId, {
						title,
						type: 'ARTICLE',
						status: 'ACTIVE',
					});

					if (looksLikeNewsletter) {
						await this.addNewsletterFromHtml(data.userId, createdItem.id, htmlContent, {
							title,
						});

						newslettersImportedCount += 1;
					} else {
						await this.addArticleFromHtml(data.userId, createdItem.id, htmlContent, {
							title,
						});
						articlesImportedCount += 1;
					}
				} catch (err: any) {
					this.logger.error(`Failed to process HTML file ${htmlPath}: ${err.message}`);
					skippedCount++;
				}
			}
		}

		// Cleanup temp dir (best-effort)
		try {
			await fs.rm(baseDir, { recursive: true, force: true });
		} catch {}

		await this.mail.sendTemplate({
			to: user.emailAddress,
			subject: EMAIL_IMPORT_COMPLETED.subject,
			template: importCompletedTemplate,
			templateData: {
				source: 'Zip Archive',
				articlesImportedCount,
				newslettersImportedCount,
				skippedCount,
				labelsCreatedCount,
				labelsFailedCount,
			},
		});

		this.logger.log(
			`Zip archive import completed for user ${data.userId} from ${data.originalName}`,
		);

		return;
	}
}
