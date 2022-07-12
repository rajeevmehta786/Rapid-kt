import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import {
  HttpClientJsonpModule,
  HttpClientModule,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { GridModule } from '@progress/kendo-angular-grid';
import { Apollo } from 'apollo-angular';
import { AppComponent } from './app.component';
import { AppService } from './app.service';
import { GraphQLModule } from './graphql.module';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { NotificationModule } from '@progress/kendo-angular-notification';
import { NotificationService } from '@progress/kendo-angular-notification';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { UploadsModule } from '@progress/kendo-angular-upload';

import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
const config: SocketIoConfig = { url: 'http://localhost:3004'
} ;

@NgModule({
  declarations: [AppComponent],
  imports: [
    HttpClientModule,
    HttpClientJsonpModule,
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    GridModule,
    GraphQLModule,
    DateInputsModule,
    IndicatorsModule,
    NotificationModule,
    InputsModule,
    UploadsModule,
    SocketIoModule.forRoot(config)
  ],
  providers: [
    {
      deps: [Apollo, NotificationService, HttpClientModule],
      provide: AppService,
      useFactory:
        (apollo: Apollo, notificationService: NotificationService) => () =>
          new AppService(apollo, notificationService),
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
