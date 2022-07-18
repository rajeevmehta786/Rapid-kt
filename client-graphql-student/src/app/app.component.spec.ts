import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CancelEvent, GridComponent, PageChangeEvent, RemoveEvent } from '@progress/kendo-angular-grid';
import { SuccessEvent } from '@progress/kendo-angular-upload';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { SocketIoModule } from 'ngx-socket-io';
import { of } from 'rxjs';
import { AppComponent } from './app.component';
import { AppService } from './app.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let customResponse = [
    {
      id: 'fake-id',
      name: 'test',
      email: 'test@gmail.com',
      dob: '1991-12-06T18:29:50.000Z',
      totalCount: 1,
      age: 30
    }
  ];
  let fixture: ComponentFixture<AppComponent>;
  let appServiceSpy = jasmine.createSpyObj('appService', [
    'readAllData',
    'saveRecord',
    'removeRecord',
    'showSuccessNotification'
  ]);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ApolloTestingModule,
        HttpClientModule,
        SocketIoModule.forRoot({ url: 'http://localhost:3004', options: { transports: ['websocket'], reconnection: true } })
      ],
      providers: [
        {
          provide: AppService,
          useValue: () => appServiceSpy
        }
      ],
      declarations: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('#(*)# App service should be created ###', () => {
    expect(appServiceSpy).toBeTruthy();
  });

  it('#(*)# App component should be created ###', () => {
    component.ngOnInit();
    expect(component).toBeTruthy();
    expect(component).toBeDefined();
  });

  it('#(*)# All the students should be fetched ###', fakeAsync (() => {
    appServiceSpy.readAllData.and.returnValue(of({
      getAllStudents: [
        {
          id: 'fake-id',
          name: 'test',
          email: 'test@gmail.com',
          dob: '1991-12-06T18:29:50.000Z',
          totalCount: 1,
          age: 30
        }
      ]
    }));
    component.ngOnInit();
    appServiceSpy.readAllData().subscribe((response: any) => {
      expect(appServiceSpy.readAllData).toHaveBeenCalled();
      expect(response.getAllStudents).toEqual(customResponse);
      flush();
    });

  }));

  it('#(*)# A record should be removed ###', fakeAsync (() => {
    const payLoad = {
      dataItem: { id: 'fake-id' },
      isNew: false,
      rowIndex: 0
    }
    component.removeHandler(<any>payLoad);
    expect(appServiceSpy.removeRecord).toHaveBeenCalled();
  }));

  it('#(*)# A record should be saved ###', fakeAsync (() => {
    const formGroup = new FormGroup({
      id: new FormControl('fake-id'),
      name: new FormControl('test', [
        Validators.required,
        Validators.maxLength(30),
      ]),
      email: new FormControl('test@gmail.com', [
        Validators.required,
        Validators.maxLength(100)
      ]),
      dob: new FormControl(new Date('1991-12-06T18:29:50.000Z'), Validators.required),
    });
    const payload = {
      sender: {closeRow : () => {}},
      isNew: true,
      rowIndex: 0,
      formGroup: formGroup
    }
    component.saveHandler(<any>payload);
    expect(appServiceSpy.saveRecord).toHaveBeenCalled();
  }));

  it('#(*)# Add handler should add a row ###',  (() => {
    const formGroup = new FormGroup({
      name: new FormControl('', [
        Validators.required,
        Validators.maxLength(30),
      ]),
      email: new FormControl('', [
        Validators.required,
        Validators.maxLength(100)
      ]),
      dob: new FormControl(new Date(), Validators.required),
    });
    const payload = {
      sender: {closeRow : () => {}, addRow : () => {}},
      isNew: true,
      rowIndex: 0,
      formGroup: formGroup
    }
    component.addHandler(<any>payload);
    expect(component.formGroup).not.toEqual(undefined);
  }));

  it('#(*)# Edit handler should edit a row ###', (() => {
    const payload = {
      sender: {closeRow : () => {}, editRow : () => {}},
      isNew: false,
      rowIndex: 0,
      dataItem: { ...customResponse}
    }
    component.editHandler(<any>payload);
    expect(payload.dataItem).toEqual(jasmine.objectContaining(customResponse));
  }));

  it('#(*)# Cancel Handler should work ###', (() => {
    const args = {
      formGroup: new FormGroup({}),
      dataItem: undefined,
      isNew: false,
      rowIndex: 0,
      sender: {closeRow : () => {}, editRow : () => {}}
    };
    component.cancelHandler(<any>args);
    expect(component.formGroup).toEqual(undefined);
  }));

  it('#(*)# Show success notification ###', (() => {
    const eventData = { files: [{ name: 'data'}], operation: null, response: { body: { message : 'uploaded data'}}};
    component.success(<any>eventData);
    expect(appServiceSpy.showSuccessNotification).toHaveBeenCalled();
  }));
});
