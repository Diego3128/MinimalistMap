import { effect, Injectable, signal, untracked } from "@angular/core";
import { environment } from "../../environments/environment";
import { config, FullscreenControl, Map, MapMouseEvent, MaptilerProjectionControl, Marker, ScaleControl } from "@maptiler/sdk";
import '@maptiler/sdk/style.css';

import { UUID } from "../helpers/uuid";
import { Color } from "../helpers/color";

type CustomMarker = Marker & {
  id: string;
}

@Injectable({
  providedIn: 'root'
})
export class MapService {
  // localstorage keys
  CORDS_KEY = "coords";
  ZOOM_KEY = "zoom";
  MARKERS_KEY = "markers";
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


  getStoredMarkers = () => {
    let markers = JSON.parse(localStorage.getItem(this.MARKERS_KEY) || '[]');
    //todo: validate shape
    if (!Array.isArray(markers)) return []

    console.log({ markers });
    const customMarkers = (markers).map((m) => {
      const lng = m.lng as number;
      const lat = m.lat as number;
      const id = m.id as string;
      const color = m.color as string;

      const marker = new Marker({ draggable: true, color: color })
        .setLngLat({ lat, lng }) as CustomMarker
      marker.id = id;
      marker.on("dragend", (e) => this.updateMarkerPosition(marker, e));

      return marker;
    })
    //the markers are added to the map in the 'load' event
    return customMarkers;
  }


  public myMap: Map | undefined;
  loadingMap = signal(true);
  zoomValue = signal(this.getInitialZoom());
  coordinates = signal<{ lng: number, lat: number }>(this.getInitialCoordinates());

  // todo: get localstorage markes. Validate objet shape
  public markers = signal<CustomMarker[]>(this.getStoredMarkers());

  public isCreatingMarker = signal(false); // when true user can create a marker with a click on the map
  public showMarkers = signal(true); // TODO: show markers?

  constructor() {
    console.log("init config");
    if (!environment.production) console.log({ environment });
    config.apiKey = environment.maptiler_api_key;
  }

  toggleCreatingMarker = () => this.isCreatingMarker.update((prev) => !prev);

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
      this.myMap.on("click", (e) => {
        this.addMark(e);
      })
      //
      this.myMap.on("load", () => {
        this.loadingMap.set(false);
        this.myMap?.addControl(new FullscreenControl());
        this.myMap?.addControl(new ScaleControl());
        this.myMap?.addControl(new MaptilerProjectionControl());
        //add markers
        if (this.showMarkers()) this.addMarkersToMap();

      })

    }
  }

  addMark = (e: MapMouseEvent) => {
    if (!this.myMap || !this.isCreatingMarker()) return;

    const { lng, lat } = e.lngLat;
    const newMarker = this.createCustomMarker(lng, lat)
      .addTo(this.myMap!);

    this.markers.update((prev) => [...prev, newMarker as CustomMarker]);
  }

  addMarkersToMap = () => {
    this.markers().forEach(m => {
      if (this.myMap) m.addTo(this.myMap);
    });
  }
  // todo: when showMarkers = false
  // removeMarkersFromMap = () => {}

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



  private createCustomMarker = (lng: number, lat: number, id?: string): CustomMarker => {
    const newMarker = new Marker({ color: Color.getRandomColor(), draggable: true })
      .setLngLat([lng, lat]) as CustomMarker;

    newMarker.id = id ?? UUID.generateUUID();
    newMarker.on("dragend", (e) => this.updateMarkerPosition(newMarker, e));
    return newMarker;
  }

  // handle change of position. update markers signal and localstorage
  updateMarkerPosition = (marker: CustomMarker, event) => {
    console.log("marker changed position:");
    console.log({ marker, event });
    const { lng, lat } = event.target.getLngLat();
    // this.markers.update((marker)=>)
    const updatedMarkers = this.markers().map((m) => {
      if (m.id === marker.id) m.setLngLat({ lng, lat });
      return m;
    });

    this.markers.set(updatedMarkers);
  }
  // sync markers with localstorage
  syncMarkers = effect(() => {
    console.log("save changes to local storage");
    const markers = this.markers();

    const formatedMarkers = markers.map((m) => ({
      id: m.id, // Keep the ID!
      lng: m.getLngLat().lng,
      lat: m.getLngLat().lat,
      color: m._color, // Hardcoded or dynamic
      draggable: true
    }));

    untracked(() => {
      window.localStorage.setItem(this.MARKERS_KEY, JSON.stringify(formatedMarkers));
    })
  })

  // TODO: remove mark: with marker.remove()!. add event 'click' to marker and delete it if a certain condition is true

}
