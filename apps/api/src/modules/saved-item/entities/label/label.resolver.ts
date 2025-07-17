import { Resolver, Args, Mutation, Query } from '@nestjs/graphql';

import { Label } from './label.model';
import { LabelService } from './label.service';
import {
	ActiveUserMeta,
	ActiveUserMetaType,
} from '../../../../decorators/active-user-meta.decorator';
import { CreateLabelInput } from './dto/create-label.input';
import { UpdateLabelInput } from './dto/update-label.input';
import { DeleteLabelInput } from './dto/delete-label.input';
import { Void } from '../../../../models/void.model';
import { VOID_RESPONSE } from '../../../../constants/void';

@Resolver(() => Label)
export class LabelResolver {
	constructor(private labelService: LabelService) {}

	@Mutation(() => Label)
	async createLabel(
		@ActiveUserMeta() activeUser: ActiveUserMetaType,
		@Args('data') data: CreateLabelInput,
	) {
		return this.labelService.create(activeUser.userId, data);
	}

	@Mutation(() => Label)
	async updateLabel(@Args('data') data: UpdateLabelInput) {
		const { id, ...input } = data;
		return this.labelService.update(id, input);
	}

	@Mutation(() => Void)
	async deleteLabel(@Args('data') data: DeleteLabelInput) {
		await this.labelService.delete(data.id);
		return VOID_RESPONSE;
	}

	@Query(() => [Label], { nullable: true })
	async labels(@ActiveUserMeta() user: ActiveUserMetaType) {
		return this.labelService.getMany({ where: { userId: user.userId } });
	}
}
