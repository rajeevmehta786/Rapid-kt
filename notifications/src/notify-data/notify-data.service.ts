import { ConsoleLogger, Injectable } from '@nestjs/common';
import { AppGateway } from 'src/app.gateway';

@Injectable()
export class NotifyDataService {
  constructor(private readonly appGateway: AppGateway) { }
  getNotifyToClient() {
    console.log('getting data');
    this.appGateway.wss.emit('reloadData', { reload: true })
    return { message: 'Reload to get new uploaded data' };
  }
}
