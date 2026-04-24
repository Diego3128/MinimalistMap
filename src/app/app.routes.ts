import { Routes } from '@angular/router';
import { FullscreenMapPage } from './pages/fullscreen-map-page/fullscreen-map-page';
import { HousesPage } from './pages/houses-page/houses-page';

export const routes: Routes = [
  {
    path: 'open-map',
    component: FullscreenMapPage,
    title: 'Open map'
  },
  {
    path: 'locations',
    component: HousesPage,
    title: 'my markers'
  },
  {
    path: '**',
    redirectTo: 'open-map'
  }
];
