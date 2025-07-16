import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateLabelInput {
	@Field()
	id!: number;

	@Field()
	name: string;

	@Field()
	color: string;
}
