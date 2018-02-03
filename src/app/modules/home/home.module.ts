import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { SessionService } from '../../services/session.service';
import { AccessGuard } from '../../services/accessguard.service';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { SharedModule } from '../shared/shared.module';
import { RestService } from '../../services/rest.service';

import { SidebarModule } from 'primeng/components/sidebar/sidebar';
 

export function HttpLoaderFactory(http: HttpClient) {
  // for development
  // return new TranslateHttpLoader(http, '/start-angular/SB-Admin-BS4-Angular-4/master/dist/assets/i18n/', '.json');
  return new TranslateHttpLoader(http, '../assets/i18n/home/', '.json');
}

@NgModule({
  imports: [
    CommonModule,
    HomeRoutingModule,
    SharedModule,
    SidebarModule,
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
    HomeComponent
  ],
  providers: [
    RestService
  ]
})
export class HomeModule { }
