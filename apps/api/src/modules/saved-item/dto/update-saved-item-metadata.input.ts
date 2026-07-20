import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateSavedItemMetadataInput {
	@Field()
	id!: string;

	@Field({ nullable: true })
	title?: string;

	@Field({ nullable: true })
	description?: string;

	@Field({ nullable: true })
	author?: string;
}
