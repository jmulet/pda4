
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListComponent } from './list.component';
import { CommonModule, NgStyle } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { GroupPickComponent } from '../../shared/grouppick/grouppick.component';
import { FormsModule } from '@angular/forms';
import { BotoneraComponent } from './botonera.component';
import { LongPressDirective } from './longpress.directive';
import { BadgeButtonComponent } from './badgebutton.component';

import { CalendarModule } from 'primeng/components/calendar/calendar';
import { TabViewModule } from 'primeng/components/tabview/tabview';
import { DialogModule } from 'primeng/components/dialog/dialog';
import { ConfirmDialogModule } from 'primeng/components/confirmdialog/confirmdialog';
import { ConfirmationService } from 'primeng/components/common/confirmationservice';
import { AutoCompleteModule } from 'primeng/components/autocomplete/autocomplete';

const routes: Routes = [
  { path: '', component: ListComponent },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    CalendarModule,
    TabViewModule,
    DialogModule,
    ConfirmDialogModule,
    AutoCompleteModule,
    RouterModule.forChild(routes)
],
  exports: [RouterModule],
  declarations: [ListComponent, BotoneraComponent, BadgeButtonComponent, LongPressDirective],
  providers: [ConfirmationService]
})
export class ListModule {
}