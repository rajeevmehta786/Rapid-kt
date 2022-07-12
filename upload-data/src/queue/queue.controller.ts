import {
  Controller,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { Queue } from 'bull';
import { diskStorage } from 'multer';
import { InjectQueue } from '@nestjs/bull';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import * as lodash from 'lodash';
import * as excelToJson from 'convert-excel-to-json';


@Controller('/api/studentRecords')
export class QueueController {
  private readonly logger = new Logger(QueueController.name);
  constructor(
    @InjectQueue('uploadStudentRecords') private studentFileQueue: Queue,
  ) { }

  @Post('/uploadFile')
  @UseInterceptors(
    FileInterceptor('files', {
      storage: diskStorage({
        destination: './uploadFiles',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadCsv(@UploadedFile() file) {
    const filePath = process.cwd() + '/' + file.path;
    try {
      const result = await excelToJson({
        sourceFile: filePath,
        header: {
          rows: 1
        },
        columnToKey: {
          A: 'name',
          B: 'email',
          C: 'dob'
        }
      });
      const flatStudentRecords = [];
      // flatten array of array
      for (let key in (result || {})) {
        flatStudentRecords.push(...result[key])
      }
      // push student object to queue
      console.log('##### Adding to Queue #######');
      this.logger.log(JSON.stringify(flatStudentRecords));
      this.studentFileQueue.add(
        'fileData',
        flatStudentRecords,
        {
          delay: 5000,
          attempts: 3,
          backoff: 3000
        },
      );
      console.log('##### End #######');
      return { message: 'Records uploaded successfully' };
    } catch (error) {
      console.log(error);
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: error,
      },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
