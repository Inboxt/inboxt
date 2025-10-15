import { registerEnumType } from '@nestjs/graphql';

export enum ExportType {
	HIGHLIGHTS = 'highlights',
	ALL = 'all',
}

registerEnumType(ExportType, {
	name: 'ExportType',
	description: 'Possible export request types',
});
