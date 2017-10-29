import { Component, OnInit } from '@angular/core';
import { SessionService } from '../../../services/session.service';
import { RestService } from '../../../services/rest.service';


@Component({
    selector: 'app-home-progress',
    templateUrl: 'progress.component.html'
})

export class ProgressComponent implements OnInit {
    students: Object;
    user: any;
    groupSelected: any;
    studentSelected: any;

    constructor(private session: SessionService, private rest: RestService) { }

    ngOnInit() {
        this.user = this.session.getUser();
        if (this.user) {
            this.groupSelected = this.user.groups[0];
        }
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

    update() {
        if (!this.groupSelected ||  !this.studentSelected) {
            return;
        }
        this.rest.getStudents(this.groupSelected.idGroup, '').subscribe(
            (res) => {
                this.students = res;
            }
        );
        console.log('ProgressView update on', this.groupSelected, this.studentSelected);
    }

}
