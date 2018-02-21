import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/components/common/messageservice';

@Injectable()
export class HttpErrorHandler {

      constructor(private growl: MessageService){}

      errorCatch(err) {
            if (err instanceof HttpErrorResponse) {
                  if (err.status === 401) {
                        console.log('MUST LOGIN -- session expired');
                        localStorage.removeItem('pwSession');
                        window.location.href = '/pda';
                  } else if(err.status >= 500) {
                        this.growl.add({ severity: 'error', summary: err.status +"", detail: err.message });
                  }
            }
            return Observable.throw(err);
      }
}
