import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { createReadStream, promises as fs } from 'fs';
import { parse as csvParse } from 'csv-parse';
import dayjs from 'dayjs';
import unzipper from 'unzipper';
import fg from 'fast-glob';
import crypto from 'crypto';

import { APP_PRIMARY_COLOR, USER_LABELS_LIMIT } from '@inboxt/common';

import { LabelService } from '../saved-item/entities/label/label.service';
import { ImportType } from '../../common/enums/import-type.enum';
import { UserService } from '../user/user.service';
import { SavedItemManagerService } from '../../managers/saved-item-manager/saved-item-manager.service';

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
		private userService: UserService,
		private labelService: LabelService,
		private savedItemManagerService: SavedItemManagerService,
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
		const map = new Map<string, string>(byName);

		for (const l of labelsFromExport) {
			const name = l.name.trim();
			if (!name) continue;
			if (map.has(name)) continue;

			if (count >= USER_LABELS_LIMIT) {
				this.logger.warn(`Label limit reached. Skipping label: ${name}`);
				continue;
			}

			const created = await this.labelService.create(userId, {
				name,
				color: l.color || APP_PRIMARY_COLOR,
			});

			count += 1;
			map.set(name, created.id);
		}

		return map;
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

		// Labels
		const labels = Array.isArray(itemJson.labels) ? itemJson.labels : [];
		const labelIds = labels
			.map((l) => labelNameToId.get(l.name.trim()))
			.filter(Boolean) as string[];

		// Content
		const htmlPath = `${itemDir}/content.html`;
		let html;

		try {
			html = await fs.readFile(htmlPath, 'utf8');
		} catch {}

		if (type === 'ARTICLE') {
			await this.savedItemManagerService.processAndCreateArticle(userId, { html }, labelIds, {
				title: itemJson.title ?? undefined,
				originalUrl: itemJson.originalUrl ?? undefined,
				sourceDomain: itemJson.sourceDomain ?? undefined,
				description: itemJson.description ?? undefined,
				leadImage: itemJson.leadImage ?? undefined,
				wordCount: typeof itemJson.wordCount === 'number' ? itemJson.wordCount : undefined,
				author: itemJson.author ?? undefined,
				status: itemJson.status || 'ACTIVE',
				createdAt: itemJson.createdAt ? new Date(itemJson.createdAt) : undefined,
			});
		} else {
			await this.savedItemManagerService.processAndCreateNewsletter(
				userId,
				null,
				null,
				{
					html,
				},
				{
					title: itemJson?.title ?? undefined,
					description: itemJson?.description ?? undefined,
					wordCount:
						typeof itemJson?.wordCount === 'number' ? itemJson?.wordCount : undefined,
					author: itemJson?.author ?? undefined,
				},
			);
		}
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

		const nameToId = await this.ensureLabels(
			data.userId,
			[...uniqueLabelNames].map((name) => ({ name, color: APP_PRIMARY_COLOR })),
		);

		for (const row of rows) {
			const url: string | null =
				row.url?.toString()?.trim() || row.URL?.toString()?.toString() || null;
			const readwiseChangelog = url?.includes('docs.readwise.io/changelog');
			if (!url || readwiseChangelog) {
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
		}

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

		const labelNameToId = await this.ensureLabels(
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

		for (const listing of itemsList) {
			const oldId = listing.id;
			const itemDir = `${baseDir}/saved_items/${oldId}`;
			const itemJson = await this.readJson<any>(itemDir, 'item.json');

			if (!itemJson) {
				this.logger.warn(`Missing item.json for saved_items/${oldId}, skipping`);
				continue;
			}

			try {
				await this.importSingleSavedItem({
					userId: data.userId,
					itemDir,
					itemJson,
					labelNameToId,
				});
			} catch (e: any) {
				this.logger.error(`Failed to import item ${oldId}: ${e?.message || e}`);
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
					const html = await fs.readFile(htmlPath, 'utf-8');
					const fileName = htmlPath.split('/').pop() || 'Imported.html';
					const baseName = fileName.replace(/\.html?$/i, '');
					const looksLikeNewsletter = /newsletter|email/i.test(baseName);

					const title = baseName || fileName;
					if (looksLikeNewsletter) {
						await this.savedItemManagerService.processAndCreateNewsletter(
							data.userId,
							null,
							null,
							{ html },
							{
								title,
							},
						);
					} else {
						await this.savedItemManagerService.processAndCreateArticle(
							data.userId,
							{ html },
							[],
							{
								title,
							},
						);
					}
				} catch (err: any) {
					this.logger.error(`Failed to process HTML file ${htmlPath}: ${err.message}`);
				}
			}
		}

		// Cleanup temp dir (best-effort)
		try {
			await fs.rm(baseDir, { recursive: true, force: true });
		} catch {}

		this.logger.log(
			`Zip archive import completed for user ${data.userId} from ${data.originalName}`,
		);

		return;
	}
}
