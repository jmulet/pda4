import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { SessionService } from '../../services/session.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
    user: any;
    constructor(private router: Router, private session: SessionService,
        private translate: TranslateService) {
        console.log('Called constructor home');
    }

    ngOnInit() {
        this.translate.addLangs(['ca', 'es', 'en']);
        this.translate.setDefaultLang('es');
        this.user = this.session.getUser();
        console.log('you are', this.user);
        if (this.session.getLang()) {
            this.translate.use(this.session.getLang());
        }
        this.session.langChanged$.subscribe((lang) => {
            console.log('Home fired ', lang);
            this.translate.use(lang);
        });
    }

    logout() {
        this.session.logout();
    }

    switchLang(lang) {
        console.log('Change to ', lang);
        this.session.setLang(lang);
    }
}
