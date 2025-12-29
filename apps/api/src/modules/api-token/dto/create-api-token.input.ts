import { Field, InputType } from '@nestjs/graphql';

import { ApiTokenExpiry } from '~common/enums/api-token-expiry.enum';

@InputType()
export class CreateApiTokenInput {
	@Field()
	name: string;

	@Field(() => ApiTokenExpiry)
	expiry: ApiTokenExpiry;
}
