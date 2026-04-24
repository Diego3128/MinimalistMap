import { Component, viewChild, ElementRef, OnDestroy, AfterViewInit, inject, signal } from '@angular/core';

import { Map, MapStyle } from '@maptiler/sdk';

import { CordinateSummary } from '../../shared/components/coordiante-summary/cordinate-summary';
import { Loader } from "../../shared/components/loader/loader";
import { MapService } from '../../services/map-service';
import { Toggle } from '../../shared/components/toggle/toggle';
import { MarkerList } from "../../shared/components/marker-list/marker-list";
import { NgClass } from '@angular/common';
import { NewMarkerForm } from "./new-marker-form/new-marker-form";
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-fullscreen-map-page',
  imports: [CordinateSummary, Loader, Toggle, MarkerList, NgClass, NewMarkerForm],
  templateUrl: './fullscreen-map-page.html',
})
export class FullscreenMapPage implements AfterViewInit, OnDestroy {

  route = inject(ActivatedRoute);

  myMapService = inject(MapService);

  private mapContainerRef = viewChild<ElementRef<HTMLDivElement>>("mapContainer");

  showMarkerList = signal(false);

  ngAfterViewInit(): void {

    let initalLat = this.myMapService.coordinates().lat;
    let initalLng = this.myMapService.coordinates().lng;

    this.route.queryParamMap.subscribe({
      next(params) {
        const lat = parseFloat(params.get("lat") ?? "");
        const lng = parseFloat(params.get("lng") ?? "");
        // replace if they are valid
        if (lat && lng && (!isNaN(lat) && !isNaN(lng))) {
          // console.log("replacing for query param values");
          initalLat = lat;
          initalLng = lng;
        }
      },
    })
    // create new map for the general service
    const initialState = { lng: initalLng, lat: initalLat, zoom: this.myMapService.zoomValue() };

    console.log({ initialState });
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
