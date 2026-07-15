import { Field, Float, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateReadingProgressInput {
	@Field()
	id!: string;

	@Field(() => Float)
	progress!: number;
}
