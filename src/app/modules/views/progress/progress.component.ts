import { Component, OnInit } from '@angular/core';
import { SessionService } from '../../../services/session.service';
import { RestService } from '../../../services/rest.service';
import { BADGES_TYPES } from '../list/badge.logic';
import { SCORES, rainbow, i18n_badges } from '../list/badgebutton.component';
import { OverlayPanel } from 'primeng/components/overlaypanel/overlaypanel';
import { SelectItem } from 'primeng/components/common/selectitem';
import { MessageService } from 'primeng/components/common/messageservice';

const DECIMALS = function(x, n) {
     const pow = Math.pow(10, n);
    return Math.floor(x * pow) / pow;
};


@Component({
    selector: 'app-home-progress',
    templateUrl: 'progress.component.html',
    styles: [
        `.semaphore {
            border: 1px solid gray;
            border-radius: 100%;
            display: inline-block;
            width: 15px;
            height: 15px;
            margin-left: 0;
        }

        .semaphore-block {
            border: 1px solid gray;
            display: inline-block;
            width: 50px;
            height: 15px;
            margin: 0;
        }
        `
    ]
})

export class ProgressComponent implements OnInit {
    lastStudentLogin: any;
    lastParentsLogin: any;
    loginsParents: any[];
    loginsStudent: any[];
    summary: any;
    summaryText = '';
    grades: any[];
    detail: { badges: any[]; chat: string; day: string };
    isLoading: boolean;
    badges: any;
    messages: any[];
    students: Object;
    user: any;
    groupSelected: any;
    studentSelected: any;
    selectedDate: Date;
    holidays: Date[];
    locale: any;
    semaphoreFor: any;
    badgesType = 0;
    badgesOptions: SelectItem[] = [
        {label: 'Totes', value: 0},
        {label: 'Assistència', value: 1},
        {label: 'Feina aula', value: 2},
        {label: 'Deures', value: 3},
        {label: 'Comportament', value: 4},
    ];

    constructor(private session: SessionService, private rest: RestService, private growl: MessageService) { }

    ngOnInit() {
        this.groupSelected = this.session.getUserGroups()[0];
        this.user = this.session.getUser();
        this.locale = this.session.createCalendarLocale();
        this.session.langChanged$.subscribe( (lang) => this.locale = this.session.createCalendarLocale() );
        this.selectedDate = new Date();
        this.update();
    }

    onGroupSelected(g) {
        this.groupSelected = g;
        this.update();
    }

    onStudentSelected(s) {
        this.studentSelected = s;
        this.update();
    }

    formatDate(date: any) {
        if (typeof(date) === 'string') {
            date = new Date(date);
        }
        if (date.day) {
            return date.day + '/' + (date.month + 1) + '/' + date.year;
        }
        return  date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
    }

    formatGrade(grade: number | string) {
       if (grade == -1) {
           return 'Pendent';
       } else if (grade == -2) {
            return 'NP';
       }
       return  grade;
    }

    formatLapsed(date) {
        if (date) {
            const now = new Date();
            let delta = 0.001 * Math.abs(new Date().getTime() - new Date(date).getTime());
            // calculate (and subtract) whole days
            const days = Math.floor(delta / 86400);
            delta -= days * 86400;
            // calculate (and subtract) whole hours
            const hours = Math.floor(delta / 3600) % 24;
            delta -= hours * 3600;
            // calculate (and subtract) whole minutes
            const minutes = Math.floor(delta / 60) % 60;
            delta -= minutes * 60;
            // what's left is seconds
            const seconds = delta % 60;  // in theory the modulus is not required
            return days + ' dies ' + hours + ' h ' + minutes + ' min';
        } else {
            return 'Mai';
        }
    }

    update() {
        if (!this.groupSelected ||  !this.studentSelected || this.isLoading) {
            return;
        }
        this.isLoading = true;
        this.semaphoreFor = {};
        const idGroup = this.groupSelected.idGroup;
        const idTo = this.studentSelected.id;
        const idFrom = this.user.id;
        const fromDate = this.session.currentYear + '-09-01';
        const toDate = (this.session.currentYear + 1) + '-06-31';

        const promise1 = this.rest.listComments(idFrom, idTo, idGroup).toPromise();
        promise1.then( (d: any[]) => {
            this.messages = d;
            d.forEach( (m) => {
                const dateStr = this.formatDate(new Date(m.when));
                let semaphore = this.semaphoreFor[dateStr];
                if (!semaphore) {
                    semaphore = {};
                    this.semaphoreFor[dateStr] = semaphore;
                }
                semaphore.chat = true;
            });
        });

        const promise2 = this.rest.badges(idTo, idGroup, fromDate, toDate).toPromise();
        promise2.then( (d: any[]) => {
            this.badges = d;

            // Get all different days in badges
            const badgeDates = d.map( (b) => b.day).filter( (item, pos, arr) => arr.indexOf(item) === pos);

            // Filter badges per dates
            badgeDates.forEach( (badgeDate) => {
                // Create semaphore for each date
                const dateStr = this.formatDate(new Date(badgeDate));
                let semaphore = this.semaphoreFor[dateStr];
                if (!semaphore) {
                    semaphore = {};
                    this.semaphoreFor[dateStr] = semaphore;
                }
                this.createSemaphore( d.filter( (b) => b.day === badgeDate ), semaphore);
            });
        });

        const promise3 = this.rest.listActivities(idGroup, idTo, fromDate, toDate).toPromise();
        promise3.then( (d: any[]) => {
            this.grades = d;
        });

        const promise4 = this.rest.listLogins(idTo).toPromise();
        promise4.then( (d: any) => {
            this.loginsStudent = d.logins.filter( e => e.parents === 0).map( (e, i) => {
                if (i === 0) {
                    return {label: this.formatLapsed(e.login), value: e};
                } else {
                    return {label: this.formatDate(e.login), value: e};
                }
            });

            this.loginsParents =  d.logins.filter( e => e.parents === 1).map( (e, i) => {
                if (i === 0) {
                    return {label: this.formatLapsed(e.login), value: e};
                } else {
                    return {label: this.formatDate(e.login), value: e};
                }
            });

            console.log(this.loginsStudent);
            console.log(this.loginsParents);

            if (this.loginsStudent.length === 0) {
               this.loginsStudent.push({label: 'Mai'});
            }
            if (this.loginsParents.length === 0) {
                this.loginsParents.push({label: 'Mai'});
            }
            this.lastStudentLogin = this.loginsStudent[0].value;
            this.lastParentsLogin = this.loginsParents[0].value;
        });

        Promise.all([promise1, promise2, promise3, promise4]).then( (d) => {
            this.isLoading = false;
            this.createSummary();
        } );
    }

    createSummary() {
        this.summary = {
            fa: 0,
            ns: 0,
            hw: 0,
            nhw: 0,
            cw: 0,
            ncw: 0,
            bh: 0,
            fa_tpc: '---',
            hw_tpc: '---',
            cw_tpc: '---',
            bh_tpc: '---',
        };

        const dates = [];
        this.badges.forEach( (b) => {
            if (dates.indexOf(b.day) < 0) {
                dates.push(b.day);
            }
            if (BADGES_TYPES.FA === b.type) {
                this.summary.fa += 1;
            } else if (BADGES_TYPES.RE === b.type) {
                this.summary.bh += 0.5;
            } else if (BADGES_TYPES.HOMEWORK.indexOf(b.type) >= 0) {
                this.summary.hw += SCORES[b.type] > 0 ? 1 : 0;
                this.summary.nhw += 1;
            } else if (BADGES_TYPES.CLASSWORK.indexOf(b.type) >= 0) {
                this.summary.cw += SCORES[b.type] > 0 ? 1 : 0;
                this.summary.ncw += 1;
            } else if (BADGES_TYPES.BEHAVIOUR.indexOf(b.type) >= 0) {
                this.summary.bh += SCORES[b.type] < 0 ? 1 : 0;
            }
        });
        this.summary.ns = dates.length;
        this.summary.fa = this.summary.ns - this.summary.fa;
        this.summary.bh = this.summary.ns - this.summary.bh;

        // Calculate %
        if (this.summary.ns > 0) {
            this.summary.fa_tpc = DECIMALS(100 * this.summary.fa / this.summary.ns, 1);
            this.summary.bh_tpc = DECIMALS(100 * this.summary.bh / this.summary.ns, 1);
        }
        if (this.summary.nhw > 0) {
            this.summary.hw_tpc = DECIMALS(100 * this.summary.hw / this.summary.nhw, 1);
        }
        if (this.summary.ncw > 0) {
            this.summary.cw_tpc = DECIMALS(100 * this.summary.cw / this.summary.ncw, 1);
        }

        // Create a summary in text mode ready to copy to clipboard
        this.summaryText = `Assistència: ${this.summary.fa_tpc} %\n` +
        `Deures: ${this.summary.hw_tpc} % \n` +
        `Feina aula: ${this.summary.cw_tpc} % \n` +
        `Comportament: ${this.summary.bh_tpc} % \n\n` +
        `NOTES: \n`;


        this.grades.forEach( (act) => {
            if (act.visible) {
                this.summaryText +=
                 `\t ${act.trimestre}a \t ${this.formatDate(new Date(act.dia))} \t ${act.desc} \t = ${this.formatGrade(act.grade)}\n`;
            }
        });

        if (this.messages.length) {
            this.summaryText += '\n\nCOMENTARIS:\n';
            this.messages.forEach( (m) => {
                this.summaryText +=
                `\t ${this.formatDate(new Date(m.when))} \t ${m.msg} \n`;
            });
        }

    }

    onDateClick(event, date, overlayPanel: OverlayPanel) {
        const dateStr = this.formatDate(date);
        if (date.selectable) {
            const chat = (this.messages.filter( (m) => this.formatDate(new Date(m.when)) === dateStr)[0] || {}).msg;
            const badges = this.badges.filter( (b) => this.formatDate(new Date(b.day)) === dateStr);
            this.detail = {
                badges: badges,
                chat: chat,
                day: date.day + '/' + (date.month + 1) + '/' + date.year
            };
            if (badges.length || chat) {
                overlayPanel.show(event);
            } else {
                overlayPanel.hide();
            }
        } else {
            overlayPanel.hide();
        }
    }

    createSemaphore(badgesInDay, s) {

        let hasDeures, hasFeina, hasComportament = false;
        let notaDeures = 0, notaFeina = 0, notaComportament = 0;

        const n = badgesInDay.length;

        for (let i = 0; i < n; i++) {
            const b = badgesInDay[i];
            if (b.type === BADGES_TYPES.FA) {
                s.fare = 'yellow';
            } else if (b.type === BADGES_TYPES.RE) {
                s.fare = 'red';
            } else if (BADGES_TYPES.HOMEWORK.indexOf(b.type) >= 0) {
                hasDeures = true;
                notaDeures += SCORES[b.type];
            } else if (BADGES_TYPES.CLASSWORK.indexOf(b.type) >= 0) {
                hasFeina = true;
                notaFeina += SCORES[b.type];
            } else if (BADGES_TYPES.BEHAVIOUR.indexOf(b.type) >= 0) {
                hasComportament = true;
                notaComportament += SCORES[b.type];
            }
        }

        if (hasDeures) {
            s.hw = 'rgb(' + rainbow(null, notaDeures) + ')';
        }

        if (hasFeina) {
            s.cw = 'rgb(' + rainbow(null, notaFeina) + ')';
        }

        if (hasComportament) {
            s.bh = 'rgb(' + rainbow(null, notaComportament) + ')';
        }
    }

    description(badge) {
        const lang = this.session.getLang();
        return (i18n_badges[lang] || {})[badge.type] || 'badge';
    }

    onClipboardCopy() {
        this.growl.add({ severity: 'success', summary: 'Clipboard', detail: 'S\'ha copiat la informació al porta-retalls' });
    }
}
