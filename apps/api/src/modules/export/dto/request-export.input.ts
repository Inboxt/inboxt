import { InputType, Field } from '@nestjs/graphql';
import { ExportType } from '../../../common/enums/export-type.enum';
import { ExportHighlightsFormat } from '../../../common/enums/export-highlights-format.enum';

@InputType()
export class RequestExportInput {
	@Field(() => ExportType)
	type!: ExportType;

	@Field(() => ExportHighlightsFormat)
	formatForHighlights!: ExportHighlightsFormat;
}
