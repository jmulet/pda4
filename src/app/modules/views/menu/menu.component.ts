import { Component, OnInit } from '@angular/core';
// import { Message } from 'primeng/components/common/api';
import { MessageService } from 'primeng/components/common/messageservice';
import { SessionService } from '../../../services/session.service';

@Component({
    selector: 'app-home-menu',
    templateUrl: 'menu.component.html',
    styleUrls: ['menu.css']
})

export class MenuComponent implements OnInit {
    version: string;
    constructor(private messageService: MessageService, private session: SessionService) { }

    ngOnInit() {
        this.version = this.session.version;
    }
}
