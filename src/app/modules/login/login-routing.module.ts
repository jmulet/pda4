import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login.component';
import { AccessGuard } from '../../services/accessguard.service';

const routes: Routes = [
  { path: '', component: LoginComponent, data: { isLoginRoute: true }, canActivate: [ AccessGuard ] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginRoutingModule { }
