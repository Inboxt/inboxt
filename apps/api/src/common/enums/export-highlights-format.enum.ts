import { registerEnumType } from '@nestjs/graphql';

export enum ExportHighlightsFormat {
	HTML = 'html',
	MARKDOWN = 'markdown',
	TEXT = 'text',
}

registerEnumType(ExportHighlightsFormat, {
	name: 'ExportHighlightsFormat',
	description: 'Possible export request highlights format',
});
