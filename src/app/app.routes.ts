import { Routes } from '@angular/router';
import { Homepage } from './homepage/homepage';
import { Shenanigans } from './shenanigans/shenanigans';
import { Quests } from './quests/quests';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: Homepage }
  ,{ path: 'shenanigans', component: Shenanigans }
  ,{ path: 'quests', component: Quests }
];
