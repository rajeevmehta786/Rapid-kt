import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class NotifyData {
  @Field(() => String, {nullable: true})
  message: string;
}
