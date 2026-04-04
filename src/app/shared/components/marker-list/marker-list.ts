import { Component, computed, inject, input, output } from '@angular/core';
import { CustomMarker, MapService } from '../../../services/map-service';
import { Marker, MarkerItem } from "./marker-item/marker-item";

@Component({
  selector: 'app-marker-list',
  imports: [MarkerItem],
  templateUrl: './marker-list.html',
})
export class MarkerList {

  myMapService = inject(MapService);

  markers = input<CustomMarker[]>([]);

  coordinates = input<{ lng: number, lat: number }>({ lng: 0, lat: 0 });

  emptyMarkers = computed(() => this.markers().length < 1);

  onMarkerClick = (markerId: string) => {
    this.myMapService.goToMarkerPosition(markerId);
  }

  onDeleteMarker = (markerId: string) => {
    this.myMapService.deleteMarker(markerId);
  }

  // uses myMapService to update a certain marker // this method is called for a marker-item component, listening to  the event 'onUpdateMarker'
  onUpdateMarker = (marker: Marker, markerId: string) => {
    this.myMapService.updateMarker({ ...marker, id: markerId });
  }

  showMarkerPopup = (markerId: string) => {
    this.myMapService.activateMarkerPopUp(markerId)
  }
}
