import { Field, ObjectType } from '@nestjs/graphql';
import { BaseModel } from '../../models/base.model';
import { HighlightSegment } from './highlight-segment.model';

@ObjectType()
export class Highlight extends BaseModel {
	@Field(() => [HighlightSegment])
	segments?: HighlightSegment[];
}
