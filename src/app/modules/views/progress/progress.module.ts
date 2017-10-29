
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProgressComponent } from './progress.component';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from '../../shared/shared.module';
import { GroupPickComponent } from '../../shared/grouppick/grouppick.component';
import { StudentPickComponent } from '../../shared/studentpick/studentpick.component';

const routes: Routes = [
  { path: '', component: ProgressComponent },
];

@NgModule({
  imports: [
    CommonModule,
    NgbModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule],
  declarations: [
    ProgressComponent
  ]

})
export class ProgressModule { 
    
}