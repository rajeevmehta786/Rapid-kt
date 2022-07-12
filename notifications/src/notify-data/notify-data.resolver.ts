import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { NotifyDataService } from './Notify-data.service';
import { NotifyData } from './entities/notify-data.entity';

@Resolver(() => NotifyData)
export class NotifyDataResolver {
  constructor(private readonly NotifyDataService: NotifyDataService) { }
  @Query(() => NotifyData, { name: 'NotifyData' })
  getNotifyToClient() {
    return this.NotifyDataService.getNotifyToClient();
  }
}
