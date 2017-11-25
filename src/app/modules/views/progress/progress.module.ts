
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProgressComponent } from './progress.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared.module';
import { GroupPickComponent } from '../../shared/grouppick/grouppick.component';
import { StudentPickComponent } from '../../shared/studentpick/studentpick.component';
import { DataListModule } from 'primeng/components/datalist/datalist';
import { CalendarModule } from 'primeng/components/calendar/calendar';
import { OverlayPanelModule } from 'primeng/components/overlaypanel/overlaypanel';
import { DropdownModule } from 'primeng/components/dropdown/dropdown';
import { DataTableModule } from 'primeng/components/datatable/datatable';

// Clipboard module yields to errors
// import {  ClipboardModule } from 'ngx-clipboard';

const routes: Routes = [
  { path: '', component: ProgressComponent },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    DataListModule,
    CalendarModule,
    OverlayPanelModule,
    DropdownModule,
    DataTableModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule],
  declarations: [
    ProgressComponent
  ]

})
export class ProgressModule {}