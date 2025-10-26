import { registerEnumType } from '@nestjs/graphql';

export enum ImportType {
	CSV = 'CSV',
	ZIP_ARCHIVE = 'ZIP_ARCHIVE',
}

registerEnumType(ImportType, {
	name: 'ImportType',
	description: 'Possible import types',
});
