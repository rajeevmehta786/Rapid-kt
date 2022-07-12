import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QueueController } from './queue/queue.controller';
import { UploadProcessor } from './queue/upload.processor';
import { BullModule } from '@nestjs/bull';
import { HttpModule, HttpService } from '@nestjs/axios';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'uploadStudentRecords',
    }),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [AppController, QueueController],
  providers: [AppService, UploadProcessor],
})
export class AppModule { }
