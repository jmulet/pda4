import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { SessionService } from './session.service';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class AccessGuard implements CanActivate {

  constructor(private session: SessionService) { }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    console.log('Trying to navigate to route ', route);

    const requiresLogin = route.data.requiresLogin || false;

    if ( route.data.isLoginRoute ) {
      if (this.session.isLoggedIn()) {
        return false;
      }
      return true;
    }

    if (requiresLogin) {
      if (!this.session.isLoggedIn()) {
        return false;
      }
    }
    return true;
  }
}
