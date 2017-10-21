import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';

import { AuthService } from './auth.service';
import { SessionService } from '../../services/session.service';
import { AccessGuard } from '../../services/accessguard.service';
import { HttpClientModule } from '@angular/common/http';


import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';

export function HttpLoaderFactory(http: HttpClient) {
  // for development
  // return new TranslateHttpLoader(http, '/start-angular/SB-Admin-BS4-Angular-4/master/dist/assets/i18n/', '.json');
  return new TranslateHttpLoader(http, '../assets/i18n/login/', '.json');
}


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    LoginRoutingModule,
    TranslateModule,
    HttpClientModule,
    TranslateModule.forChild({
      loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
      },
      isolate: true
  })
  ],
  declarations: [
    LoginComponent
  ],
  providers: [
    AuthService
  ]
})
export class LoginModule { }
