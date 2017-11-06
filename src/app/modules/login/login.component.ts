import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {NgForm} from '@angular/forms';
import { AuthService } from './auth.service';
import { SessionService, USER_ROLES } from '../../services/session.service';
import { TranslateService } from '@ngx-translate/core';
import { EncryptUtil } from '../../../util/encrypt.util';
import { MessageService } from 'primeng/components/common/messageservice';
import { Ng2DeviceService } from 'ng2-device-detector';

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

    isNavbarCollapsed = true;
    isMobile = false;
    version: string;
    credentials = {
        username: '',
        password: ''
    };
    error: string;
    langFlag: string;
    loading = false;
    showAlert = false;

    constructor(private router: Router, private auth: AuthService,
        private session: SessionService, private translate: TranslateService,
        private messageService: MessageService, private deviceInfo: Ng2DeviceService) {
    }

    ngOnInit() {
        this.version = this.session.version || '0.0.0';
        this.isMobile = (['ipad', 'iphone', 'android'].indexOf(this.deviceInfo.getDeviceInfo().device) >= 0);

        const isIn = this.session.isLoggedIn();
        if (isIn >= 0) {
            console.log(' Already logged in, should navigate to home');
            if (isIn < USER_ROLES.student) {
                this.router.navigate(['home']);
            } else {
                this.error = 'The user ' + this.session.getUser().username + ' has insuficient privileges.';
            }
        }
        this.translate.addLangs(['ca', 'es', 'en']);
        this.translate.setDefaultLang('es');
        this.langFlag = 'assets/img/es.png';
        const useLang = this.session.getLang();
        if (useLang) {
            this.translate.use(useLang);
            this.langFlag = 'assets/img/' + useLang + '.png';
        }
        this.session.langChanged$.subscribe( (lang) => {
            console.log('Login fired ', lang);
            this.translate.use(lang);
            this.langFlag = 'assets/img/' + lang + '.png';
        } );

        const pwMobile = localStorage.getItem('pwMobile');
        if (this.isMobile && pwMobile) {
                try {
                    const obj = JSON.parse(EncryptUtil.decrypt(pwMobile));
                    this.credentials.username = obj.username || '';
                    this.credentials.password = obj.password || '';
                } catch (Ex) {
                    //
                }
        }

    }


    doLogin(event?) {
        if (event &&  event.keyCode !== 13) {
            return;
        }
        this.loading = true;
        this.auth.login(this.credentials).subscribe(
            (res: LoginSignature) => {
             this.loading = false;
             if (res.ok) {
                const user = JSON.parse( EncryptUtil.decrypt(res.user_info) );
                if (user.idRole < USER_ROLES.student) {
                    if (this.credentials.username !== 'root' && this.isMobile) {
                        // Desa els parametres dins del navegador
                        localStorage.setItem('pwMobile', EncryptUtil.encrypt(JSON.stringify(this.credentials)));
                     }
                    this.session.setUser(user, res.user_info);
                    this.messageService.add({ severity: 'info', summary: 'Benvingut', detail: user.fullname });
                    this.router.navigate(['home']);
                } else {
                    this.error = 'The user ' + user.username + ' has insuficient privileges.';
                    this.showAlert = true;
                    this.credentials.password = '';
                    this.credentials.username = '';
                }
              } else {
                this.error = res.msg || 'An error occurred';
                this.credentials.password = '';
                this.showAlert = true;
              }
            },
            err => {
              this.loading = false;
              this.error = 'An error occurred: No backend response';
              this.showAlert = true;
            }
          );
    }

    switchLang(lang) {
        this.session.setLang(lang);
    }

    clearLocalStorage() {

    }

    thisUserAgent($event) {
        console.log($event);
    }
}
