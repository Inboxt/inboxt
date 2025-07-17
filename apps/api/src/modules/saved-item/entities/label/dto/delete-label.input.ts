import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class DeleteLabelInput {
	@Field()
	id!: string;
}
