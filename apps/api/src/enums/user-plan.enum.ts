import { registerEnumType } from '@nestjs/graphql';

export enum UserPlan {
	DEMO = 'DEMO',
	FREE = 'FREE',
}

registerEnumType(UserPlan, {
	name: 'userPlan',
	description: 'Current user plan',
});
