import { Injectable } from '@nestjs/common';

import { Prisma } from '../../../prisma/client';

import { PrismaService } from '../../services/prisma.service';
import { CreateHighlightInput } from './dto/create-highlight.input';
import { DeleteHighlightInput } from './dto/delete-highlight.input';
import { AppException } from '../../utils/app-exception';

@Injectable()
export class HighlightService {
	constructor(private prisma: PrismaService) {}

	async get(query: Prisma.highlightFindFirstArgs) {
		return this.prisma.highlight.findFirst(query);
	}

	async getMany(query: Prisma.highlightFindManyArgs) {
		return this.prisma.highlight.findMany(query);
	}

	async getSegments(id: string) {
		return this.prisma.highlight_segment.findMany({
			where: { highlightId: id },
		});
	}

	async create(data: CreateHighlightInput, userId: string) {
		return this.prisma.$transaction(async (prisma) => {
			const highlight = await prisma.highlight.create({
				data: {
					savedItemId: data.savedItemId,
					userId,
				},
			});

			const segmentsData = data.segments.map((s) => ({
				highlightId: highlight.id,
				xpath: s.xpath,
				startOffset: s.startOffset,
				endOffset: s.endOffset,
				text: s.text ?? null,
				beforeText: s.beforeText,
				afterText: s.afterText,
			}));

			if (segmentsData.length) {
				await prisma.highlight_segment.createMany({ data: segmentsData });
			}

			return highlight;
		});
	}

	async delete(data: DeleteHighlightInput, userId: string) {
		const existingHighlight = await this.get({ where: { id: data.id } });
		if (
			!existingHighlight ||
			existingHighlight.userId !== userId ||
			existingHighlight.savedItemId !== data.savedItemId
		) {
			throw new AppException(
				'Highlight not found or you do not have permission to delete it',
			);
		}

		await this.prisma.highlight.delete({ where: { id: data.id } });
	}
}
