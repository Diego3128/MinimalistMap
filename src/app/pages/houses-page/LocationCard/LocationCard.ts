import { Component, inject, input } from '@angular/core';
import { LocalStorageMarker } from '../../../services/map-service';
import { MiniMap } from "../MiniMap/minimap";
import { Router } from '@angular/router';

@Component({
  selector: 'app-location-card',
  imports: [MiniMap],
  templateUrl: './LocationCard.html',
})
export class LocationCard {

  router = inject(Router);

  marker = input.required<LocalStorageMarker>();

  openInMainMap() {
    this.router.navigate(["/open-map"], {
      queryParams: {
        lat: `${this.marker().lat}`,
        lng: `${this.marker().lng}`
      }
    })
  }

}
