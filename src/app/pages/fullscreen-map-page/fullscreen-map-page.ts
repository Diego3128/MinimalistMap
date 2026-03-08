import { Component, viewChild, ElementRef, OnInit, OnDestroy, AfterViewInit, signal, effect } from '@angular/core';

import { environment } from '../../../environments/environment';

import { Map, MapStyle, config, FullscreenControl, ScaleControl, MaptilerProjectionControl } from '@maptiler/sdk';

import '@maptiler/sdk/style.css';

import { CordinateSummary } from '../../shared/components/coordiante-summary/cordinate-summary';
import { Loader } from "../../shared/components/loader/loader";


const CORDS_KEY = "coords";
const ZOOM_KEY = "zoom";

const getInitialZoom = (): number => {
  const zoom = window.localStorage.getItem(ZOOM_KEY) ?? '10';
  let prevValue = parseFloat(zoom);
  if (isNaN(prevValue)) prevValue = 10;
  if (prevValue > 22 || prevValue < 0) prevValue = 10;
  return prevValue;
};

const getInitialCoordinates = () => {
  const defaultCords = { lng: -64.82337014905448, lat: 18.30097523738689 };
  const coords = JSON.parse(window.localStorage.getItem(CORDS_KEY) ?? '{}');
  if (!coords["lng"] || !coords["lat"]) return defaultCords;
  if (isNaN(parseFloat(coords["lng"])) || isNaN(parseFloat(coords["lat"]))) return defaultCords;
  return coords as { lng: number, lat: number };
}

@Component({
  selector: 'app-fullscreen-map-page',
  imports: [CordinateSummary, Loader],
  templateUrl: './fullscreen-map-page.html',
})
export class FullscreenMapPage implements OnInit, AfterViewInit, OnDestroy {

  private myMap: Map | undefined;

  private mapContainerRef = viewChild<ElementRef<HTMLDivElement>>("mapContainer");

  zoomValue = signal(getInitialZoom());

  coordinates = signal<{ lng: number, lat: number }>(getInitialCoordinates());

  loadingMap = signal(true);

  ngOnInit(): void {
    if (!environment.production) console.log({ environment });
    config.apiKey = environment.maptiler_api_key;
  }

  ngAfterViewInit(): void {
    console.log("ngAfterViewInit");
    const initialState = { lng: this.coordinates().lng, lat: this.coordinates().lat, zoom: this.zoomValue() };

    this.myMap = new Map({
      container: this.mapContainerRef()!.nativeElement,
      style: MapStyle.STREETS_V4,
      center: [initialState.lng, initialState.lat],
      zoom: initialState.zoom,
    });

    //start listening for events
    this.mapListeners();
  }

  // listens to events in the map to update values
  mapListeners = () => {
    if (this.myMap) {
      //
      this.myMap.on("zoomend", (e) => {
        const newZoom = e.target.getZoom();
        this.zoomValue.set(newZoom)
      })
      //
      this.myMap.on("moveend", (e) => {
        this.coordinates.set(e.target.getCenter());
      })
      //
      this.myMap.on("load", () => {
        this.loadingMap.set(false);
        this.myMap?.addControl(new FullscreenControl());
        this.myMap?.addControl(new ScaleControl());
        this.myMap?.addControl(new MaptilerProjectionControl());
      })

    }
  }

  // save to localstorage
  checkcoors = effect(() => {
    const coords = this.coordinates();
    window.localStorage.setItem(CORDS_KEY, JSON.stringify(coords));
  })

  // zooms the map when the zoom is changed by the custom range input or update by the event 'zoomend'
  zoomChange = effect(() => {
    const newZoom = this.zoomValue();
    this.myMap?.zoomTo(newZoom);
    window.localStorage.setItem(ZOOM_KEY, JSON.stringify(newZoom));
  })

  onNewZoomValue = (newZoom: number) => this.zoomValue.set(newZoom);

  // addMark = () => {
  //   // new Marker({ color: "#FF0000" })
  //   //   .setLngLat([initialState.lng, initialState.lat])
  //   //   .addTo(this.myMap);
  // }

  ngOnDestroy(): void {
    this.myMap?.remove();
  }
}
