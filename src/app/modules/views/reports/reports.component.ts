import { Component, OnInit } from '@angular/core';
import { SessionService } from '../../../services/session.service';
import { MessageService } from 'primeng/components/common/messageservice';
import { RestService } from '../../../services/rest.service';
import { DateUtils } from '../progress/date.utils';
import { BADGES_TYPES } from '../list/badge.logic';
import { i18n_badges, SCORES } from '../list/badgebutton.component';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

@Component({
    selector: 'app-home-reports',
    templateUrl: 'reports.component.html'
})

export class ReportsComponent implements OnInit {
    rawReport: any[];
    report: Object;
    students: any[];
    studentsSelected: any[] = [];
    locale: any;
    fromDate: Date;
    toDate: Date;
    opts = {tipusInforme: 2};
    selectedGroup: any;
    selections = {fa: true, re: true, hw: false, cw: false, bh: false};
    filtre = '';
    suggestions: string[];
    options = ['A)', 'B)', 'C)', 'D)', 'E)', 'F)'];
    modelChanged: Subject<string> = new Subject<string>();

    constructor(private session: SessionService, private growl: MessageService, private rest: RestService) {

    }

    ngOnInit() {
        this.fromDate = new Date();
        this.toDate = new Date();
        this.fromDate.setDate(this.fromDate.getDate() - this.fromDate.getDay() + 1);
        this.toDate.setDate(this.toDate.getDate() - this.toDate.getDay() + 5);

        this.selectedGroup = this.session.getUser().groups[0];
        this.onGrpChange(this.selectedGroup);
        this.locale = this.session.createCalendarLocale();
        this.session.langChanged$.subscribe( (lang) => this.locale = this.session.createCalendarLocale() );

        this.modelChanged
            .debounceTime(700) // wait 300ms after the last event before emitting last event
            .distinctUntilChanged() // only emit if value is different from previous value
            .subscribe(filter => this.doFiltering());
    }


    onGrpChange(g) {
        this.selectedGroup = g;
        // Load all students in this group
        this.rest.listStudents(this.selectedGroup.idGroup).toPromise().then( (d: any[]) => {
            this.students = d;
            this.studentsSelected = [];
        });

    }

    generateReport() {
        if (this.opts.tipusInforme === 1) {
            let num = 0;
            for (const key in this.selections) {
                if (this.selections[key]) {
                    num += 1;
                }
            }

            if ( num === 0) {
                this.growl.add({ severity: 'warn', summary: 'Incidències', detail: 'Heu de triar al menys un tipus d\'incidència' });
                return;
            }

            if ( this.studentsSelected.length === 0) {
                this.growl.add({ severity: 'warn', summary: 'Alumnes', detail: 'Heu de triar com a mínim un alumne' });
                return;
            }
        }

        this.rest.getStudents(this.selectedGroup.idGroup, new DateUtils(this.fromDate).toMysql(),
                              new DateUtils(this.toDate).toMysql()).toPromise().then( (d: any[]) => {

            this.rawReport = d;
            const selectedStudentIds = this.studentsSelected.map( (s) => s.id);


            const selectedBadgesTypes = [];
            if (this.selections.fa) {
                selectedBadgesTypes.push(BADGES_TYPES.FA);
            }
            if (this.selections.re) {
                selectedBadgesTypes.push(BADGES_TYPES.RE);
            }
            if (this.selections.hw) {
                selectedBadgesTypes.push(...BADGES_TYPES.HOMEWORK);
            }
            if (this.selections.cw) {
                selectedBadgesTypes.push(...BADGES_TYPES.CLASSWORK);
            }
            if (this.selections.bh) {
                selectedBadgesTypes.push(...BADGES_TYPES.BEHAVIOUR);
            }

            d.forEach( (s) => {
                s.summary = {fa: 0, re: 0, hw: {p: 0, m: 0}, cw: {p: 0, m: 0}, bh: {p: 0, m: 0} };
                s.badges.forEach( (b) => {
                    if (b.type === BADGES_TYPES.FA) {
                        s.summary.fa += 1;
                    } else if (b.type === BADGES_TYPES.RE) {
                        s.summary.re += 1;
                    } else if (BADGES_TYPES.HOMEWORK.indexOf(b.type) >= 0) {
                        if (SCORES[b.type] > 0) {
                            s.summary.hw.p += 1;
                        } else {
                            s.summary.hw.m += 1;
                        }
                    } else if (BADGES_TYPES.CLASSWORK.indexOf(b.type) >= 0) {
                        if (SCORES[b.type] > 0) {
                            s.summary.cw.p += 1;
                        } else {
                            s.summary.cw.m += 1;
                        }
                    } else if (BADGES_TYPES.BEHAVIOUR.indexOf(b.type) >= 0) {
                        if (SCORES[b.type] > 0) {
                            s.summary.bh.p += 1;
                        } else {
                            s.summary.bh.m += 1;
                        }
                    }
                });
                if (this.opts.tipusInforme === 1 ) {
                    s.badges = s.badges.filter( (b) => selectedBadgesTypes.indexOf(b.type) >= 0);
                }
            });

            let filteredReport;
            if (this.opts.tipusInforme == 1) {
                // First filter students
                filteredReport = d.filter( (s) => selectedStudentIds.indexOf(s.id) >= 0);
                // Now filter selected badges
                filteredReport.forEach( (s) => {
                    s.badges = s.badges.filter( (b) => selectedBadgesTypes.indexOf(b.type) >= 0);
                });
            } else {
                filteredReport  = d;
                this.doFiltering();
            }

            this.report = filteredReport;


        });

    }

    badgeName(type) {
        const lang = this.session.getLang();
        const desc = 'Badge';
        return (i18n_badges[lang] || {})[type] || desc;
    }

    search($event) {
            const text = $event.query.toUpperCase();
            this.suggestions = this.options.filter( (o) => o.toUpperCase().indexOf(text) >= 0 );
    }

    doFiltering() {
        if (!this.rawReport) {
            return;
        }
        const f = (this.filtre || '').trim().toLowerCase();
        if (f) {
            this.report = this.rawReport.filter( (s) => {
                return s.fullname.toLowerCase().indexOf(f) >= 0;
            });
        } else {
            this.report = this.rawReport;
        }
    }

    changed(text: string) {
        this.modelChanged.next(text);
    }
}
