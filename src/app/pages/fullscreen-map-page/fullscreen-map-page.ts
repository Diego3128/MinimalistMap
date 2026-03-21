import { Component, viewChild, ElementRef, OnDestroy, AfterViewInit, inject, signal } from '@angular/core';

import { Map, MapStyle } from '@maptiler/sdk';

import { CordinateSummary } from '../../shared/components/coordiante-summary/cordinate-summary';
import { Loader } from "../../shared/components/loader/loader";
import { MapService } from '../../services/map-service';
import { Toggle } from '../../shared/components/toggle/toggle';
import { MarkerList } from "../../shared/components/marker-list/marker-list";
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-fullscreen-map-page',
  imports: [CordinateSummary, Loader, Toggle, MarkerList, NgClass],
  templateUrl: './fullscreen-map-page.html',
})
export class FullscreenMapPage implements AfterViewInit, OnDestroy {

  myMapService = inject(MapService);

  private mapContainerRef = viewChild<ElementRef<HTMLDivElement>>("mapContainer");

  showMarkerList = signal(false);

  ngAfterViewInit(): void {
    // create new map for the general service
    const initialState = { lng: this.myMapService.coordinates().lng, lat: this.myMapService.coordinates().lat, zoom: this.myMapService.zoomValue() };

    this.myMapService.myMap = new Map({
      container: this.mapContainerRef()!.nativeElement,
      style: MapStyle.STREETS_V4,
      center: [initialState.lng, initialState.lat],
      zoom: initialState.zoom,
    });

    //start listening to events
    this.myMapService.mapListeners();
  }

  toggleShowMarkerList = () => this.showMarkerList.update((prev) => !prev);

  createNewMarker = (name: string) => {
    this.myMapService.newMarkerName.set(name);
  }

  travelToMarker = (markerId: string) => {
    this.myMapService.goToMarkerPosition(markerId);
  }

  ngOnDestroy(): void {
    this.myMapService.loadingMap.set(true);
    this.myMapService.myMap?.remove();
  }
}
