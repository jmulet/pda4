import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SessionService } from './services/session.service';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AccessGuard } from './services/accessguard.service';

import { GrowlModule } from 'primeng/components/growl/growl';
import { MessageService } from 'primeng/components/common/messageservice';
// import { ResponsiveModule } from 'ng2-responsive';
import { Ng2DeviceDetectorModule } from 'ng2-device-detector';

export function HttpLoaderFactory(http: HttpClient) {
  // for development
  // return new TranslateHttpLoader(http, '/start-angular/SB-Admin-BS4-Angular-4/master/dist/assets/i18n/', '.json');
  return new TranslateHttpLoader(http, '../assets/i18n/app/', '.json');
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NgbModule.forRoot(),
   // ResponsiveModule,
   Ng2DeviceDetectorModule.forRoot(),
    GrowlModule,
    TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
      },
      isolate: true
  })
  ],
  providers: [
    SessionService,
    AccessGuard,
    MessageService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
