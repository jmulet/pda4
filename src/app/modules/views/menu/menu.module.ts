
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MenuComponent } from './menu.component';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
//import {SplitButtonModule} from 'primeng/components/splitbutton/splitbutton';



const routes: Routes = [
  { path: '', component: MenuComponent },
];

@NgModule({
  imports: [
      CommonModule,
      SharedModule,
      RouterModule.forChild(routes),
   //   SplitButtonModule
    ],
  exports: [RouterModule],
  declarations: [MenuComponent]
})
export class MenuModule { }