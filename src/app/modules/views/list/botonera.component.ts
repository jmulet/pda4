import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { RestService } from '../../../services/rest.service';
import { SCORES } from './badgebutton.component';
import { BadgesLogic } from './badge.logic';
import { SessionService } from '../../../services/session.service';

import { MessageService } from 'primeng/components/common/messageservice';
import { ConfirmationService } from 'primeng/components/common/confirmationservice';



@Component({
    selector: 'app-list-botonera',
    templateUrl: 'botonera.component.html',
    styles: [
        `table#buttonstable td { padding: 0.25rem !important; }
        `
    ]
})

export class BotoneraComponent implements OnInit, OnChanges {
    logic: BadgesLogic;
    _day: any;
    _group: any;
    student: any;
    message: string;
    editMsg: boolean;
    ids = {};
    constructor(private rest: RestService, private session: SessionService,
        private growl: MessageService, private confirmationService: ConfirmationService) { }
    @Output() changed = new EventEmitter<any>();
    @Output() longClick = new EventEmitter<any>();

    @Input() set user(s) {
        // console.logonsole.log('Botonera: setting user', s);
        this.student = s;
        // Set the ids to each button
        this.ids = {};
        if (s) {
            this.student.badges.forEach((b) => this.ids[b.type] = b.id);
            this.logic = new BadgesLogic(this.student.badges, this.ids, this.rest);
            if (this.student.chats.length) {
                this.message = this.student.chats[0].msg;
            } else {
                this.message = '';
            }
        }
    }

    @Input() set group(g) {
        // console.logonsole.log('Botonera: setting group to ', g);
        this._group = g;
    }

    @Input() set date(d) {
        // console.logonsole.log('Botonera: setting date', d);
        this._day = d;
    }

    formatter = (s: any) => s.fullname;
    ngOnInit() { }
    ngOnChanges(changes: SimpleChanges): void {
        // console.logonsole.log('CHANGES-->', changes);
    }
    handle(evt) {
        if (!this.student || !this._group ||  !this._day) {
            // console.logonsole.log('Component wrongly initialized, data is missing');
            return;
        }
        // console.logonsole.log('the user is ', this.student);
        // console.logonsole.log('the student badges are ', this.student.badges);
        // console.logonsole.log('Bottonera has recieved this evt ', evt, ' and emits it for changes to list component');

        this.handleShort(evt.badge.type, evt);
        if (evt.badge.isLong) {
            evt.badge.idUser = this.student.id;
            // Long events are processed by the parent
            this.longClick.emit(evt);
        }
    }

    handleShort(type, evt) {
        const id = this.ids[type];
        const score = SCORES[type] ||  0;
        const idGroup = this._group.idGroup;
        const proceed = this.logic.testAction(type, id);
        if (proceed) {
            if (id) {
                this.logic.removeId(id).subscribe((d) => this.changed.emit(evt));
            } else {
                this.logic.createBadge(this.student.id, this._day, type, score, idGroup).subscribe((d) => this.changed.emit(evt));
            }
        }
    }

    cancelEditMsg()  {
        this.editMsg = false;
        if (this.student.chats.length) {
            this.message = this.student.chats[0].msg;
        } else {
            this.message = '';
        }
    }

    saveEditMsg(emailMe?: boolean)  {
        this.editMsg = false;
        let idChat = 0;
        if (this.student.chats.length) {
            idChat = this.student.chats[0].id;
        }
        const fromUserId = this.session.getUser().id;
        const toUserId = this.student.id;
        const idGroup = this._group.idGroup;

        if (idChat && !(this.message || '').trim()) {
            // Empty messages are deleted from chats
            this.rest.deleteComment(idChat);
            // console.log('Message deleted');
            this.student.chats.splice(0, 1);
        } else if ((this.message || '').trim()) {
            this.rest.saveComment(idChat, fromUserId, toUserId, idGroup, this.message).subscribe((d: any) => {
                if (d.ok && d.id) {
                    if (idChat) {
                        this.student.chats[0].msg = this.message;
                    } else {
                        this.student.chats.push(
                            { id: d.id, msg: this.message }
                        );
                    }

                    if (emailMe) {
                        this.confirmationService.confirm({
                            message: 'Voleu enviar aquest missatge per correu a correu ' + this.student.emailParents + ' ?',
                            accept: () => {
                                this.sendEmail(this.message);
                            }
                        });
                    }
                } else {
                    this.growl.add({ severity: 'error', summary: 'Error', detail: 'An error occurred while saving message' });
                }
            });
        }
    }


    sendEmail(msg: string) {
        const missatge = 'Missatge de ' + this.session.getUser().fullname + ':\n' + msg;
        this.rest.sendEmail(this.student.emailParents, 'Missatge de seguiment', null, missatge).subscribe( (r: any) => {
             if (r.ok) {
                this.growl.add({ severity: 'success', summary: 'Email sent',
                                detail: 'Email sent to ' + this.student.emailParents });
            } else {
                this.growl.add({ severity: 'error', summary: 'Error', detail: 'An error occurred while sending email' + r.msg });
            }
        });

    }
}
