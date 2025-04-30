import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class SignInInput {
	@Field()
	emailAddress!: string;

	@Field()
	password!: string;
}
