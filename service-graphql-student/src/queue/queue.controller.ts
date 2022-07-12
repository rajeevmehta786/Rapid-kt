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
import * as csv from 'csvtojson';
import * as lodash from 'lodash';
import * as excelToJson from 'convert-excel-to-json';


//@Controller('/api/studentRecords')
@Controller()
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
      const recordData = await csv().fromFile(filePath);
      // const result = await excelToJson({
      //   sourceFile: filePath,
      //   header:{
      //     rows: 1
      //  },
      //   columnToKey: {
      //     A: 'name',
      //     B: 'email',
      //     C: 'dob'
      // }
      // });
      // console.log(result);
     console.log(recordData);

      (recordData || []).forEach((userData) => {
        const modifiedObj = lodash.transform(
          userData,
          function (result, val, key) {
            result[key.toLowerCase()] = val;
          },
        );
        this.logger.log(modifiedObj);
        this.studentFileQueue.add(
          'fileData',
          { ...modifiedObj },
          {
            delay: 3000,
            attempts: 5,
            backoff: 3000
          },
        );
      });
      console.log('All students are added to the queue.');
      return { message: 'Records uploaded successfully' };
    } catch (error) {
      console.log(error);
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: error,
      },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      throw new Error(error);
    }
  }
}
