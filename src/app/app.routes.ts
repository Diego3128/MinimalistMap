import { Routes } from '@angular/router';
import { FullscreenMapPage } from './pages/fullscreen-map-page/fullscreen-map-page';
import { HousesPage } from './pages/houses-page/houses-page';

export const routes: Routes = [
  {
    path: 'simplified-map',
    component: FullscreenMapPage,
    title: 'Simplified Map'
  },
  {
    path: 'locations',
    component: HousesPage,
    title: 'my locations'
  },
  {
    path: '**',
    redirectTo: 'simplified-map'
  }
];
