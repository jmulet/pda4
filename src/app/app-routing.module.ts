import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// import { LoginModule } from './modules/login/login.module';

const routes: Routes = [
  { path: 'login', loadChildren: './modules/login/login.module#LoginModule'},
  { path: 'home', loadChildren: './modules/home/home.module#HomeModule' },
  { path: '', redirectTo: 'login', pathMatch: 'full'},
  { path: '**', redirectTo: 'login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
