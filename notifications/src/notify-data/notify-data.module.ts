import { Module } from '@nestjs/common';
import { NotifyDataService } from './Notify-data.service';
import { NotifyDataResolver } from './Notify-data.resolver';
import { AppGateway } from '../app.gateway';

@Module({
  providers: [NotifyDataResolver, NotifyDataService, AppGateway]
})
export class NotifyDataModule {}
