import { Injectable, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { EncryptUtil } from '../../util/encrypt.util';

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
  public version = '4.1.1';
  public currentYear: number;

  private user: any;
  private selectedGroup: any;
  public langChanged$: EventEmitter<string> = new EventEmitter();
  private lang = 'ca';
  
  constructor(private router: Router) {
    console.log('Created a session service');
    // Try to find which is the current academic year (starts beginning of august)
    const d = new Date();
    d.setDate(d.getDate() - 244);
    this.currentYear = d.getFullYear();
  }

  public setUser(user, userEncryped) {
    this.user = user;
    localStorage.setItem('pwSession4', userEncryped);
  }

  public getUser(): any {
    return this.user;
  }

  public isLoggedIn(): number {
    const storage = localStorage.getItem('pwSession4');
    if (storage) {
      this.user = JSON.parse(EncryptUtil.decrypt(storage));
    } else {
      return -1;
    }
    if (this.user) {
       return this.user.idRole;
    } 
    return -1;
  }

  public logout() {
    console.log('Destroying session, going to login');
    this.user = null;
    localStorage.removeItem('pwSession4');
    this.router.navigate(['login']);
  }

  public setLang(lang)  {
    this.lang = lang;
    this.langChanged$.emit(lang);
  }

  public getLang(): string {
    return this.lang;
  }

  public getSelectedGroup(): any {
    return this.selectedGroup ||  {};
  }

  public addCss(styleSheet: string): void {
    if (cssLoaded.indexOf(styleSheet) < 0) {
      cssLoaded.push(styleSheet);
      createLink(styleSheet);
    }
  }


  createCalendarLocale() {
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

}
