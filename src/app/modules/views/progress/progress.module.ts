
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProgressComponent } from './progress.component';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../shared/shared.module';
import { GroupPickComponent } from '../../shared/grouppick/grouppick.component';
import { StudentPickComponent } from '../../shared/studentpick/studentpick.component';
import { DataListModule } from 'primeng/components/datalist/datalist';

const routes: Routes = [
  { path: '', component: ProgressComponent },
];

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    DataListModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule],
  declarations: [
    ProgressComponent
  ]

})
export class ProgressModule {}