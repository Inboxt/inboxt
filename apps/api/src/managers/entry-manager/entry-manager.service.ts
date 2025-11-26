import { HttpStatus, Injectable } from '@nestjs/common';
import { GetEntriesInput } from './dto/get-entries.input';
import { SavedItemService } from '../../modules/saved-item/saved-item.service';
import { HighlightService } from '../../modules/highlight/highlight.service';
import { EntryEdge } from './entry-connection';
import { SavedItemType } from '../../enums/saved-item-type.enum';
import { SavedItemStatus } from '../../enums/saved-item-status.enum';
import { AppException } from '../../utils/app-exception';
import { GetHighlightsQuery, GetSavedItemsQuery, ParsedQuery } from '../../common/types';

@Injectable()
export class EntryManagerService {
	constructor(
		private savedItemService: SavedItemService,
		private highlightService: HighlightService,
	) {}

	private parseQuery(q?: string): ParsedQuery {
		if (!q) {
			return {};
		}

		const result: ParsedQuery = {};
		const freeText: string[] = [];

		// split by spaces but respect quotes
		const parts: string[] = [];
		let buf = '';
		let inQuotes = false;

		for (let i = 0; i < q.length; i++) {
			const ch = q[i];
			if (ch === '"') {
				inQuotes = !inQuotes;
				buf += ch;
			} else if (ch === ' ' && !inQuotes) {
				if (buf.trim()) {
					parts.push(buf);
				}

				buf = '';
			} else {
				buf += ch;
			}
		}

		if (buf.trim()) {
			parts.push(buf);
		}

		parts.forEach((part) => {
			const [rawKey = '', ...rest] = part.split(':');
			const isNegated = rawKey.startsWith('-');
			const key = isNegated ? rawKey.slice(1) : rawKey;

			if (rest.length) {
				let value = rest.join(':').trim();

				// remove surrounding quotes for entire value
				if (value.startsWith('"') && value.endsWith('"') && value.length >= 2) {
					value = value.slice(1, -1);
				}

				if (key === 'label') {
					if (!result.labels) {
						result.labels = { and: [], not: [] };
					}

					// split by commas, but respect quotes
					const regex = /"([^"]+)"|([^,]+)/g;
					const matches: string[] = [];
					let m;
					while ((m = regex.exec(value)) !== null) {
						matches.push((m[1] || m[2] || '').trim());
					}

					if (isNegated) {
						result.labels.not!.push(...matches);
					} else {
						result.labels.and!.push(matches);
					}
				} else if (key === 'has' && value === 'highlights') {
					result.hasHighlights = !isNegated;
				} else if (key === 'saved') {
					const [from, to] = value.split(',');
					const saved: { from?: string; to?: string } = {};

					if (from && from !== '*') {
						saved.from = from;
					}

					if (to && to !== '*') {
						saved.to = to;
					}

					if (Object.keys(saved).length) {
						result.saved = saved;
					}
				} else if (key === 'site') {
					result.site = value.toLowerCase();
				} else if (['in', 'type'].includes(key)) {
					(result as any)[key] = value;
				} else {
					freeText.push(part);
				}
			} else {
				freeText.push(part);
			}
		});

		if (freeText.length) {
			result.text = freeText.join(' ');
		}

		return result;
	}

	async getMany(userId: string, input: GetEntriesInput) {
		const { q, sort } = input;
		const first = input?.first ?? 20;
		const after = input.after;

		const parsed = this.parseQuery(q);
		const {
			type: typeRaw = 'all',
			in: statusRaw,
			labels,
			hasHighlights,
			text,
			site,
			saved,
		} = parsed;

		if (text && text.length > 200) {
			throw new AppException(
				'Free text search is limited to 200 characters. Please try again with a shorter query.',
				HttpStatus.BAD_REQUEST,
			);
		}

		let savedItemsQuery: GetSavedItemsQuery | undefined;
		if (typeRaw === 'article' || typeRaw === 'newsletter' || typeRaw === 'all') {
			const status =
				statusRaw === 'inbox'
					? SavedItemStatus.ACTIVE
					: statusRaw === 'archive'
						? SavedItemStatus.ARCHIVED
						: statusRaw === 'trash'
							? SavedItemStatus.DELETED
							: undefined;

			const type =
				typeRaw === 'article'
					? SavedItemType.ARTICLE
					: typeRaw === 'newsletter'
						? SavedItemType.NEWSLETTER
						: undefined;

			savedItemsQuery = {
				first,
				after,
				type,
				status,
				labels,
				hasHighlights,
				text,
				source: site,
				saved,
				sort,
			};
		}

		let highlightsQuery: GetHighlightsQuery | undefined;
		if (typeRaw === 'highlight') {
			highlightsQuery = {
				first,
				after,
				text,
				source: site,
				saved,
				sort,
			};
		}

		const savedItemsResult = savedItemsQuery
			? await this.savedItemService.getPaginated(userId, savedItemsQuery)
			: { edges: [] };

		const highlightsResult = highlightsQuery
			? await this.highlightService.getPaginated(userId, highlightsQuery)
			: { edges: [] };

		const allContent: EntryEdge[] = [...savedItemsResult.edges, ...highlightsResult.edges];
		const edges = allContent.slice(0, first);

		return {
			edges,
			pageInfo: {
				hasNextPage: allContent.length > first,
				endCursor: edges.length ? edges[edges.length - 1]?.cursor : null,
			},
		};
	}
}
