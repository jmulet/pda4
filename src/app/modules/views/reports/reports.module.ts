
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportsComponent } from './reports.component';
import { CalendarModule } from 'primeng/components/calendar/calendar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { DataTableModule } from 'primeng/components/datatable/datatable';
import { PickListModule } from 'primeng/components/picklist/picklist';
import { RadioButtonModule } from 'primeng/components/radiobutton/radiobutton';
import { AutoCompleteModule } from 'primeng/components/autocomplete/autocomplete';

const routes: Routes = [
  { path: '', component: ReportsComponent },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    DataTableModule,
    CalendarModule,
    PickListModule,
    RadioButtonModule,
    AutoCompleteModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule],
  declarations: [ReportsComponent]
})
export class ReportsModule { }