import { NgModule } from '@angular/core';

import { GroupPickComponent } from './grouppick/grouppick.component';
import { StudentPickComponent } from './studentpick/studentpick.component';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/components/dropdown/dropdown';
import { FormsModule } from '@angular/forms';

@NgModule({
    imports: [CommonModule, FormsModule, DropdownModule],
    declarations: [GroupPickComponent, StudentPickComponent],
    providers: [],
    exports: [GroupPickComponent, StudentPickComponent]
})
export class SharedModule { }
