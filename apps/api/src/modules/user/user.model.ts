import { ObjectType } from '@nestjs/graphql';
import { BaseModel } from '../../models/base.model';

@ObjectType({ isAbstract: true })
export class User extends BaseModel {}
