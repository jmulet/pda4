
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
    isDisabled: boolean;
    ALLOWED_GROUP_ROLES = [USER_ROLES.admin, USER_ROLES.teacher, USER_ROLES.teacheradmin];


    @Output() changed = new EventEmitter<any>();
    constructor(private session: SessionService) { }

    ngOnInit() {

        this.groups = this.session.getUserGroups();

        if (!this.selected) {
            const selIdGroup = this.session.getRememberMe().getSelectedGroup().idGroup;
            if (selIdGroup) {
                const filtered = (this.groups || []).filter((g) => g.idGroup === selIdGroup);
                if (filtered[0] ) {
                    this.selected = filtered[0];
                }
            } else if (this.groups.length) {
                this.selected = this.groups[0];
            }
        }

        if (this.selected) {
            this.onSelection(this.selected);
        }
    }


    /**
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
    **/

    @Input() set disabled(d) {
        this.dropdownShown = false;
        this.isDisabled = d;
    }


    onSelection(g) {
        this.selected = g;
        this.session.getRememberMe().setSelectedGroup(g);
        if (g.thmcss) {
            this.session.addCss(g.thmcss);
        }
        this.changed.emit(g);
    }

    blur() {
        setTimeout( () => this.dropdownShown = false, 250);
    }

}
