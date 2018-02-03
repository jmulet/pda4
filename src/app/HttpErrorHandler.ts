import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';

@Injectable()
export class HttpErrorHandler {

      errorCatch(err) {
            if (err instanceof HttpErrorResponse) {
                  if (err.status === 401 || err.status >= 500) {
                        console.log('MUST LOGIN -- session expired');
                        localStorage.removeItem('pwSession');
                        window.location.href = '/pda';
                  }
            }
            return Observable.throw(err);
      }
}
