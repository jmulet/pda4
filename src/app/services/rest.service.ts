import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SessionService } from './session.service';
import { EncryptUtil } from '../../util/encrypt.util';
import { HttpHeaders } from '@angular/common/http';

function extractContent(s) {
    const div = document.createElement('div');
    div.innerHTML = s;
    return div.textContent || div.innerText;
}

@Injectable()
export class RestService implements OnInit {

    constructor(private session: SessionService, private http: HttpClient) { }

    ngOnInit(): void {
    }

    listStudents(idGroup: number) {
        return this.http.post('/rest/students/list', { idGroup: idGroup });
    }

    getStudents(idGroup: number, day: string, day2?: string) {
        const idUser = this.session.getUser().id || 0;
        const body = { idGroup: idGroup, idCreator: idUser || 0, day: day, day2: day2 };
        return this.http.post('/rest/badges/list', body);
    }

    // List badges of idUser in idGroup. If day, of that day, if day2 in this interval
    badges(idUser: number, idGroup: number, day: string, day2?: string) {
        const body = { idUser: idUser, idGroup: idGroup || 0, day: day, day2: day2 };
        return this.http.post('/rest/badges/list', body);
    }

    removeBadge(id: number) {
        return this.http.post('/rest/badges/delete', {id: id});
    }

    addBadge(idUser: number, day: string, type: number, rscore: number, idGroup: number) {
        const idCreator = this.session.getUser().id || 0;
        const body = { idUser: idUser, day: day, type: type, rscore: rscore ||  0, idCreator: idCreator, idGroup: idGroup };
        return this.http.post('/rest/badges/save', body);
    }

    listActivities(idGroup: number, idUser?: number, day1?: string, day2?: string) {
        const idCreator = this.session.getUser().id || 0;
        const body = { idCreator: idCreator, idGroup: idGroup, idUser: idUser, day: day1, day2: day2 };
        return this.http.post('/rest/pda/activities/list', body);
    }

    saveActivity(bean: any) {
       // const obj = { idGroup: this.idGroup, idCreator: this.idUser };
       // const clone = {...obj, bean};
        return this.http.post('/rest/pda/activities/save', bean);
    }

    deleteActivity(id: number) {
        return this.http.post('/rest/pda/activities/delete', {id: id});
    }

    listGrades(idActivity: number, idGroup: number, filter?: string) {
        const body = { idActivity: idActivity, idGroup: idGroup, filter: filter };
        return this.http.post('/rest/pda/activities/listgrades', body);
    }

    listGradesAll(idGroup: number, filter?: string) {
        const idUser = this.session.getUser().id || 0;
        const body = { idCreator: idUser, idGroup: idGroup, filter: filter };
        return this.http.post('/rest/pda/activities/listall', body);
    }

    saveGrade(idActivity: number, idUser: number, grade?: number) {
        const body = { idActivity: idActivity, idUser: idUser, grade: grade ||  -1 };
        return this.http.post('/rest/pda/activities/savegrade', body);
    }

    saveGrades(list: any[]) {
        return this.http.post('/rest/pda/activities/savegrade', {list: list});
    }

    deleteGrade(id: number) {
        return this.http.post('/rest/pda/activities/deletegrade', {id: id});
    }

    deleteGrades(list: number[]) {
        return this.http.post('/rest/pda/activities/deletegrade', {list: list});
    }

    updateGrade(id: number, grade?: number) {
        const body = { id: id, grade: grade ||  -1 };
        return this.http.post('/rest/pda/activities/savegrade', body);
    }

    deleteComment(idChat: number) {
        return this.http.post('/rest/chats/delete', {id: idChat});
    }

    saveComment(idChat: number, idFrom: number, idTo: number, idGroup: number, msg: string, day: Date) {
        const body = { id: idChat, idUser: idFrom, isFor: idTo, idGroup: idGroup, msg: msg, parents: 1, when: day };
        return this.http.post('/rest/chats/save', body);
    }

    listComments(idFrom: number, idTo: number, idGroup: number) {
        const body = { idUser: idFrom, isFor: idTo, idGroup: idGroup, parents: 1 };
        return this.http.post('/rest/chats/list', body);
    }

    sendEmail(email: string, subject: string, html: string, text?: string) {

        const body: any = {to: email, subject: subject};

        if (html && !text) {
            text = extractContent(html);
        } else if (!html && text) {
            html = text.replace(/\n/g, '<br/>');
        }

        body.text = text;
        body.html = html;

        const user = this.session.getUser();
        if (user.email && user.emailPassword) {
            body.fromName = user.fullname;
            body.from = user.email;
            body.fromPassword = user.emailPassword;
        }
        const bodyEncrypted = EncryptUtil.encrypt(body);
        const options = {
          headers: new HttpHeaders().set('Content-Type', 'text/plain;charset=UTF-8')
        };

        return this.http.post('/rest/gapis/email', bodyEncrypted, options);
    }

    generateXLS(wb) {
        return this.http.post('/rest/pda/activities/createxls', {workbook: wb}, { responseType: 'arraybuffer' });
    }

    listLogins(idUser: number) {
        return this.http.post('/rest/auth/loginlist', {idUser: idUser});
    }
}
