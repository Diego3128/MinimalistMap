import { Routes } from '@angular/router';
import { FullscreenMapPage } from './pages/fullscreen-map-page/fullscreen-map-page';
import { MarkersPage } from './pages/markers-page/markers-page';
import { HousesPage } from './pages/houses-page/houses-page';

export const routes: Routes = [
  {
    path: 'open-map',
    component: FullscreenMapPage,
    title: 'Open map'
  },
  {
    path: 'marker',
    component: MarkersPage,
    title: 'your markers'
  },
  {
    path: 'locations',
    component: HousesPage,
    title: 'my maps'
  },
  {
    path: '**',
    redirectTo: 'open-map'
  }
];
