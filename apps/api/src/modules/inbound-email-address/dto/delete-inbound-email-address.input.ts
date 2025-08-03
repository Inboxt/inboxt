import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class DeleteInboundEmailAddressInput {
	@Field()
	id!: string;
}
