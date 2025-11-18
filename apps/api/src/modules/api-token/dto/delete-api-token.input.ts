import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class DeleteApiTokenInput {
	@Field()
	id: string;
}
