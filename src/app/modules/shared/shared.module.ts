import { NgModule } from '@angular/core';

import { GroupPickComponent } from './grouppick/grouppick.component';
import { StudentPickComponent } from './studentpick/studentpick.component';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
    imports: [CommonModule, NgbModule],
    declarations: [GroupPickComponent, StudentPickComponent],
    providers: [],
    exports: [GroupPickComponent, StudentPickComponent]
})
export class SharedModule { }
