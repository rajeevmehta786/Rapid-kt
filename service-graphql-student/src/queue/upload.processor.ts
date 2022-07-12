import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { StudentService } from 'src/student/student.service';

@Processor('uploadStudentRecords')
export class UploadProcessor {
  private readonly logger = new Logger(UploadProcessor.name);
  constructor(private readonly studentService: StudentService) { }

  @Process('fileData')
  async handlerCSVFiles(job: Job) {
    console.log('calling you');
    console.log((job || {}).data);
    if ((job || {}).data) {
      try {
        this.logger.log(job.data);
        const getData =  await this.studentService.createStudent({ ...job.data });
        console.log(getData);
      } catch (error) {
        this.logger.log(error);
        throw new Error(error);
      }
    }
    return {};
  }
}
