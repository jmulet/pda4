import { Injectable } from '@angular/core';
import { SessionService } from '../../services/session.service';
import { HttpClient } from '@angular/common/http';
import { EncryptUtil } from '../../../util/encrypt.util';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class AuthService {
  user: any;

  constructor(private session: SessionService, private http: HttpClient) { }

  login(username: String, password: String) {
    const obj = {username: username, password: password};
    console.log(obj);
    const body = EncryptUtil.encrypt(obj);
    const options = {
      headers: new HttpHeaders().set('Content-Type', 'text/plain;charset=UTF-8')
    }; 
    return this.http.post('/rest/users/login', body, options);
  }
}