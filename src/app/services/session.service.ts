import { Injectable, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { EncryptUtil } from '../../util/encrypt.util';
 

@Injectable()
export class SessionService {
  private user: any;
  public langChanged$: EventEmitter<string> = new EventEmitter();
  private lang = 'ca';
  constructor(private router: Router) { 
    console.log('Created a session service');
  }

  public setUser(user, userEncryped) {
    this.user = user;
    localStorage.setItem('pwSession4', userEncryped);
  }

  public getUser(): any {
    return this.user;
  }

  public isLoggedIn(): boolean {
    const storage = localStorage.getItem('pwSession4');
    if (storage) {
      this.user = JSON.parse(EncryptUtil.decrypt(storage));
    }
    return storage !== null;
  }

  public logout() {
    console.log('Destroying session, going to login');
    this.user = null;
    localStorage.removeItem('pwSession4');
    this.router.navigate(['login']);
  }

  public setLang(lang) {
    this.lang = lang;
    this.langChanged$.emit(lang);
  }

  public getLang(): string {
    return this.lang;
  }

  
}
