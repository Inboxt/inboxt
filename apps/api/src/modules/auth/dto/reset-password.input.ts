import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class ResetPasswordInput {
	@Field()
	password!: string;

	@Field()
	code!: string;

	@Field()
	emailAddress!: string;
}
