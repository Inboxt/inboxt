import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EntryManagerService } from './entry-manager.service';
import { EntrySortField } from './dto/entry-sort.input';

describe('EntryManagerService', () => {
	const mockSavedItemService = {
		getPaginated: vi.fn(),
	};
	const mockHighlightService = {
		getPaginated: vi.fn(),
	};

	const service = new EntryManagerService(
		mockSavedItemService as any,
		mockHighlightService as any,
	);

	describe('getMany', () => {
		beforeEach(() => {
			vi.clearAllMocks();
		});

		it('should pass correct filters to services for complex query', async () => {
			mockSavedItemService.getPaginated.mockResolvedValue({ edges: [] });
			mockHighlightService.getPaginated.mockResolvedValue({ edges: [] });

			await service.getMany('user1', {
				q: 'in:archive type:article label:Research sort:date_desc',
			});

			expect(mockSavedItemService.getPaginated).toHaveBeenCalledWith('user1', {
				first: 20,
				after: undefined,
				type: 'ARTICLE',
				status: 'ARCHIVED',
				labels: { and: [['Research']], not: [] },
				hasHighlights: undefined,
				noLabels: undefined,
				text: undefined,
				source: undefined,
				saved: undefined,
				sort: { field: 'createdAt', direction: 'desc' },
			});
		});

		it('should use sort from query and override input sort', async () => {
			mockSavedItemService.getPaginated.mockResolvedValue({ edges: [] });

			await service.getMany('user1', {
				q: 'sort:title_asc',
				sort: { field: EntrySortField.createdAt, direction: 'asc' as any } as any,
			});

			expect(mockSavedItemService.getPaginated).toHaveBeenCalledWith(
				expect.anything(),
				expect.objectContaining({
					sort: { field: 'title', direction: 'asc' },
				}),
			);
		});

		it('should throw error if text search is too long', async () => {
			const longText = 'a'.repeat(201);
			await expect(service.getMany('user1', { q: longText })).rejects.toThrow(
				'Free text search is limited to 200 characters.',
			);
		});

		it('should call highlight service when type is highlight', async () => {
			mockHighlightService.getPaginated.mockResolvedValue({ edges: [] });

			await service.getMany('user1', { q: 'type:highlight' });

			expect(mockHighlightService.getPaginated).toHaveBeenCalledWith(
				'user1',
				expect.objectContaining({
					sort: undefined,
				}),
			);
			expect(mockSavedItemService.getPaginated).not.toHaveBeenCalled();
		});
	});

	describe('parseQuery', () => {
		it('should parse simple label filters', () => {
			const result = (service as any).parseQuery('label:Coding');
			expect(result.labels).toEqual({
				and: [['Coding']],
				not: [],
			});
		});

		it('should parse negated label filters', () => {
			const result = (service as any).parseQuery('-label:News');
			expect(result.labels).toEqual({
				and: [],
				not: ['News'],
			});
		});

		it('should parse mixed label filters', () => {
			const result = (service as any).parseQuery('label:Coding -label:News');
			expect(result.labels).toEqual({
				and: [['Coding']],
				not: ['News'],
			});
		});

		it('should parse no:label filter', () => {
			const result = (service as any).parseQuery('no:label');
			expect(result.noLabels).toBe(true);
		});

		it('should parse no:labels (plural) alias', () => {
			const result = (service as any).parseQuery('no:labels');
			expect(result.noLabels).toBe(true);
		});

		it('should parse negated -no:label filter', () => {
			const result = (service as any).parseQuery('-no:label');
			expect(result.noLabels).toBe(false);
		});

		it('should parse negated -no:labels filter', () => {
			const result = (service as any).parseQuery('-no:labels');
			expect(result.noLabels).toBe(false);
		});

		it('should parse site filter', () => {
			const result = (service as any).parseQuery('site:github.com');
			expect(result.site).toBe('github.com');
		});

		it('should parse has:highlights filter', () => {
			const result = (service as any).parseQuery('has:highlights');
			expect(result.hasHighlights).toBe(true);
		});

		it('should handle complex queries with text', () => {
			const result = (service as any).parseQuery(
				'label:Tech,Dev "hello world" site:github.com no:label',
			);
			expect(result.labels.and).toEqual([['Tech', 'Dev']]);
			expect(result.site).toBe('github.com');
			expect(result.noLabels).toBe(true);
			expect(result.text).toBe('"hello world"');
		});

		it('should handle empty query', () => {
			expect((service as any).parseQuery('')).toEqual({});
			expect((service as any).parseQuery(undefined)).toEqual({});
		});

		describe('documentation examples', () => {
			it('should parse exact phrase search', () => {
				const result = (service as any).parseQuery('"weekly newsletter"');
				expect(result.text).toBe('"weekly newsletter"');
			});

			it('should parse location filters', () => {
				expect((service as any).parseQuery('in:archive').in).toBe('archive');
				const result = (service as any).parseQuery('in:trash "meeting notes"');
				expect(result.in).toBe('trash');
				expect(result.text).toBe('"meeting notes"');
			});

			it('should parse basic label search', () => {
				const result = (service as any).parseQuery('label:Newsletter');
				expect(result.labels.and).toEqual([['Newsletter']]);
			});

			it('should parse multiple labels (OR)', () => {
				const result = (service as any).parseQuery('label:Cooking,Fitness');
				expect(result.labels.and).toEqual([['Cooking', 'Fitness']]);
			});

			it('should parse multiple labels (AND)', () => {
				const result = (service as any).parseQuery('label:Newsletter label:Surfing');
				expect(result.labels.and).toEqual([['Newsletter'], ['Surfing']]);
			});

			it('should parse multi-word labels', () => {
				const result = (service as any).parseQuery('label:"Send to Obsidian"');
				expect(result.labels.and).toEqual([['Send to Obsidian']]);
			});

			it('should parse type filters', () => {
				expect((service as any).parseQuery('type:newsletter').type).toBe('newsletter');
				expect((service as any).parseQuery('type:highlight').type).toBe('highlight');
			});

			it('should parse has:highlights', () => {
				const result = (service as any).parseQuery('has:highlights label:Books');
				expect(result.hasHighlights).toBe(true);
				expect(result.labels.and).toEqual([['Books']]);
			});

			it('should parse site filter', () => {
				const result = (service as any).parseQuery('site:theverge.com');
				expect(result.site).toBe('theverge.com');
			});

			it('should parse saved date ranges', () => {
				// Items saved since a specific date
				let result = (service as any).parseQuery('saved:2022-04-21..*');
				expect(result.saved).toEqual({ from: '2022-04-21' });

				// Items saved between two dates
				result = (service as any).parseQuery('saved:2020-01-01..2022-02-02');
				expect(result.saved).toEqual({ from: '2020-01-01', to: '2022-02-02' });

				// Items saved before a specific date
				result = (service as any).parseQuery('saved:*..2020-01-01');
				expect(result.saved).toEqual({ to: '2020-01-01' });
			});

			it('should parse sort operators', () => {
				let result = (service as any).parseQuery('sort:date_desc');
				expect(result.sort).toEqual({ field: 'createdAt', direction: 'desc' });

				result = (service as any).parseQuery('sort:title_asc');
				expect(result.sort).toEqual({ field: 'title', direction: 'asc' });
			});

			it('should parse combined filters', () => {
				const result = (service as any).parseQuery(
					'in:archive type:article label:Research sort:date_desc',
				);
				expect(result.in).toBe('archive');
				expect(result.type).toBe('article');
				expect(result.labels.and).toEqual([['Research']]);
				expect(result.sort).toEqual({ field: 'createdAt', direction: 'desc' });
			});
		});
	});
});
