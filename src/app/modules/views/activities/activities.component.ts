import { Component, OnInit, HostListener } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { RestService } from '../../../services/rest.service';
import { SessionService } from '../../../services/session.service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import { ConfirmationService } from 'primeng/components/common/confirmationservice';
import { MessageService } from 'primeng/components/common/messageservice';
import { DateUtils } from '../progress/date.utils';
import { Script } from './formulaeval';
import { FormulaContext } from './formulacontext';
import { BADGES_TYPES } from '../list/badge.logic';
import { DomSanitizer } from '@angular/platform-browser';
import { MenuItem } from 'primeng/components/common/menuitem';

const searchOptions = ['A)', 'B)', 'C)', 'D)', 'E)'];
const DECIMAL_PLACES = 2;

function toColumnName(num: number) {
    let ret, a, b;
    for (ret = '', a = 1, b = 26; (num -= a) >= 0; a = b, b *= 26) {
        ret = String.fromCharCode((num % b) / a + 65) + ret;
    }
    return ret;
}

@Component({
    selector: 'app-home-activities',
    templateUrl: 'activities.component.html',
    styles: [`
    .topbar-overlay {
        position:fixed;
        left:0;
        top:57px;
        width:100%;
        height:40px;
        max-height:40px;
        background: white;
        z-index: 1000;
    }
    `]
})

export class ActivitiesComponent implements OnInit {
    
    activityMenuItems: MenuItem[];
    columnsFiltered: any[];
    menuItems: MenuItem[];
    frozenWidth: string;
    unfrozenWidth: string;
    scrollHeight: string;
    script: any;
    formulaContext: any;
    beanActivity: any = {};
    rowsFiltered: any[];
    displayEditDlg = false;
    rows: any[];
    columns = [];
    selectedGroup: any;
    searchText = '';
    locale: any;
    activeTrimestre = 1;

    // Assignments stuff
    asgn = {
        displayAssignDlg: false,
        allStudents: [],
        selected: [],
        initialGrades: [
            {label: 'Pendent', value: -1},
            {label: 'No presentat', value: -2},
            {label: '0', value: 0},
            {label: '1', value: 1},
            {label: '2', value: 2},
            {label: '3', value: 3},
            {label: '4', value: 4},
            {label: '5', value: 5},
            {label: '6', value: 6},
            {label: '7', value: 7},
            {label: '8', value: 8},
            {label: '9', value: 9},
            {label: '10', value: 10},
        ],
        initialGrade: -1,
        override: false
    };

    @HostListener('window:resize', ['$event'])
    onResize(event) {
      this.scrollHeight = (window.innerHeight - 300) + 'px';
      const w = window.innerWidth;
      if (w > 400) {
          this.unfrozenWidth = (w - 210) + 'px';
          this.frozenWidth = 200 + 'px';
      } else {
          this.unfrozenWidth = (w - 110) + 'px';
          this.frozenWidth = 100 + 'px';
      }
    }


    search = (text$: Observable<string>) =>
        text$.debounceTime(200)
            .distinctUntilChanged()
            .map(term => term === '' ? []
                : searchOptions.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))

    constructor(private rest: RestService, private session: SessionService,
        private confirmationService: ConfirmationService, private growl: MessageService,
        private sanitizer: DomSanitizer) { }

    ngOnInit() {
        const self = this;
        this.menuItems = [
            {label: '1a', icon: 'fa-book', command: ($event) => { self.activeTrimestre = 1; self.update(this.selectedGroup); } },
            {label: '2a', icon: 'fa-book', command: ($event) => { self.activeTrimestre = 2; self.update(this.selectedGroup);  }},
            {label: 'Ord.', icon: 'fa-book', command: ($event) =>  { self.activeTrimestre = 3; self.update(this.selectedGroup); }},
            {label: 'Extr.', icon: 'fa-book', command: ($event) =>  { self.activeTrimestre = 4; self.update(this.selectedGroup); }}
        ];

        this.activityMenuItems = [
            {label: 'Assigna', icon: 'fa-list', command: ($event) => {
                console.log($event);
            }},
            {label: 'Esborra', icon: 'fa-trash', command: () => {} }
        ];

        this.scrollHeight = (window.innerHeight - 300) + 'px';
        const w = window.innerWidth;
        if (w > 400) {
            this.unfrozenWidth = (w - 210) + 'px';
            this.frozenWidth = 200 + 'px';
        } else {
            this.unfrozenWidth = (w - 110) + 'px';
            this.frozenWidth = 100 + 'px';
        }

        const userGroups = this.session.getUserGroups();

        // Delegate this to grouppicker
        // if (userGroups.length) {
        //    this.selectedGroup = userGroups[0];
        // }
        this.locale = this.session.createCalendarLocale();
        this.session.langChanged$.subscribe((ev) => this.session.createCalendarLocale());

        this.formulaContext = FormulaContext.create();
        this.script = new Script(this.formulaContext);
        this.update(this.selectedGroup);


    }

    applyFilter() {

        if (this.searchText.trim()) {
            this.rowsFiltered = this.rows.filter((e) => e.user.fullname.toLowerCase().indexOf(this.searchText.toLowerCase().trim()) >= 0);
        } else {
            this.rowsFiltered = this.rows;
        }

        this.updateStatistics();
    }

    update(g) {
        if (!g) {
            return;
        }
        this.selectedGroup = g;

        let fromDate = '';
        let toDate = '';
        if (this.activeTrimestre === 1) {
            fromDate = this.session.currentYear + '-09-10';
            toDate = this.session.currentYear + '-12-16';
        } else if (this.activeTrimestre === 2) {
            fromDate = this.session.currentYear + '-12-17';
            toDate = (this.session.currentYear + 1) + '-03-19';
        } else if (this.activeTrimestre === 3) {
            fromDate = (this.session.currentYear + 1) + '-03-20';
            toDate = (this.session.currentYear + 1) + '-06-20';
        } else if (this.activeTrimestre === 4) {
            fromDate = (this.session.currentYear + 1) + '-06-21';
            toDate = (this.session.currentYear + 1 ) + '-08-31';
        }

        this.rest.getStudents(this.selectedGroup.idGroup, fromDate, toDate).toPromise().then((data: any[]) => {
            this.script.setProperty('_badges',  data);

            // if (!this.asgn.allStudents.length) {
            //    this.asgn.allStudents = data;
            // }

            // Get the total number of sessions within this period
            const sessionDays = [];
            const homeworkSessionDays = [];
            data.forEach( (s) => {
                s.badges.forEach( (b) => {
                    if (sessionDays.indexOf(b.day) < 0) {
                        sessionDays.push(b.day);
                    }
                    if (BADGES_TYPES.HOMEWORK.indexOf(b.type) >= 0 && homeworkSessionDays.indexOf(b.day) < 0 ) {
                        homeworkSessionDays.push(b.day);
                    }
                });
            });

            this.script.setProperty('_SESSIONS', sessionDays.length);
            this.script.setProperty('_HOMEWORK_SESSIONS', homeworkSessionDays.length);

            // Load all activities associated with the selectedGroup
            this.rest.listActivities(this.selectedGroup.idGroup).subscribe(
                (d2: any[]) => {
                    d2.forEach((r: any, i: number) => {
                        r.field = r.id + '';
                        r.label = '$' + toColumnName(i + 1);
                    });
                    this.columns = d2;
                    this.columnsFiltered = d2.filter( (r) => r.trimestre === this.activeTrimestre );

                    this.rows = [];
                    this.rest.listGradesAll(this.selectedGroup.idGroup).subscribe(
                        (r: any[]) => {

                            // Must create empty objects for those activities which aren't assigned
                            r.forEach((e) => {
                                this.columns.forEach((c) => {
                                    if (!e[c.field]) {
                                        e[c.field] = { id: 0, idActivity: c.id, idUser: e.user.id, grade: '' };
                                    }
                                });
                            });
                            this.rows = r;
                            this.applyFilter();
                        }
                    );

                }
            );
        });
    }

    deleteActivity(act, evt?: any) {
        if ( evt ) {
            evt.preventDefault();
        }
        this.confirmationService.confirm({
            message: 'Segur que voleu esborrar ' + act.desc + '?',
            accept: () => {
                this.doDeleteActivity(act);
            }
        });
    }


    formatGrade(bean) {
        if (!bean) {
            return '';
        } else {
            const grade = bean.grade + '';
            if (grade === '-1') {
                return 'Pendent';
            } else if (grade === '-2') {
                return 'No presentat';
            } else {
                return grade;
            }
        }
    }

    doDeleteActivity(act) {
        this.rest.deleteActivity(act.id).toPromise().then((d: any) => {
            if (d.ok) {
                this.update(this.selectedGroup);
            } else {
                this.growl.add({ severity: 'error', summary: 'Error', detail: 'No s\'ha pogut eliminar l\'activitat' });
            }

        });
    }

    updateGrade(bean) {
        const str = (bean.grade + '').trim().replace(',', '.');
        let grade;
        try {
            grade = parseFloat(str);
        } catch (Ex) {
            return;
        }
        this.updateStatistics(bean.idActivity + '', bean.idUser);

        if (bean.id) {
            // update or delete
            if (str) {
                this.rest.updateGrade(bean.id, grade).toPromise().then((d: any) => {
                    if (!d.ok) {
                        this.growl.add({ severity: 'error', summary: 'Error', detail: 'No s\'ha pogut canviar la nota' });
                    }
                });
            } else {
                this.rest.deleteGrade(bean.id).toPromise().then((d: any) => {
                    if (!d.ok) {
                        this.growl.add({ severity: 'error', summary: 'Error', detail: 'No s\'ha pogut eliminar la nota' });
                    }
                });
            }
        } else {
            // create
            if (str) {
                this.rest.saveGrade(bean.idActivity, bean.idUser, grade).toPromise().then((d: any) => {
                    bean.id = d.id;
                    if (!d.ok) {
                        this.growl.add({ severity: 'error', summary: 'Error', detail: 'No s\'ha pogut afegir la nota ' + bean.grade });
                    }
                });
            }
        }
    }


    updateStatistics(columnField?: string, studentId?: number) {
        this.computeColumnFormulae(studentId);

        this.columns.forEach((c) => {

            if (!columnField || (columnField && c.field === columnField)) {

                let n = 0;
                let naproven = 0;
                let sumax = 0;
                let sumax2 = 0;
                this.rowsFiltered.forEach((r) => {
                    const nota = r[c.field];
                    if (nota) {
                        const grade = nota.grade;
                        let gradenum = parseFloat(grade);
                        if ((grade + '').length && (gradenum !== -1)) {
                            if (gradenum < -1) {
                                gradenum = 0;
                            }
                            n += 1;
                            if (gradenum >= 5) {
                                naproven += 1;
                            }
                            sumax += gradenum;
                            sumax2 += gradenum * gradenum;
                        }
                    }
                });

                if (n > 0) {
                    c.aproven = this.formulaContext.DECIMALS(naproven * 100 / n, DECIMAL_PLACES) + '%';
                    const mean = sumax / n;
                    c.mitjana = this.formulaContext.DECIMALS(mean, DECIMAL_PLACES) + '';
                    const sigma = Math.sqrt(sumax2 / n - mean * mean);
                    c.desvtipica = this.formulaContext.DECIMALS(sigma, DECIMAL_PLACES) + '';
                } else {
                    c.aproven = '---';
                    c.mitjana = '---';
                    c.desvtipica = '---';
                }
            }
        });

    }

    createActivity() {
        const beanActivity = {
            id: 0, trimestre: this.activeTrimestre || 1, desc: '', dia: new Date(),
            idCreator: this.session.getUser().id, idGroup: this.selectedGroup.idGroup,
            category: '', visible: 1, formula: '', weight: 1
        };
        this.editActivity(beanActivity);
    }

    editActivity(bean, evt?: any) {
        if ( evt ) {
            evt.preventDefault();
        }
        if (typeof (bean.dia) === 'string') {
            bean.dia = new Date(bean.dia);
        }
        this.beanActivity = { ...bean };  // Make a deep copy
        this.beanActivity.visible = (bean.visible === 1);
        this.displayEditDlg = true;
    }

    saveActivity() {
        // validate form
        if (!this.beanActivity.desc.trim()) {
            this.growl.add({ severity: 'warning', summary: 'Descripcció', detail: 'Es requireix una descripció de l\'activitat' });
            return;
        }
        if (!this.beanActivity.dia) {
            this.growl.add({ severity: 'warning', summary: 'Dia', detail: 'Heu d\'especificar un dia vàlid per l\'activitat' });
            return;
        }
        this.displayEditDlg = false;
        // commit changes from this.beanActivity

        const cB = this.beanActivity;
        const sB = {
            id: cB.id, trimestre: cB.trimestre, desc: cB.desc, dia: new DateUtils(cB.dia).toMysql(),
            idCreator: cB.idCreator, idGroup: cB.idGroup, weight: cB.weight, category: cB.category,
            visible: (cB.visible ? 1 : 0), formula: cB.formula
        };

        this.rest.saveActivity(sB).toPromise().then((d: any) => {
            if (d.ok) {

                if (!sB.id) {
                     // New activity show assignments menu
                     this.beanActivity.id = d.id;
                     this.mostraAssignacions(this.beanActivity);

                } else {
                    this.update(this.selectedGroup);
                }
            }
        });

    }


    computeColumnFormulae(studentId?: number) {

        // Array that holds all grades that has to be saved at once
        const toBeSaved = [];
        const toBeDeleted: number[] = [];
        const toBeSavedPointers = [];
        const toBeDeletedPointers = [];

        const shownErrors = [];

        this.columns.forEach((c) => {
            if (c.formula && c.formula.trim()) {

                this.rowsFiltered.forEach((r) => {
                    if (!studentId || (studentId && r.user.id === studentId )) {
                        this.columns.forEach((c2, i) => {
                            this.script.setProperty('$' + c2.field, r[c2.field].grade);
                            this.script.setProperty('$' + toColumnName(i + 1), r[c2.field].grade);
                        });

                        this.script.setProperty('$result',  null);
                        this.script.setProperty('_idUser', r.user.id);
                        try {
                            this.script.runInContext('$result=' + c.formula.toUpperCase());
                        } catch (Ex) {
                            if (shownErrors.indexOf(Ex + '') < 0) {
                                this.growl.add({severity: 'error', summary: 'Formula!', detail: Ex });
                                shownErrors.push(Ex + '');
                            }
                        }

                        // Update the computed value
                        const nota = r[c.field];
                        nota.grade = this.formulaContext.DECIMALS(this.formulaContext.$result, DECIMAL_PLACES);

                        // If this column is `visible` then must create an entry in database for the newly computed value
                        if (c.visible) {
                            if ((nota + '').length > 0) {
                                toBeSaved.push({idActivity: nota.idActivity, idUser: r.user.id, grade: nota.grade});
                                toBeSavedPointers.push(nota);
                                /*
                                this.rest.saveGrade(nota.idActivity, r.user.id, nota.grade).toPromise().then( (d: any) => {
                                    if (d.ok && !nota.id) {
                                        nota.id = d.id;
                                    }
                                });
                                */
                            } else if (nota.id && (nota + '').length === 0) {
                                toBeDeleted.push(nota.id);
                                toBeDeletedPointers.push(nota);
                                /*
                                this.rest.deleteGrade(nota.id).toPromise().then( (d: any) => {
                                    if (d.ok) {
                                        nota.id = 0;
                                    }
                                });
                                */
                            }
                        }
                    }
                });

            }
        });

        if (toBeSaved.length) {
            this.rest.saveGrades(toBeSaved).toPromise().then( (ds: [any]) => {
                ds.forEach( (r, i) => {
                    if (r.ok && !toBeDeletedPointers[i].id) {
                        toBeSavedPointers[i].id = r.id;
                    }
                });
            });
        }

        if (toBeDeleted.length) {
            this.rest.deleteGrades(toBeDeleted).toPromise().then( (ds: [any]) => {
                ds.forEach( (r, i) => {
                    if (r.ok) {
                        toBeDeletedPointers[i].id = 0;
                    }
                });
            });
        }
    }



    prepareWorbook() {

        const maxRow = 2 + this.rowsFiltered.length;
        const maxCol = toColumnName(2 + this.columns.length );

        const cf = [
            'C3:C' + maxRow, {                           // apply ws formatting ref 'A1:A10'
            type: 'expression',                          // the conditional formatting type
            priority: 1,                                 // rule priority order (required)
            formula: 'NOT(ISERROR(SEARCH("5", C3)))',   // formula that returns nonzero or 0
            style: 'redGrade'                            // a style object containing styles to apply
            }
        ];

        const sheet1 = {
            label: '1a Avaluació',
            cells: [],
            columns: { 2: {width: 45} },
            conditionalFormat: cf
        };

        const sheet2 = {
            label: '2a Avaluació',
            cells: [],
            columns: { 2: {width: 45} },
            conditionalFormat: cf
        };

        const sheet3 = {
            label: 'Ordinària',
            cells: [],
            columns: { 2: {width: 45} },
            conditionalFormat: cf
        };

        const sheet4 = {
            label: 'Extraordinària',
            cells: [],
            columns: { 2: {width: 45} },
            conditionalFormat: cf
        };

        const sheets = [ sheet1, sheet2, sheet3, sheet4 ];


        // Add a title in every sheet
        // Add students column in every sheet
        sheets.forEach((sheet, trimestre) => {
            sheet.cells.push({r: 1, c: 1, t: 's',
            v: this.selectedGroup.groupName + ' - ' + sheet.label + ' - ' + this.session.currentYear + '-' + (this.session.currentYear + 1),
            s: 'styleTitle'});

            sheet.cells.push({r: 2, c: 1, t: 's', v: 'Usuari', s: 'styleHeader' });
            sheet.cells.push({r: 2, c: 2, t: 's', v: 'Alumne/a', s: 'styleHeader' });

            const cols = this.columns.filter( (e) => e.trimestre === trimestre  + 1 );
            cols.forEach( (col, cind) => {
                sheet.cells.push({r: 2, c: 3 + cind, t: 's', v: col.desc, s: 'styleHeader' });
            });

            this.rowsFiltered.forEach( (r, i) => {
                sheet.cells.push({r: i + 3, c: 1, t: 's', v: r.user.username, s: 'styleLeftHeader' });
                sheet.cells.push({r: i + 3, c: 2, t: 's', v: r.user.fullname, s: 'styleLeftHeader' });

                // Now add the grades of this student
                cols.forEach( (col, cind) => {
                    const nota = r[col.field] || {};
                    const grade = nota.grade;
                    if (grade === -2) {
                        sheet.cells.push({r: i + 3, c: 3 + cind, t: 'n', v: 0 });
                    } else if (grade < 0 || grade === '') {
                        sheet.cells.push({r: i + 3, c: 3 + cind, t: 's', v: ''});
                    } else {
                        const cell = {r: i + 3, c: 3 + cind, t: 'n', v: grade || 0, f: ''};
                        if (col.formula) {
                            cell.f = 'contains formula';
                        }
                        sheet.cells.push(cell);
                    }
                });
            });
        });

        const wb = {
            filename: 'blocNotes' + this.selectedGroup.idGroup + '.xlsx',
            author: this.session.getUser().fullname,
            year: this.session.currentYear + '-' + (this.session.currentYear + 1),
            sheets: sheets,
            styles: {
                'styleTitle': {
                    font: {
                        color: '#0000FF',
                        size: 16,
                        bold: true
                    }
                },
                'styleHeader': {
                    font: {
                        color: '#000000',
                        size: 12,
                        bold: true
                    },
                    fill: {
                        type: 'pattern',
                        patternType: 'solid',
                        bgColor: '#EEEEEE',
                        fgColor: '#EEEEEE'
                    }
                },
                'styleLeftHeader': {
                    font: {
                        color: '#000000',
                        size: 12,
                        bold: false
                    },
                    fill: {
                        type: 'pattern',
                        patternType: 'solid',
                        bgColor: '#EEEEEE',
                        fgColor: '#EEEEEE'
                    }
                },
                'redGrade': {
                    font: {
                        color: '#FF0000',
                        size: 12,
                        bold: false
                    }
                }
            }
        };

        console.log(wb);


        this.rest.generateXLS(wb).toPromise().then( (response: any) => this.saveAs(new Blob([response],
            { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), wb.filename));


    }

    saveAs(blob, fileName) {
        if (window.navigator.msSaveOrOpenBlob) { // For IE:
            navigator.msSaveBlob(blob, fileName);
        } else { // For other browsers:
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = fileName;
            link.click();
            window.URL.revokeObjectURL(link.href);
        }
    }

    mostraAssignacions(bean: any, evt?: any) {
        if (evt) {
            evt.preventDefault();
        }

        this.displayEditDlg = false;
        // Hauriem d'estar segurs que carrega tots els estudiants del grup abans de mostrar el dialeg
        this.rest.listStudents(this.selectedGroup.idGroup).toPromise().then( (data: any[]) => {
            this.asgn.displayAssignDlg = true;
            this.asgn.allStudents = data;
            // Update the selection list
            this.asgn.override = false;
            this.asgn.selected = [];

            if (this.beanActivity.id) {
                // Read from table
                this.rows.forEach( (r) => {
                    const nota = r[this.beanActivity.id + ''];
                    if (nota != null && nota.grade != null && nota.grade !== '') {
                        this.asgn.selected.push({id: r.user.id, fullname: r.user.fullname});
                    }
                });
            }
        });

    }

    cancelAssignments() {
        this.asgn.displayAssignDlg = false;
        // this.update(this.selectedGroup);
    }

    saveAssignments() {
        this.asgn.displayAssignDlg = false;

        const defaultGrade = this.asgn.initialGrade;

        let toBeSaved = this.asgn.selected.map( (s) => {
            return {idActivity: this.beanActivity.id, idUser: s.id, grade: defaultGrade};
        });

        // Si no hi ha override elimina aquells que tinguin nota ja posada

        if (!this.asgn.override) {
            toBeSaved = toBeSaved.filter( (e) => {
                 // Read from table
                 const row = this.rows.filter( r => e.idUser === r.user.id);
                 if (row.length) {
                    const nota = row[0][this.beanActivity.id + ''];
                    return nota == null || nota.grade == null || nota.grade === '';
                 } else {
                     return true;
                 }
            });
        }


        if (toBeSaved.length) {
            this.rest.saveGrades(toBeSaved).toPromise().then( (ds: [any]) => {
                this.update(this.selectedGroup);
            });
        } else {
            this.update(this.selectedGroup);
        }
    }


    hideDropdown(c) {
        window.setTimeout(function() {
            c.dropdownShown = false;
        }, 300);
    }
}
