
import { Component, OnInit, OnChanges, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { SessionService } from '../../../services/session.service';
import { HttpClient } from '@angular/common/http';
import { RestService } from '../../../services/rest.service';
 

@Component({
    selector: 'app-student-pick',
    templateUrl: 'studentpick.component.html'
})

export class StudentPickComponent implements OnInit, OnChanges {

    @Input() group: any;
    @Input() selection: any;
    @Output() changed = new EventEmitter<any>();
    students: any;
    constructor(private rest: RestService, private session: SessionService, private http: HttpClient) { }

    loadStudents() {
        if (this.group) {
            this.rest.listStudents(this.group.idGroup).subscribe(
                (res) => {
                    this.students = res;
                    if (this.students.length) {
                        this.selection = this.students[0];
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

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.group) {
            this.loadStudents();
        } else if (changes.selection) {
            const filtered = (this.students || []).filter( (s) => s.id === this.selection.id );
            if (filtered.length) {
                this.selection = filtered[0];
            }
        }
    }

    onSelect(s) {
        this.selection = s;
        this.changed.emit(s);
    }
}
