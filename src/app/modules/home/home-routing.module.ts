import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';
import { AccessGuard } from '../../services/accessguard.service';

const children: Routes = [
  { path: '', redirectTo: 'menu', pathMatch: 'full' },
  { path: 'menu', loadChildren: '../views/menu/menu.module#MenuModule', data: { requiresLogin: true }, canActivate: [ AccessGuard ] },
  { path: 'list', loadChildren: '../views/list/list.module#ListModule', data: { requiresLogin: true }, canActivate: [ AccessGuard ] },
  { path: 'activities', loadChildren: '../views/activities/activities.module#ActivitiesModule', 
                                                                        data: { requiresLogin: true }, canActivate: [ AccessGuard ] },
  { path: 'progress', loadChildren: '../views/progress/progress.module#ProgressModule', canActivate: [ AccessGuard ] },
  { path: 'reports', loadChildren: '../views/reports/reports.module#ReportsModule', canActivate: [ AccessGuard ] },
  {path: '**', component: HomeComponent}
];


const routes: Routes = [
  { path: '', component: HomeComponent, data: { requiresLogin: true }, canActivate: [ AccessGuard ], children: children}
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
