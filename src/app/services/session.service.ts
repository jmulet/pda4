import { Injectable, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { EncryptUtil } from '../../util/encrypt.util';
import { RememberMe } from './rememberme';

const cssLoaded = [];

const createLink = function (stylePath) {
  const link = document.createElement('link');
  link.type = 'text/css';
  link.rel = 'stylesheet';
  link.href = stylePath;
  document.getElementsByTagName('head')[0].appendChild(link);
};

export const USER_ROLES = {
  admin: 0,
  teacher: 100,
  teacherNonEditing: 105,
  teacheradmin: 110,
  student: 200,
  guest: 300,
  undefined: 400,
  parents: 500
};
 

@Injectable()
export class SessionService {
  public version = '5.2.3';
  public currentYear: number;

  private user: any;
  public langChanged$: EventEmitter<string> = new EventEmitter();
  private lang = 'ca';
  ALLOWED_GROUP_ROLES = [USER_ROLES.admin, USER_ROLES.teacher, USER_ROLES.teacheradmin];
  private rememberMe: RememberMe;

  constructor(private router: Router) {
    console.log('Created a session service');

    // Try to find which is the current academic year (starts beginning of august)
    const d = new Date();
    d.setDate(d.getDate() - 244);
    this.currentYear = d.getFullYear();

    this.rememberMe = new RememberMe();
  }

  public setUser(user) {
    this.user = user;
    const obj: any = {
      user: user,
      css: []
    };
    const userEncryped = EncryptUtil.encrypt(JSON.stringify(obj));
    localStorage.setItem('pwSession', userEncryped);
  }

  public getUser(): any {
    return this.user;
  }

  public getUserGroups(): any[] {
    const user = this.getUser();
    if (user && user.groups) {
      return user.groups.filter((g) => this.ALLOWED_GROUP_ROLES.indexOf(g.eidRole) >= 0 && (g.groupYear + 2000) === this.currentYear);
    } else {
      return [];
    }
  }

  public isLoggedIn(): number {
    const storage = localStorage.getItem('pwSession');
    if (storage) {
      try {
        const obj = JSON.parse(EncryptUtil.decrypt(storage));
        this.user = obj.user;
      } catch (ex) {
        console.log(ex);
        return -1;
      }
    } else {
      return -1;
    }
    if (this.user) {
      return this.user.idRole;
    }
    return -1;
  }

  logout() {
    console.log('Destroying session, going to login');
    this.user = null;
    localStorage.removeItem('pwSession');
    this.router.navigate(['login']);
  }

  public setLang(lang) {
    this.lang = lang;
    this.langChanged$.emit(lang);
  }

  public getLang(): string {
    return this.lang;
  }

  public getRememberMe(): RememberMe {
    return this.rememberMe;
  }
 
  public addCss(styleSheet: string): void {
    if (cssLoaded.indexOf(styleSheet) < 0) {
      cssLoaded.push(styleSheet);
      createLink(styleSheet);
    }
  }


  public createCalendarLocale() {
    let locale;
    if (this.lang === 'es') {
      locale = {
        firstDayOfWeek: 1,
        dayNames: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
        dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
        dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
        monthNames: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto',
          'septiembre', 'octubre', 'noviembre', 'diciembre'],
        monthNamesShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
        today: 'Hoy',
        clear: 'Borrar'
      };
    } else if (this.lang === 'ca') {
      locale = {
        firstDayOfWeek: 1,
        dayNames: ['diumenge', 'dilluns', 'dimarts', 'dimecres', 'dijous', 'divendres', 'dissabte'],
        dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
        dayNamesMin: ['Dm', 'Dl', 'Dm', 'Dx', 'Dj', 'Dv', 'Ds'],
        monthNames: ['gener', 'febrer', 'març', 'abril', 'maig', 'juny', 'juliol', 'agost',
          'setembre', 'octubre', 'novembre', 'desembre'],
        monthNamesShort: ['gen', 'feb', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'des'],
        today: 'Avui',
        clear: 'Esborrar'
      };
    } else {
      locale = {
        firstDayOfWeek: 0,
        dayNames: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        dayNamesShort: ['Su', 'Mo', 'Tu', 'Wd', 'Th', 'Fr', 'Sa'],
        dayNamesMin: ['Su', 'Mo', 'Tu', 'Wd', 'Th', 'Fr', 'Sa'],
        monthNames: ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'agust',
          'september', 'october', 'november', 'december'],
        monthNamesShort: ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'agu', 'sep', 'oct', 'nov', 'dec'],
        today: 'Today',
        clear: 'Delete'
      };
    }
    return locale;
  }


  public copyToClipboard(text: string) {

     if (document.queryCommandSupported && document.queryCommandSupported('copy')) {
      const textarea = document.createElement('textarea');
      textarea.textContent = text;
      textarea.style.position = 'fixed';  // Prevent scrolling to bottom of page in MS Edge.
      document.body.appendChild(textarea);
      textarea.select();
      try {
        return document.execCommand('copy'); // Security exception may be thrown by some browsers.
      } catch (ex) {
        console.warn('Copy to clipboard failed.', ex);
        return false;
      } finally {
        document.body.removeChild(textarea);
      }
    }
    return true;
  }

}
