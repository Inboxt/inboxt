import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserStats {
	@Field()
	itemsReadCountAllTime!: number;

	@Field()
	itemsReadCountMonth!: number;

	@Field()
	itemsReadCountWeek!: number;

	@Field(() => Float)
	estimatedReadingTimeCompleted!: number;

	@Field()
	wordsReadCount!: number;

	@Field()
	unreadCount!: number;

	@Field()
	readCount!: number;

	@Field(() => Float)
	averageArticleLength!: number;

	@Field(() => Float, { nullable: true })
	averageTimeToFinish?: number;
}
