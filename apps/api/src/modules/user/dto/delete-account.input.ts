import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class DeleteAccountInput {
	@Field()
	emailAddress!: string;
}
