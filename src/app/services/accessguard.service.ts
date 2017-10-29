import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { SessionService, USER_ROLES } from './session.service';
import { Observable } from 'rxjs/Observable';
 

@Injectable()
export class AccessGuard implements CanActivate {

  constructor(private session: SessionService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    console.log('Trying to navigate to route ', route);

    const requiresLogin = route.data.requiresLogin || false;
    const logIn = this.session.isLoggedIn();
    if ( route.data.isLoginRoute ) {
      
      if ( logIn >= 0 && logIn < USER_ROLES.student ) {
        this.router.navigate(['home']);
        return false;
      }
      return true;
    }

    if (requiresLogin) {
      if (this.session.isLoggedIn() < 0) {
        return false;
      }
    }
    return true;
  }
}
