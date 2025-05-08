import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateAccountInput {
	@Field({ nullable: true })
	emailAddress?: string;

	@Field({ nullable: true })
	username?: string;

	@Field({ nullable: true })
	password?: string;
}
