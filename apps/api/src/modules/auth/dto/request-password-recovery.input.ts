import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class RequestPasswordRecoveryInput {
	@Field()
	emailAddress!: string;
}
