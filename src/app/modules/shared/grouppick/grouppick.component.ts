
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SessionService, USER_ROLES } from '../../../services/session.service';

@Component({
    selector: 'app-group-pick',
    templateUrl: 'grouppick.component.html'
})

export class GroupPickComponent implements OnInit {
    dropdownShown = false;
    selected: any;
    groups: any;
    ALLOWED_GROUP_ROLES = [USER_ROLES.admin, USER_ROLES.teacher, USER_ROLES.teacheradmin];


    @Output() changed = new EventEmitter<any>();
    constructor(private session: SessionService) { }

    ngOnInit() {

        this.groups = this.session.getUserGroups();
        if (!this.selected && this.groups.length) {
                this.selected = this.groups[0];
                if (this.selected.thmcss) {
                    this.session.addCss(this.selected.thmcss);
                }
        }
    }

    @Input() set selection(group) {
        if (group) {
            const filtered = (this.groups || []).filter((g) => g.idGroup === group.idGroup );
            if (filtered[0]) {
                this.selected = filtered[0];
            }
        } else if (this.groups) {
            this.selected = this.groups[0];
        }
    }

    onSelection(g) {
        this.selected = g;
        if (g.thmcss) {
            this.session.addCss(g.thmcss);
        }
        this.changed.emit(g);
    }

    blur() {
        setTimeout( () => this.dropdownShown = false, 250);
    }

}
