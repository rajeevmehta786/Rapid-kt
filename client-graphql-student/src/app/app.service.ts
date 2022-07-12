import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Student } from './model';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Apollo } from 'apollo-angular';
import { NotificationService } from '@progress/kendo-angular-notification';
import { GridDataResult } from "@progress/kendo-angular-grid";
import {
  GET_STUDENTS,
  CREATE_STUDENT,
  UPDATE_STUDENT,
  REMOVE_STUDENT,
} from './graphql.requests';
import { State } from '@progress/kendo-data-query';

@Injectable()
export class AppService extends BehaviorSubject<GridDataResult> {
  gridObj: GridDataResult;
  querySubscription: Subscription;
  gridStateService: State = {
    sort: [],
    skip: 0,
    take: 5,
  };

  constructor(
    private apollo: Apollo,
    private notificationService: NotificationService
  ) {
    super(<any>null);
  }


  readAllData(state: State): void {
    this.querySubscription = this.apollo
      .query<any>({
        query: GET_STUDENTS,
        variables: {
          limit: state.take,
          offset: state.skip
        },
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      })
      .pipe(catchError(this.handleError))
      .subscribe(({ data }) => {
        const records = <Student[]>(data || {}).getAllStudents || [];
        this.gridObj =  <GridDataResult>{
          data: records,
          total: (records[0] ||{}).totalCount || 0
        };
        super.next(this.gridObj);
      });
  }

  saveRecord(data: Student[], gridState: State, isNew?: boolean): void {
    this.reset();
    this.querySubscription = this.apollo
      .mutate({
        mutation: isNew ? CREATE_STUDENT : UPDATE_STUDENT,
        variables: {
          passedValue: { ...data },
        },
      })
      .pipe(catchError(this.handleError))
      .subscribe({
        next: () => {
          this.showSuccessNotification(
            'Successfully ' + (isNew ? 'added' : 'updated') + ' a record.'
          );
          this.readAllData(gridState); // call for data again
        },
        error: (error) => {
          console.log('there was an error sending saveRecord the query', error);
        },
      });
  }

  removeRecord(data: Student, gridState: State): void {
    this.reset();
    this.querySubscription = this.apollo
      .mutate({
        mutation: REMOVE_STUDENT,
        variables: {
          studentId: data.id,
        },
      })
      .pipe(catchError(this.handleError))
      .subscribe({
        next: ({
          data: {
            removeStudent: { id: idData },
          },
        }: any) => {
          if (idData) {
            this.showSuccessNotification('Successfully removed a record.');
            this.readAllData(gridState); // call for data again
          } else {
            console.log('Data is not deleted');
          }
        },
        error: (error) => {
          console.log('there was an error sending the remove query', error);
        },
      });
  }

  resetItem(dataItem: Student): void {
    if (!dataItem) return;
    // find original data item
    const originalDataItem = ((this.gridObj || {}).data || []).find((item) => item.id === dataItem.id);
    // revert changes
    Object.assign(originalDataItem || [], dataItem);
    super.next(this.gridObj);
  }

  reset() {
   this.gridObj.data = [];
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      this.showErrorNotification(error.error.message);
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` + `body was: ${error.error}`
      );
    }
    // return an observable with a user-facing error message
    return throwError('Something bad happened; please try again later.');
  }

  showSuccessNotification = (message: string) => {
    this.notificationService.show({
      content: message,
      hideAfter: 600,
      position: { horizontal: 'center', vertical: 'top' },
      animation: { type: 'fade', duration: 400 },
      type: { style: 'success', icon: true },
    });
  };

  showErrorNotification = (errorMsg: string) => {
    this.notificationService.show({
      content: errorMsg,
      hideAfter: 600,
      position: { horizontal: "center", vertical: "bottom" },
      animation: { type: "fade", duration: 400 },
      type: { style: "error", icon: true },
    });
  };

  showInfoNotification = (message: string): void => {
    this.notificationService.show({
      content: message,
      hideAfter: 800,
      position: { horizontal: "center", vertical: "bottom" },
      animation: { type: "fade", duration: 400 },
      type: { style: "info", icon: true },
    });
  }

  callSuperToPassData = () => {
   // super.next(this.data);
  }
}
