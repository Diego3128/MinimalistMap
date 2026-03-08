import { effect, Injectable, signal, untracked } from "@angular/core";
import { environment } from "../../environments/environment";
import { config, FullscreenControl, Map, MaptilerProjectionControl, ScaleControl } from "@maptiler/sdk";
import '@maptiler/sdk/style.css';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  // localstorage keys
  CORDS_KEY = "coords";
  ZOOM_KEY = "zoom";
  SYNC_DELAY = 2000;

  getInitialZoom = (): number => {
    const zoom = window.localStorage.getItem(this.ZOOM_KEY) ?? '10';
    let prevValue = parseFloat(zoom);
    if (isNaN(prevValue)) prevValue = 10;
    if (prevValue > 22 || prevValue < 0) prevValue = 10;
    return prevValue;
  };

  getInitialCoordinates = () => {
    const defaultCords = { lng: -64.82337014905448, lat: 18.30097523738689 };
    const coords = JSON.parse(window.localStorage.getItem(this.CORDS_KEY) ?? '{}');
    if (!coords["lng"] || !coords["lat"]) return defaultCords;
    if (isNaN(parseFloat(coords["lng"])) || isNaN(parseFloat(coords["lat"]))) return defaultCords;
    return coords as { lng: number, lat: number };
  }

  public myMap: Map | undefined;
  loadingMap = signal(true);
  zoomValue = signal(this.getInitialZoom());
  coordinates = signal<{ lng: number, lat: number }>(this.getInitialCoordinates());

  constructor() {
    console.log("init config");
    if (!environment.production) console.log({ environment });
    config.apiKey = environment.maptiler_api_key;
  }

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

    untracked(() => {
      setTimeout(() => {
        window.localStorage.setItem(this.CORDS_KEY, JSON.stringify(coords));
      }, this.SYNC_DELAY);
    })
  })

  // zooms the map when the zoom is changed by the custom range input or update by the event 'zoomend' // syncs with localstorage
  zoomChange = effect(() => {
    const newZoom = this.zoomValue();
    const currentZoom = this.myMap?.getZoom();

    if (this.myMap && newZoom !== currentZoom) this.myMap?.zoomTo(newZoom);

    untracked(() => {
      setTimeout(() => {
        window.localStorage.setItem(this.ZOOM_KEY, JSON.stringify(newZoom));
      }, this.SYNC_DELAY);
    })
  })

  //change the zoom with custom method
  onNewZoomValue = (newZoom: number) => this.zoomValue.set(newZoom);

  // addMark = () => { //TODO
  //   // new Marker({ color: "#FF0000" })
  //   //   .setLngLat([initialState.lng, initialState.lat])
  //   //   .addTo(this.myMap);
  // }

}
