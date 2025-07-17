import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateLabelInput {
	@Field()
	id!: string;

	@Field()
	name: string;

	@Field()
	color: string;
}
