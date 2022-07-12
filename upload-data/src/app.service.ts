import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
@Injectable()
export class AppService {
    constructor(private readonly httpService: HttpService) { }

    /**
     * This method is used to hit mutation on federation
     * @param studentData 
     * @returns 
     */
    uploadStudentData(studentData: any) {
        const url = 'http://localhost:3000/graphql';
        const data = JSON.stringify({
            query: `mutation CreateStudent($passedValue: CreateStudentInput!) { 
                createStudent(createStudentInput: $passedValue) {   id  name    age   dob    email }}`,
            variables: {
                passedValue: {
                    name: studentData.name,
                    dob: studentData.dob,
                    email: studentData.email
                }
            },
        });

        const options = {
            headers: {
                'Content-Type': 'application/json',
            },
        };
        return this.httpService.post(url, data, options);
    }

    /**
     * This method is used to notify the front end by socket to refresh data.
     * @returns 
     */
    emitNotification() {
        const url = 'http://localhost:3000/graphql';
        const data = JSON.stringify({
            query: `query {
                NotifyData {
                  message
                }}
              `,
        });

        const options = {
            headers: {
                'Content-Type': 'application/json',
            },
        };
        return this.httpService.post(url, data, options);
    }
}


