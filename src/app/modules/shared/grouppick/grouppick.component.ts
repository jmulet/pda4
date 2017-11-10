
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SessionService } from '../../../services/session.service';

@Component({
    selector: 'app-group-pick',
    templateUrl: 'grouppick.component.html'
})

export class GroupPickComponent implements OnInit {
    dropdownShown = false;
    selected: any;
    groups: any;
    @Output() changed = new EventEmitter<any>();
    constructor(private session: SessionService) { }

    ngOnInit() {
        const user = this.session.getUser();
        if (user) {
            this.groups = user.groups;
            if (!this.selected) {
                this.selected = this.groups[0];
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
        this.changed.emit(g);
    }

    blur() {
        setTimeout( () => this.dropdownShown = false, 250);
    }

}
