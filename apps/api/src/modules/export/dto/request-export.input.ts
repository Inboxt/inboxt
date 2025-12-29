import { InputType, Field } from '@nestjs/graphql';

import { ExportHighlightsFormat } from '~common/enums/export-highlights-format.enum';
import { ExportType } from '~common/enums/export-type.enum';

@InputType()
export class RequestExportInput {
	@Field(() => ExportType)
	type!: ExportType;

	@Field(() => ExportHighlightsFormat)
	formatForHighlights!: ExportHighlightsFormat;
}
