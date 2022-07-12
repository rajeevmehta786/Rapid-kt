import { OnQueueActive, OnQueueCompleted, OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { HttpException, HttpStatus, Logger, Scope } from '@nestjs/common';
import { Job } from 'bull';
import { AppService } from 'src/app.service';

@Processor('uploadStudentRecords')
export class UploadProcessor {
  private readonly logger = new Logger(UploadProcessor.name);
  constructor(private readonly appService: AppService) { }

  @Process('fileData')
  async handlerCSVFiles(job: Job) {
    console.log('## Started queue data processing ##');
    if ((job || {}).data) {
      try {
        this.logger.log(JSON.stringify((job || {}).data || []));
        const returnRecords = [];
        for (const studentObj of (job || {}).data || []) {
          const returnObj = await new Promise((resolve, reject) => {
            this.appService.uploadStudentData({ ...studentObj }).subscribe((response: any) => {
              if ((((response || {}).data || {}).data || {}).createStudent) {
                resolve(response.data.data.createStudent)
              } else {
                const err = 'There is an issue in creation mutation in upload service with user' + JSON.stringify(studentObj);
                resolve((((response || {}).data || {}).data || {}).errors || err);
                this.logger.log(err);
              }
            },
              (error) => {
                this.logger.log(error);
                return error;
              })
          });
          returnRecords.push(returnObj || []);
        }
        return returnRecords;
      } catch (error) {
        this.logger.log(error);
        throw new HttpException({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error,
        },
          HttpStatus.INTERNAL_SERVER_ERROR,
        )
      }
    }
    return 'There is no data in Job';
  }


  @OnQueueActive()
  onActive(job: Job) {
    console.log(
      `Processing job ${job.id} of type ${job.name} with data ${JSON.stringify((job || {}).data || [])}...`,
    );
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    console.log(
      `Completed job ${job.id} of type ${job.name} with data ${JSON.stringify(result)}...`,
    );
    this.appService.emitNotification().subscribe((data: any) => {
      console.log(((data || {}).data||{}).NotifyData || []); //
      this.logger.log('Emit notification is fired!!!!!'); 
    }); // send notification to front end by federation to notification service and use socket over there.

  }

  @OnQueueFailed()
  onFailed(job: Job, error: any) {
    console.log(
      `Error job ${job.id} of type ${job.name} with data ${error}...`,
    );
  }
}
