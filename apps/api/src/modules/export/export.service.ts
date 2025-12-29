import { InjectQueue } from '@nestjs/bullmq';
import { HttpStatus, Injectable } from '@nestjs/common';
import archiver from 'archiver';
import { Queue } from 'bullmq';
import dayjs from 'dayjs';
import { PassThrough } from 'stream';

import { Prisma } from '@inboxt/prisma';

import { ExportHighlightsFormat } from '~common/enums/export-highlights-format.enum';
import { ExportType } from '~common/enums/export-type.enum';
import { SavedItemExportJson } from '~common/types';
import { AppException } from '~common/utils/app-exception';
import { renderHighlightsHtml } from '~common/utils/renderHighlightsHtml';
import { HighlightService } from '~modules/highlight/highlight.service';
import { InboundEmailAddressService } from '~modules/inbound-email-address/inbound-email-address.service';
import { LabelService } from '~modules/saved-item/entities/label/label.service';
import { NewsletterSubscriptionService } from '~modules/saved-item/entities/newsletter/newsletter-subscription/newsletter-subscription.service';
import { SavedItemService } from '~modules/saved-item/saved-item.service';
import { UserService } from '~modules/user/user.service';

import { RequestExportInput } from './dto/request-export.input';

type HighlightWithRelations = Prisma.highlightGetPayload<{
	include: { saved_item: true; highlight_segment: true };
}>;

type SavedItemWithRelations = Prisma.saved_itemGetPayload<{
	include: {
		article: true;
		newsletter: {
			include: { newsletter_subscription: true };
		};
		saved_item_label: { include: { label: true } };
	};
}>;

@Injectable()
export class ExportService {
	constructor(
		private readonly userService: UserService,
		private readonly savedItemService: SavedItemService,
		private readonly highlightService: HighlightService,
		private readonly labelService: LabelService,
		private readonly inboundEmailAddressService: InboundEmailAddressService,
		private readonly newsletterSubscriptionService: NewsletterSubscriptionService,
		@InjectQueue('export') private readonly exportQueue: Queue,
	) {}

	private async getData(userId: string) {
		const [user, savedItems, labels, inboundAddresses, subscriptions] = await Promise.all([
			this.userService.get({ where: { id: userId } }),
			this.savedItemService.getMany(userId, {
				include: {
					article: true,
					saved_item_label: { include: { label: true } },
					newsletter: { include: { newsletter_subscription: true } },
				},
			}) as Promise<SavedItemWithRelations[]>,
			this.labelService.getMany(userId, {}),
			this.inboundEmailAddressService.getMany(userId, {}),
			this.newsletterSubscriptionService.getMany(userId, {}),
			this.highlightService.getMany(userId, {}),
		]);

		const highlights = await this.getHighlights(userId);
		const userJson = user
			? {
					id: user.id,
					createdAt: user.createdAt,
					emailAddress: user.emailAddress,
					pendingEmailAddress: user.pendingEmailAddress ?? null,
					username: user.username ?? null,
					isEmailVerified: user.isEmailVerified,
					logins: user.logins,
					lastLogin: user.lastLogin ?? null,
					plan: user.plan,
				}
			: null;

		const savedItemsJson: SavedItemExportJson[] = savedItems.map((savedItem) => ({
			id: savedItem.id,
			createdAt: savedItem.createdAt,
			title: savedItem.title,
			originalUrl: savedItem.originalUrl ?? null,
			sourceDomain: savedItem.sourceDomain ?? null,
			description: savedItem.description ?? null,
			leadImage: savedItem.leadImage ?? null,
			wordCount: savedItem.wordCount ?? null,
			author: savedItem.author ?? null,
			type: savedItem.type,
			status: savedItem.status,
			deletedSince: savedItem.deletedSince ?? null,
			labels: savedItem.saved_item_label.map(({ label }) => ({
				id: label.id,
				createdAt: label.createdAt,
				name: label.name,
				color: label.color,
			})),
			contentHtml:
				savedItem.article?.contentHtml || savedItem.newsletter?.contentHtml || null,
			contentText:
				savedItem.article?.contentText || savedItem.newsletter?.contentText || null,
			messageId: savedItem.newsletter?.messageId ?? null,
			eventId: savedItem.newsletter?.eventId ?? null,
			inboundEmailAddressId: savedItem.newsletter?.inboundEmailAddressId ?? null,
			subscription: savedItem.newsletter?.newsletter_subscription?.name ?? null,
		}));

		const labelsJson = labels.map((label) => ({
			id: label.id,
			createdAt: label.createdAt,
			name: label.name,
			color: label.color || null,
		}));

		const inboundAddressesJson = inboundAddresses.map((inboundAddress) => ({
			id: inboundAddress.id,
			createdAt: inboundAddress.createdAt,
			deletedAt: inboundAddress.deletedAt ?? null,
			localPart: inboundAddress.localPart,
			fullAddress: inboundAddress.fullAddress,
		}));

		const subscriptionsJson = subscriptions.map((subscription) => ({
			id: subscription.id,
			createdAt: subscription.createdAt,
			status: subscription.status,
			name: subscription.name,
			lastReceivedAt: subscription.lastReceivedAt ?? null,
			unsubscribeUrl: subscription.unsubscribeUrl ?? null,
			unsubscribeAttemptedAt: subscription.unsubscribeAttemptedAt ?? null,
			inboundEmailAddressId: subscription.inboundEmailAddressId,
		}));

		return {
			userJson,
			savedItems,
			savedItemsJson,
			articlesCount: savedItems.filter((savedItem) => savedItem.article).length,
			newslettersCount: savedItems.filter((savedItem) => savedItem.newsletter).length,
			labelsJson,
			inboundAddressesJson,
			subscriptionsJson,
			highlights,
		};
	}

	private async getHighlights(userId: string) {
		return (await this.highlightService.getMany(userId, {
			include: {
				saved_item: true,
				highlight_segment: true,
			},
		})) as unknown as HighlightWithRelations[];
	}

	private formatHighlights(
		highlights: Array<{
			text: string;
			savedItemTitle: string;
			savedItemUrl?: string;
			createdAt: Date;
		}>,
		format: ExportHighlightsFormat,
	): { filename: string; mime: string; content: string } {
		const ts = dayjs().format('YYYYMMDD_HHmmss');

		if (format === ExportHighlightsFormat.TEXT) {
			const body = highlights
				.map((highlight) => {
					const date = dayjs(highlight.createdAt).format('YYYY-MM-DD HH:mm [UTC]');
					const header = `${highlight.savedItemTitle}${highlight.savedItemUrl ? ` · ${highlight.savedItemUrl}` : ''} · ${date}`;
					return `${header}\n${highlight.text}\n`;
				})
				.join('\n---\n\n');

			return {
				filename: `highlights_${ts}.txt`,
				mime: 'text/plain; charset=utf-8',
				content: body,
			};
		}

		if (format === ExportHighlightsFormat.MARKDOWN) {
			const body = highlights
				.map((highlight) => {
					const date = dayjs(highlight.createdAt).format('YYYY-MM-DD HH:mm [UTC]');
					const titleLine = highlight.savedItemUrl
						? `### [${highlight.savedItemTitle}](${highlight.savedItemUrl})`
						: `### ${highlight.savedItemTitle}`;
					return `${titleLine}\n_${date}_\n\n> ${highlight.text.replace(/\n/g, '\n> ')}\n`;
				})
				.join('\n---\n\n');

			return {
				filename: `highlights_${ts}.md`,
				mime: 'text/markdown; charset=utf-8',
				content: body,
			};
		}

		// HTML
		return {
			filename: `highlights_${ts}.html`,
			mime: 'text/html; charset=utf-8',
			content: renderHighlightsHtml(highlights, ts),
		};
	}

	async buildZipForAll({
		userId,
		formatForHighlights,
	}: {
		userId: string;
		formatForHighlights: ExportHighlightsFormat;
	}): Promise<Buffer> {
		const data = await this.getData(userId);

		const allHighlightsFlat = data.highlights.map((highlight) => ({
			id: highlight.id,
			savedItemId: highlight.savedItemId ?? null,
			createdAt: highlight.createdAt,
			savedItemTitle: highlight.saved_item?.title || 'Unknown item',
			savedItemUrl: highlight.saved_item?.originalUrl || null,
			text: highlight.highlight_segment
				.map((s) => (s.text || '').replace(/\t/g, '').replace(/\n/g, ' '))
				.reverse()
				.join(''),
		}));

		const counts = {
			saved_items: data.savedItemsJson.length,
			articles: data.articlesCount,
			newsletters: data.newslettersCount,
			labels: data.labelsJson.length,
			highlights: data.highlights.length,
			inbound_email_addresses: data.inboundAddressesJson.length,
			newsletter_subscriptions: data.subscriptionsJson.length,
		};

		const metadata = {
			user_id: userId,
			counts,
			generated_at: dayjs().toISOString(),
		};

		const archive = archiver('zip', { zlib: { level: 9 } });
		const out = new PassThrough();
		const chunks: Buffer[] = [];
		out.on('data', (c) => chunks.push(c));
		const finalizePromise = new Promise<Buffer>((resolve, reject) => {
			out.on('end', () => resolve(Buffer.concat(chunks)));
			out.on('error', reject);
		});

		archive.pipe(out);

		// metadata.json
		archive.append(JSON.stringify(metadata, null, 2), { name: 'metadata.json' });

		// json/* canonical datasets
		archive.append(JSON.stringify(data.userJson, null, 2), { name: 'json/user.json' });

		archive.append(JSON.stringify(data.labelsJson, null, 2), { name: 'json/labels.json' });

		archive.append(JSON.stringify(data.inboundAddressesJson, null, 2), {
			name: 'json/inbound_email_addresses.json',
		});

		archive.append(JSON.stringify(data.subscriptionsJson, null, 2), {
			name: 'json/newsletter_subscriptions.json',
		});

		// all saved_items
		archive.append(JSON.stringify(data.savedItemsJson, null, 2), {
			name: 'saved_items/saved_items.json',
		});

		// saved_items.csv (flat export for CSV import)
		{
			const header = ['name', 'url', 'description', 'date', 'labels'];
			const escapeCsv = (v: string) => {
				const needsQuotes = /[",\n]/.test(v);
				const escaped = v.replace(/"/g, '""');
				return needsQuotes ? `"${escaped}"` : escaped;
			};
			const toCsvLine = (cols: string[]) => cols.map((c) => escapeCsv(c ?? '')).join(',');

			const rows: string[] = [];
			rows.push(header.join(','));
			for (const savedItem of data.savedItemsJson) {
				const name = savedItem.title ?? '';
				const url = savedItem.originalUrl ?? '';
				const description = savedItem.description ?? '';
				const date = savedItem.createdAt ? dayjs(savedItem.createdAt).toISOString() : '';
				const labels = (savedItem.labels ?? [])
					.map((l: { name: string }) => l?.name?.trim())
					.filter(Boolean)
					.join(',');
				rows.push(toCsvLine([name, url, description, date, labels]));
			}

			const csvContent = rows.join('\n');
			archive.append(csvContent, { name: 'saved_items/saved-items.csv' });
		}

		// saved_items/<id>/*
		for (const savedItem of data.savedItems) {
			const dir = `saved_items/${savedItem.id}`;
			const itemJson = {
				id: savedItem.id,
				createdAt: savedItem.createdAt,
				title: savedItem.title,
				originalUrl: savedItem.originalUrl ?? null,
				sourceDomain: savedItem.sourceDomain ?? null,
				description: savedItem.description ?? null,
				leadImage: savedItem.leadImage ?? null,
				wordCount: savedItem.wordCount ?? null,
				author: savedItem.author ?? null,
				type: savedItem.type,
				status: savedItem.status,
				deletedSince: savedItem.deletedSince ?? null,
				labels: savedItem.saved_item_label.map(({ label }) => ({
					id: label.id,
					createdAt: label.createdAt,
					name: label.name,
					color: label.color,
				})),
				contentHtml:
					savedItem.article?.contentHtml || savedItem.newsletter?.contentHtml || null,
				contentText:
					savedItem.article?.contentText || savedItem.newsletter?.contentText || null,
				messageId: savedItem.newsletter?.messageId ?? null,
				eventId: savedItem.newsletter?.eventId ?? null,
				inboundEmailAddressId: savedItem.newsletter?.inboundEmailAddressId ?? null,
				subscription: savedItem.newsletter?.newsletter_subscription?.name ?? null,
			};

			// json
			archive.append(JSON.stringify(itemJson, null, 2), { name: `${dir}/item.json` });

			// content files
			if (savedItem.article) {
				archive.append(savedItem.article.contentHtml || '', {
					name: `${dir}/content.html`,
				});
				archive.append(savedItem.article.contentText || '', { name: `${dir}/content.txt` });
			}

			if (savedItem.newsletter) {
				archive.append(savedItem.newsletter.contentHtml || '', {
					name: `${dir}/content.html`,
				});
				archive.append(savedItem.newsletter.contentText || '', {
					name: `${dir}/content.txt`,
				});
			}

			// per-item highlights
			const perItem = allHighlightsFlat.filter((h) => h.savedItemId === savedItem.id);
			if (perItem.length) {
				const formattedPerItem = this.formatHighlights(
					perItem.map((highlight) => ({
						text: highlight.text,
						savedItemTitle: highlight.savedItemTitle,
						savedItemUrl: highlight.savedItemUrl || undefined,
						createdAt: highlight.createdAt,
					})),
					formatForHighlights,
				);

				archive.append(formattedPerItem.content, {
					name: `${dir}/highlights${formattedPerItem.filename.slice(formattedPerItem.filename.lastIndexOf('.'))}`,
				});

				archive.append(JSON.stringify(perItem, null, 2), {
					name: `${dir}/highlights.json`,
				});
			}
		}

		const formatted = this.formatHighlights(
			allHighlightsFlat.map((highlight) => ({
				text: highlight.text,
				savedItemTitle: highlight.savedItemTitle,
				savedItemUrl: highlight.savedItemUrl || undefined,
				createdAt: highlight.createdAt,
			})),
			formatForHighlights,
		);

		archive.append(formatted.content, {
			name: `highlights/highlights${formatted.filename.slice(formatted.filename.lastIndexOf('.'))}`,
		});

		archive.append(
			JSON.stringify(
				allHighlightsFlat.map((highlight) => ({
					id: highlight.id,
					savedItemId: highlight.savedItemId,
					createdAt: highlight.createdAt,
					savedItemTitle: highlight.savedItemTitle,
					savedItemUrl: highlight.savedItemUrl || undefined,
					text: highlight.text,
				})),
				null,
				2,
			),
			{ name: 'highlights/highlights.json' },
		);

		await archive.finalize();
		return finalizePromise;
	}

	async exportData(userId: string, input: RequestExportInput) {
		if (input.type === ExportType.ALL) {
			const user = await this.userService.get({ where: { id: userId } });
			if (!user) {
				return;
			}

			if (user.lastExportAt && dayjs(user.lastExportAt).add(24, 'hour').isAfter(dayjs())) {
				throw new AppException(
					"You've already requested an export within the last 24 hours. Please try again later.",
					HttpStatus.BAD_REQUEST,
				);
			}

			await this.userService.recordExportRequest(userId, new Date());
			await this.exportQueue.add('export-all-data', {
				userId,
				email: user.emailAddress,
				formatForHighlights: input.formatForHighlights,
			});
			return;
		}

		const highlights = await this.getHighlights(userId);
		const allHighlightsFlat = highlights.map((highlight) => ({
			id: highlight.id,
			savedItemId: highlight.savedItemId ?? null,
			createdAt: highlight.createdAt,
			savedItemTitle: highlight.saved_item?.title || 'Unknown item',
			savedItemUrl: highlight.saved_item?.originalUrl || null,
			text: highlight.highlight_segment
				.map((s) => (s.text || '').replace(/\t/g, '').replace(/\n/g, ' '))
				.reverse()
				.join(''),
		}));

		const file = this.formatHighlights(
			allHighlightsFlat.map((highlight) => ({
				text: highlight.text,
				savedItemTitle: highlight.savedItemTitle,
				savedItemUrl: highlight.savedItemUrl || undefined,
				createdAt: highlight.createdAt,
			})),
			input.formatForHighlights,
		);

		const base64 = Buffer.from(file.content, 'utf8').toString('base64');
		return `data:${file.mime};base64,${base64}#filename=${encodeURIComponent(file.filename)}`;
	}
}
