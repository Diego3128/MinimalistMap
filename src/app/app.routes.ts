import { Routes } from '@angular/router';
import { FullscreenMapPage } from './pages/fullscreen-map-page/fullscreen-map-page';
import { MarkersPage } from './pages/markers-page/markers-page';
import { HousesPage } from './pages/houses-page/houses-page';

export const routes: Routes = [
  {
    path: 'fullscreen',
    component: FullscreenMapPage,
    title: 'full screen map'
  },
  {
    path: 'marker',
    component: MarkersPage,
    title: 'your markers'
  },
  {
    path: 'houses',
    component: HousesPage,
    title: 'available properties'
  },
  {
    path: '**',
    redirectTo: 'fullscreen'
  }
];
