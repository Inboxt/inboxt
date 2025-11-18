import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateApiTokenInput {
	@Field()
	name: string;

	@Field(() => Date, { nullable: true })
	expiresAt?: Date;
}
