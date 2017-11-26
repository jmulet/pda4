
import { Component, OnInit, OnChanges, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { SessionService } from '../../../services/session.service';
import { HttpClient } from '@angular/common/http';
import { RestService } from '../../../services/rest.service';
import { SelectItem } from 'primeng/components/common/selectitem';

@Component({
    selector: 'app-student-pick',
    templateUrl: 'studentpick.component.html'
})

export class StudentPickComponent implements OnInit, OnChanges {
    dropdownShown = false;
    @Input() group: any;
    selection: any;
    @Output() changed = new EventEmitter<any>();
    students: SelectItem[];
    isDisabled: boolean;

    constructor(private rest: RestService, private session: SessionService, private http: HttpClient) { }

    loadStudents() {
        if (this.group) {

            this.rest.listStudents(this.group.idGroup).subscribe(
                (res: any[]) => {
                    this.students = new Array(res.length);
                    res.forEach( (e, i) => {
                        this.students[i] = {label: e.fullname, value: e};
                    });
 
                    if (this.students.length) {
                        this.selection = this.students[0].value;
                        this.changed.emit(this.selection);
                    }
                }
            );
        } else {
            this.students = [];
        }
    }

    ngOnInit() {
        this.loadStudents();
    }

    @Input() set disabled(d) {
        this.isDisabled = d;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.group) {
            this.loadStudents();
        } else if (changes.selection) {
            const filtered = (this.students || []).filter( (s) => s.value.id === this.selection.id );
            if (filtered.length) {
                this.selection = filtered[0].value;
            }
        }
    }

    onSelect(evt) {
        this.selection = evt.value;
        this.changed.emit(this.selection);
    }


}
