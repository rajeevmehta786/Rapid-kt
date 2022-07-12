import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentResolver } from './student.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';
import { QueueController } from 'src/queue/queue.controller';
import { UploadProcessor } from 'src/queue/upload.processor';
import { BullModule } from '@nestjs/bull';
@Module({
  imports: [
    TypeOrmModule.forFeature([Student]),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'uploadStudentRecords',
    }),
  ],
  controllers: [QueueController],
  providers: [StudentResolver, StudentService, UploadProcessor],
})
export class StudentModule {}
