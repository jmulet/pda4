import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';
import { AccessGuard } from '../../services/accessguard.service';

const routes: Routes = [
  { path: '', component: HomeComponent, data: { requiresLogin: true }, canActivate: [ AccessGuard ] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
