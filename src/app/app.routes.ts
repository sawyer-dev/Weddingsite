import { Routes } from '@angular/router';
import { Homepage } from './homepage/homepage';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: Homepage }
];
