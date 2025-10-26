import { InputType, Field } from '@nestjs/graphql';
import { ImportType } from '../../../common/enums/import-type.enum';

@InputType()
export class ImportInput {
	@Field(() => ImportType)
	type!: ImportType;

	@Field(() => File)
	file!: string;
}
