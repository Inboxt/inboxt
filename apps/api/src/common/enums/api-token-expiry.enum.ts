import { registerEnumType } from '@nestjs/graphql';

export enum ApiTokenExpiry {
	ONE_DAY = '1d',
	SEVEN_DAYS = '7d',
	THIRTY_DAYS = '30d',
	NINETY_DAYS = '90d',
	NEVER = 'never',
}

registerEnumType(ApiTokenExpiry, {
	name: 'ApiTokenExpiry',
	description: 'Token expiration presets',
});
