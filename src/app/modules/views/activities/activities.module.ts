
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ActivitiesComponent } from './activities.component';
import { SharedModule } from '../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTableModule } from 'primeng/components/datatable/datatable';
import { DialogModule } from 'primeng/components/dialog/dialog';
import { ConfirmDialogModule } from 'primeng/components/confirmdialog/confirmdialog';
import { ConfirmationService } from 'primeng/components/common/confirmationservice';
import { CalendarModule } from 'primeng/components/calendar/calendar';
import { TabMenuModule } from 'primeng/components/tabmenu/tabmenu';
import { PickListModule } from 'primeng/components/picklist/picklist';
import { DropdownModule } from 'primeng/components/dropdown/dropdown';
import { SplitButtonModule } from 'primeng/components/splitbutton/splitbutton';

const routes: Routes = [
  { path: '', component: ActivitiesComponent },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    DataTableModule,
    DialogModule,
    ConfirmDialogModule,
    CalendarModule,
    TabMenuModule,
    PickListModule,
    DropdownModule,
    SplitButtonModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule],
  declarations: [ActivitiesComponent],
  providers: [ConfirmationService]
})
export class ActivitiesModule { }