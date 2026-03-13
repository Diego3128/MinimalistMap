import { Component, viewChild, ElementRef, OnDestroy, AfterViewInit, inject } from '@angular/core';

import { Map, MapStyle } from '@maptiler/sdk';

import { CordinateSummary } from '../../shared/components/coordiante-summary/cordinate-summary';
import { Loader } from "../../shared/components/loader/loader";
import { MapService } from '../../services/map-service';
import { Toggle } from '../../shared/components/toggle/toggle';

@Component({
  selector: 'app-fullscreen-map-page',
  imports: [CordinateSummary, Loader, Toggle],
  templateUrl: './fullscreen-map-page.html',
})
export class FullscreenMapPage implements AfterViewInit, OnDestroy {

  myMapService = inject(MapService);

  private mapContainerRef = viewChild<ElementRef<HTMLDivElement>>("mapContainer");

  ngAfterViewInit(): void {
    const initialState = { lng: this.myMapService.coordinates().lng, lat: this.myMapService.coordinates().lat, zoom: this.myMapService.zoomValue() };

    this.myMapService.myMap = new Map({
      container: this.mapContainerRef()!.nativeElement,
      style: MapStyle.STREETS_V4,
      center: [initialState.lng, initialState.lat],
      zoom: initialState.zoom,
    });
    //start listening for events
    this.myMapService.mapListeners();

  }

  ngOnDestroy(): void {
    this.myMapService.loadingMap.set(true);
    this.myMapService.myMap?.remove();
  }
}
