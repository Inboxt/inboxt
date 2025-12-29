import { Resolver, Args, Mutation, Query } from '@nestjs/graphql';

import { VOID_RESPONSE } from '~common/constants/void';
import { ActiveUserMeta, ActiveUserMetaType } from '~common/decorators/active-user-meta.decorator';
import { ApiTokenAllowed } from '~common/decorators/api-token.decorator';
import { Void } from '~common/models/void.model';

import { CreateLabelInput } from './dto/create-label.input';
import { DeleteLabelInput } from './dto/delete-label.input';
import { UpdateLabelInput } from './dto/update-label.input';
import { Label } from './label.model';
import { LabelService } from './label.service';

@Resolver(() => Label)
export class LabelResolver {
	constructor(private readonly labelService: LabelService) {}

	@ApiTokenAllowed()
	@Mutation(() => Label)
	async createLabel(
		@ActiveUserMeta() activeUser: ActiveUserMetaType,
		@Args('data') data: CreateLabelInput,
	) {
		return this.labelService.create(activeUser.id, data);
	}

	@ApiTokenAllowed()
	@Mutation(() => Label)
	async updateLabel(
		@ActiveUserMeta() activeUser: ActiveUserMetaType,
		@Args('data') data: UpdateLabelInput,
	) {
		const { id, ...input } = data;
		return this.labelService.update(activeUser.id, id, input);
	}

	@Mutation(() => Void)
	async deleteLabel(
		@ActiveUserMeta() activeUser: ActiveUserMetaType,
		@Args('data') data: DeleteLabelInput,
	) {
		await this.labelService.delete(activeUser.id, data.id);
		return VOID_RESPONSE;
	}

	@ApiTokenAllowed()
	@Query(() => [Label], { nullable: true })
	async labels(@ActiveUserMeta() activeUser: ActiveUserMetaType) {
		return this.labelService.getMany(activeUser.id, {});
	}
}
