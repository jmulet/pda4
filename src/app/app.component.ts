import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { SessionService } from './services/session.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'pda4';
  constructor(private translate: TranslateService, private session: SessionService) {
  }

  ngOnInit() {

    this.translate.addLangs(['ca', 'es', 'en']);
    this.translate.setDefaultLang('es');
    const browserLang = this.translate.getBrowserLang();
    const useLang = browserLang.match(/ca|es|en/) ? browserLang : 'es';
    this.session.setLang(useLang);

    this.session.langChanged$.subscribe( (lang) => this.translate.use(lang) );
}
}
