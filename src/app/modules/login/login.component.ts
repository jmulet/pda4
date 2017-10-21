import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { SessionService } from '../../services/session.service';
import { TranslateService } from '@ngx-translate/core';
import { EncryptUtil } from '../../../util/encrypt.util';

interface LoginSignature {
    ok: boolean;
    msg: string;
    user_info: string;
}

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

    username = '';
    password= '';
    error: string;
    constructor(private router: Router, private auth: AuthService,
        private session: SessionService, private translate: TranslateService) {
        console.log('Called constructor login');
    }

    ngOnInit() {
        if (this.session.isLoggedIn()) {
            console.log(' Already logged in, should navigate to home');
            this.router.navigate(['home']);
        }
        this.translate.addLangs(['ca', 'es', 'en']);
        this.translate.setDefaultLang('es');
        if(this.session.getLang()){
            this.translate.use(this.session.getLang());
        }
        this.session.langChanged$.subscribe( (lang) => {
            console.log('Login fired ', lang);
            this.translate.use(lang);
        } );
    }

    doLogin(event) {
        if (event &&  event.keyCode !== 13) {
            return;
        }

        this.auth.login(this.username, this.password).subscribe(
            (res: LoginSignature) => {
             if (res.ok) {
                const user = JSON.parse( EncryptUtil.decrypt(res.user_info) );
                this.session.setUser(user, res.user_info);
                this.router.navigate(['home']);
              } else {
                this.error = res.msg || 'An error occurred';
              }
            },
            err => {
              this.error = 'An error occurred';
            }
          );
    }

    switchLang(lang) {
        this.session.setLang(lang);
    }
}
