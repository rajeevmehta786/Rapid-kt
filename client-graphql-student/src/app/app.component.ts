import { Observable, Subscription } from 'rxjs';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  AddEvent,
  CancelEvent,
  EditEvent,
  GridComponent,
  GridDataResult,
  MultipleSortSettings,
  RemoveEvent,
  SaveEvent,
} from '@progress/kendo-angular-grid';
import { process, SortDescriptor, State } from '@progress/kendo-data-query';
import { Student } from './model';
import { map } from 'rxjs/operators';
import { AppService } from './app.service';
import { FileRestrictions, SuccessEvent, UploadEvent, UploadProgressEvent } from '@progress/kendo-angular-upload';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Socket } from 'ngx-socket-io';
import {
  PageChangeEvent,
  PagerPosition,
} from "@progress/kendo-angular-grid";
import { PagerType } from '@progress/kendo-angular-grid/pager/pager-settings';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  editService: AppService;
  editedRowIndex: number | undefined;
  view: Observable<GridDataResult> | undefined;
  uploadForm: FormGroup = new FormGroup({
    fileSource: new FormControl(),
  });
  gridState: State;
  formGroup: FormGroup | undefined;
  currentDateObj = new Date();
  defaultDateObj = new Date();
  emailPattern: RegExp =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  uploadFileRestrictions: FileRestrictions = {
    allowedExtensions: ['.xlsx'],
  };
  uploadSaveUrl = environment.uploadUrl;
  socketSubscription: Subscription;

  public info = true;
  public pageSizes = true;
  public previousNext = true;
  public position: PagerPosition = "bottom";
  public type: PagerType = "numeric";
  public sortSettings: MultipleSortSettings = {
    initialDirection: "asc",
    allowUnsort: true,
    showIndexes: true,
  };

  constructor(
    @Inject(AppService) editServiceFactory: () => AppService,
    private http: HttpClient,
    private socket: Socket
  ) {
    this.editService = editServiceFactory();
    this.gridState = this.editService.gridStateService;
  }

  ngOnInit(): void {
    this.defaultDateObj.setFullYear(new Date().getFullYear() - 1);
    this.view = this.editService;
    this.editService.readAllData(this.gridState);
    this.setSocketLayer();
  }

  ngOnDestroy(): void {
    if (this.editService.querySubscription) {
      this.editService.querySubscription.unsubscribe();
    }
    if (this.socketSubscription) {
      this.socketSubscription.unsubscribe();
    }
  }

  public pageChange({ skip, take }: PageChangeEvent): void {
    this.gridState.skip = skip;
    this.gridState.take = take;
    this.editService.readAllData(this.gridState);
   // this.editService.readAllData(this.gridState);
   // console.log('enter to page');
  }

  setSocketLayer = () => {
    this.socketSubscription = this.socket.fromEvent('reloadData').subscribe(
      { next: (data: any) => {

         if ((data || {}).reload) {
           this.editService.showInfoNotification('Records have been updated!');
          this.editService.readAllData(this.gridState);
         }
      }
    });
  }

  onStateChange = (state: State): void => {
   this.gridState = state;
  };

  addHandler = (args: AddEvent): void => {
    this.closeEditor(args.sender);
    this.formGroup = new FormGroup({
      name: new FormControl('', [
        Validators.required,
        Validators.maxLength(30),
      ]),
      email: new FormControl('', [
        Validators.required,
        Validators.maxLength(100),
        Validators.pattern(this.emailPattern),
      ]),
      dob: new FormControl(this.defaultDateObj, Validators.required),
    });
    args.sender.addRow(this.formGroup);
  };

  editHandler = (args: EditEvent): void => {
    const { dataItem } = args;
    this.closeEditor(args.sender);
    this.formGroup = new FormGroup({
      id: new FormControl(dataItem.id),
      name: new FormControl(dataItem.name, [
        Validators.required,
        Validators.maxLength(30),
      ]),
      email: new FormControl(dataItem.email, [
        Validators.required,
        Validators.maxLength(100),
        Validators.pattern(this.emailPattern),
      ]),
      dob: new FormControl(new Date(dataItem.dob), Validators.required),
    });
    this.editedRowIndex = args.rowIndex;
    args.sender.editRow(args.rowIndex, this.formGroup);
  };

  cancelHandler = (args: CancelEvent): void => {
    this.closeEditor(args.sender, args.rowIndex);
  };

  saveHandler = ({ sender, rowIndex, formGroup, isNew }: SaveEvent): void => {
    const studentRecords: Student[] = formGroup.getRawValue();
    this.editService.saveRecord(studentRecords, this.gridState, isNew);
    sender.closeRow(rowIndex);
  };

  removeHandler = (args: RemoveEvent): void => {
    this.editService.removeRecord(args.dataItem, this.gridState);
  };

  closeEditor = (grid: GridComponent, rowIndex = this.editedRowIndex) => {
    grid.closeRow(rowIndex);
    this.editedRowIndex = undefined;
    this.formGroup = undefined;
  };

  onBlurRemoveWhiteSpace = (formGroup: FormGroup, controlName: string) => {
    if (formGroup.get(controlName)) {
      const value = formGroup.get(controlName)?.value || '';
      formGroup.controls[controlName].setValue(value.trim());
    }
  };

  success(e: SuccessEvent): void {
    console.log(e);
    if (e.files[0].name) {
      const { body: { message: responseMsg } } = e.response;
      this.editService.showSuccessNotification(responseMsg || '');
    }
  }


  onSortChange = (e: SortDescriptor[]) => {
    console.log(e);
  }
}


