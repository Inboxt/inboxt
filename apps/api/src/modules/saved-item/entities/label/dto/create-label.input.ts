import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateLabelInput {
	@Field()
	name!: string;

	@Field()
	color!: string;
}
