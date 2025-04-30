import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateAccountInput {
	@Field()
	emailAddress!: string;

	@Field()
	username!: string;

	@Field()
	password!: string;
}
