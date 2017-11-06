import { Component, OnInit, HostListener } from '@angular/core';
import { RestService } from '../../../services/rest.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import { SessionService } from '../../../services/session.service';
import { BadgesLogic, BADGES_TYPES } from './badge.logic';
import { SCORES, rainbow } from './badgebutton.component';
import { TranslateService } from '@ngx-translate/core';
import { DateUtils } from '../progress/date.utils';

import { MessageService } from 'primeng/components/common/messageservice';
import { ConfirmationService } from 'primeng/components/common/confirmationservice';

const searchOptions: Array<String> = ['A)', 'B)', 'C)', 'D)', 'E)', 'F)', 'G)'];
 
@Component({
    selector: 'app-home-list',
    templateUrl: 'list.component.html',
    styleUrls: ['../../../../assets/css/pw-avatar.min.css', './list.styles.css']
})
export class ListComponent implements OnInit {
    isBusy: boolean;
    innerWidth: number;
    longEvent: any;
    dateAlert: boolean;
    isHoliday: boolean;
    today: Date; 

    selectedGroup2: any;
    isExpanded: boolean;
    selectedStudent: any;
    daySelected: string;
    dateSelected: Date;
    studentsFiltered = [];
    activeIds = [];
    students: any;
    selectedGroup: any;
    searchText: any;
    locale: any;
    displayDlg: boolean;

    @HostListener('window:resize', ['$event'])
    onResize(event) {
      this.innerWidth = window.innerWidth;
      if (!this.selectedStudent && this.innerWidth >= 990) {
        this.selectedStudent = this.studentsFiltered[0];
      }
    }

    formatter = (s: any) => s.fullname;

    search = (text$: Observable<string>) =>
        text$.debounceTime(200)
            .distinctUntilChanged()
            .map(term => term === '' ? []
                : searchOptions.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10));


    constructor(private rest: RestService, private session: SessionService, 
        private translate: TranslateService, private growl: MessageService,
        private confirmationService: ConfirmationService) { }

    ngOnInit() {
        this.dateAlert = false;
        this.today = new Date();
        this.dateSelected = new Date();
        const du = new DateUtils(this.dateSelected);
        this.isHoliday = du.isHoliday();
        this.daySelected = du.toMysql();
        this.selectedGroup = this.session.getUser().groups[0];
        this.update(this.selectedGroup);
        this.locale = this.session.createCalendarLocale();
        this.session.langChanged$.subscribe( (lang) => this.locale = this.session.createCalendarLocale() );
    }

    applyFilter() {
        if (this.searchText && this.searchText.trim()) {
            this.studentsFiltered = this.students.filter((s) => {
                const sf = this.searchText.trim().toLowerCase();
                return this.formatter(s).toLowerCase().indexOf(sf) >= 0;
            });
        } else {
            this.studentsFiltered = this.students;
        }

        if (this.innerWidth >= 990) {
            this.selectedStudent = this.studentsFiltered[0];
        }
    }

    createSemaphore(s) {
        s.semaphore1 = '';
        s.semaphore2 = '';
        s.semaphore3 = '';
        s.semaphore4 = '';

        let hasDeures, hasFeina, hasComportament = false;
        let notaDeures = 0, notaFeina = 0, notaComportament = 0;

        const n = s.badges.length;
        for (let i = 0; i < n; i++) {
            const b = s.badges[i];
            if (b.type === BADGES_TYPES.FA) {
                s.semaphore1 = 'yellow';
            } else if (b.type === BADGES_TYPES.RE) {
                s.semaphore1 = 'red';
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
            s.semaphore2 = 'rgb(' + rainbow(null, notaDeures) + ')';
        }

        if (hasFeina) {
            s.semaphore3 = 'rgb(' + rainbow(null, notaFeina) + ')';
        }

        if (hasComportament) {
            s.semaphore4 = 'rgb(' + rainbow(null, notaComportament) + ')';
        }

        // console.log(s.semaphore1, s.semaphore2, s.semaphore3, s.semaphore4);

    }

    update(g) {
        if (g !== this.selectedGroup) {
            this.selectedGroup = g;
            this.selectedStudent = null;
        }
        if (g.thmcss) {
            this.session.addCss(g.thmcss);
        }

        if (!g) {
            return;
        }

        this.rest.getStudents(g.idGroup, this.daySelected).subscribe(
            (res: Array<any>) => {
                res.forEach((s) => {
                    this.createSemaphore(s);
                });
                this.students = res;
                this.applyFilter();

                if (this.selectedStudent) {
                    this.selectedStudent = this.students.filter( (s) => s.id === this.selectedStudent.id)[0];
                }
            }
        );
    }

    onSelect(s, event) {
        event.preventDefault();
        this.selectedStudent = s;
        this.selectedGroup2 = { idGroup: this.selectedGroup.idGroup };
        // console.log('Sending to botonera', this.selectedStudent, this.selectedGroup2);
    }

    handleClick(evt) {
        // console.log('ListComponent:: has recieved a simple click from botonera ... update semaphore of ', this.selectedStudent);
        this.createSemaphore(this.selectedStudent);
    }

    longConfirm(mode) {
        this.displayDlg = false;
        if (mode <= 0) {
            return;  
        }

        // This is the information of the original badge which was clicked
        const type = this.longEvent.badge.type;
        const badgeId = this.longEvent.badge.idBadge;
        const idUser = this.longEvent.badge.idUser;

        const isAssistencia = (BADGES_TYPES.ATTENDANCE.indexOf(type) >= 0);
        const isHomework = (BADGES_TYPES.HOMEWORK.indexOf(type) >= 0);
        const isClasswork = (BADGES_TYPES.CLASSWORK.indexOf(type) >= 0);

        // If badgeId is set, then the clic was intended to remove the badge

        // this.selectedStudent = null;
        this.studentsFiltered.forEach((s) => {
            if (s.id !== idUser) {
                const logic = new BadgesLogic(s.badges, null, this.rest);
                const hasType = logic.filterType(type)[0];
                // console.log('**** hastype, bagdeid', hasType, badgeId);

                let canProceed = true;

                if (mode === 2) {
                    // Only apply if no other badge is in the category
                    if (isAssistencia) {
                        canProceed = (logic.filterType(BADGES_TYPES.ATTENDANCE).length === 0);
                    } else if (isHomework) {
                        canProceed = (logic.filterType(BADGES_TYPES.HOMEWORK).length === 0);
                    } else if (isClasswork) {
                        canProceed = (logic.filterType(BADGES_TYPES.CLASSWORK).length === 0);
                    }
                }
                if (canProceed) {
                    const isValid = logic.testAction(type, badgeId);
                    if (isValid) {
                        if (badgeId && hasType) {
                            logic.removeId(hasType.id);
                            this.createSemaphore(s);
                        } else if (!badgeId && !hasType) {
                            const score = SCORES[type] || 0;
                                logic.createBadge(s.id, this.daySelected, type, score, this.selectedGroup.idGroup).subscribe((e) =>
                                    this.createSemaphore(s)
                                );
                        }
                    }
                }
            }
        });
    }

    handleLongClick(evt) {
        this.longEvent = evt;
        this.displayDlg = true;
    }

    onDateChange() {
        const du = new DateUtils(this.dateSelected);
        this.isHoliday = du.isHoliday();
        this.daySelected = du.toMysql();
        this.today = new Date();
        if (DateUtils.compareDates(this.today, this.dateSelected) !== 0) {
            this.dateAlert = true;
        } else {
            this.dateAlert = false;
        }
        this.update(this.selectedGroup);
    }

    goToday() {
        this.dateSelected = new Date();
        this.onDateChange();
    }
}
