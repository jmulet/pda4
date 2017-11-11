import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { SessionService } from '../../services/session.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css', '../../../assets/css/pw-avatar.min.css']
})
export class HomeComponent implements OnInit {
    sideBarShown: boolean;
    dropdownShown: boolean;
    isNavbarCollapsed = true;
    user: any;
    avatarSrc: string;
    version: string;
    constructor(private router: Router, private session: SessionService,
        private translate: TranslateService) {
        console.log('Called constructor home');
    }

    ngOnInit() {
        this.version = this.session.version || '0.0.0';
        this.translate.addLangs(['ca', 'es', 'en']);
        this.translate.setDefaultLang('es');
        this.user = this.session.getUser();
        this.avatarSrc = '/assets/img/avatar/' + (this.user.uopts.avatar || 0) + '.png';
        if (this.session.getLang()) {
            this.translate.use(this.session.getLang());
        }
        this.session.langChanged$.subscribe((lang) => {
            this.translate.use(lang);
        });
    }

    logout(evt) {
        evt.preventDefault();
        this.dropdownShown = false;
        this.session.logout();
    }

    switchLang(lang) {
        this.dropdownShown = false;
        this.session.setLang(lang);
    }

    pd(evt) {
        evt.preventDefault();
        this.dropdownShown = !this.dropdownShown;
    }

    blur() {
        setTimeout( () => this.dropdownShown = false, 250);
    }

    toggleSideBar(evt) {
        evt.preventDefault();
        this.sideBarShown = !this.sideBarShown;
    }
}
