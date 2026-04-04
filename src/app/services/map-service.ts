import { effect, Injectable, signal, untracked } from "@angular/core";
import { environment } from "../../environments/environment";
import { config, FullscreenControl, Map, MapMouseEvent, MaptilerProjectionControl, Marker, Popup, ScaleControl } from "@maptiler/sdk";

// @ts-ignore
import '@maptiler/sdk/style.css';

import { UUID } from "../helpers/uuid";
import { Color } from "../helpers/color";

export type LocalStorageMarker = {
  id: string;
  description: string;
  name: string;
  price: number;
  tags: string[];
  // overwrite properties?
  lng: number;
  lat: number;
  color: string;
}

export type CustomMarker = Marker & LocalStorageMarker;

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

  private createCustomPopUp = (label: string, offset?: number): Popup => {
    const popupHTML = document.createElement("DIV");
    popupHTML.classList.add("popup-label");
    popupHTML.innerText = label;

    const popup = new Popup({ offset: 25 })
      .setDOMContent(popupHTML);
    return popup;
  }

  private addMarkerEvents = (marker: CustomMarker) => {
    marker.on("dragend", (e) => this.updateMarkerPosition(marker, e));

    marker.getElement().addEventListener("mouseenter", (e) => marker.togglePopup());
  }

  private createCustomMarker = ({ lng, lat, name, id, color, description, price, tags }:
    { lng: number, lat: number, name: string, description: string, price: number, tags: string[], id?: string, color?: string }): CustomMarker => {
    const newMarker = new Marker({ color: color ?? Color.getRandomColor(), draggable: true })
      .setLngLat([lng, lat]) as CustomMarker;

    newMarker.id = id ?? UUID.generateUUID();
    newMarker.name = name ?? "default name";
    newMarker.description = description ?? "default description"
    newMarker.price = price ?? 0;
    newMarker.tags = tags ?? ["default", "tags"];
    this.addMarkerEvents(newMarker);

    const popup = this.createCustomPopUp(name);
    newMarker.setPopup(popup);
    return newMarker;
  }

  getStoredMarkers = (): CustomMarker[] => {
    let markers = JSON.parse(localStorage.getItem(this.MARKERS_KEY) || '[]');
    //TODO: validate shape
    if (!Array.isArray(markers)) return []

    const localMarkers = markers as LocalStorageMarker[];

    console.log({ localMarkers });
    const customMarkers = (localMarkers).map((m) => {
      const lng = m.lng as number;
      const lat = m.lat as number;
      const id = m.id as string;
      const name = m.name as string ?? '';
      const color = m.color as string;
      const description = m.description as string;
      const price = m.price as number;
      const tags = m.tags as string[];

      // use createCustomMarker to create marker recovered from localstorage
      const marker = this.createCustomMarker({ lng, lat, name, id, color, description, price, tags });
      return marker;
    })
    //the markers are added to the map in the 'load' event
    return customMarkers;
  }


  public myMap: Map | undefined;
  loadingMap = signal(true);
  zoomValue = signal(this.getInitialZoom());
  coordinates = signal<{ lng: number, lat: number }>(this.getInitialCoordinates());

  // todo: Validate objet shape
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
        this.createNewCustomMarkerOnMap(e);
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

  newMarkerName = signal("");

  // must be set from new-marker-form
  newMarkerObject = signal<{ name: string, description: string, price: number, tags: string[] } | null>(null);

  //
  createNewCustomMarkerOnMap = (e: MapMouseEvent) => {
    if (!this.myMap || !this.isCreatingMarker() || !this.newMarkerObject()) return;
    // this method is only called when clicking a specific part of the map and when 'isCreatingMarker()' is true

    console.log("new marker to create:");
    console.log(this.newMarkerObject());

    const { lng, lat } = e.lngLat;
    const { name, description, price, tags } = this.newMarkerObject()!;
    // todo: update method createCustomMarker so it takes all the necessary information
    const newMarker = this.createCustomMarker({ lng, lat, name, description, price, tags });
    newMarker.addTo(this.myMap!);

    this.markers.update((prev) => [...prev, newMarker as CustomMarker]);

    this.newMarkerObject.set(null); // reset signal that holds name
    this.isCreatingMarker.set(false); // reset signal that tells if we are creaitng a marker
  }

  addMarkersToMap = () => {
    // takes markers already in the signal markers and adds them to the map
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

  // handle change of position. update markers signal and localstorage
  updateMarkerPosition = (marker: CustomMarker, event) => {
    if (!environment.production) console.log("marker changed position:");
    // console.log({ marker, event });
    const { lng, lat } = event.target.getLngLat();
    const updatedMarkers = this.markers().map((m) => {
      if (m.id === marker.id) m.setLngLat({ lng, lat });
      return m;
    });

    this.markers.set(updatedMarkers);
  }

  goToMarkerPosition = (markerId: string) => {
    const marker = this.markers().find(m => m.id === markerId);
    if (!marker || !this.myMap) return;
    // this.myMap.flyTo({ center: marker.getLngLat() });
    this.myMap.jumpTo({ center: marker.getLngLat() });
  }

  deleteMarker = (markerId: string) => {
    const markers = this.markers();
    const markerToBeDeleted = markers.find(m => m.id === markerId);
    if (!markerToBeDeleted || !this.myMap) return;

    markerToBeDeleted.remove();
    this.markers.update((sMarkers) => sMarkers.filter(m => m.id !== markerId));
  }

  updateMarker = (newMarkerInfo: { id: string, name: string, description: string, tags: string[], price: number }) => {
    // console.log("updating marker", newMarkerInfo);
    const markers = this.markers();
    const markerToBeUpdated = markers.find(m => m.id === newMarkerInfo.id);
    if (!markerToBeUpdated || !this.myMap) return;

    this.markers.update((prevMarkers => prevMarkers.map((m) => {
      if (m.id === newMarkerInfo.id) {
        m.name = newMarkerInfo.name,
          m.description = newMarkerInfo.description,
          m.tags = newMarkerInfo.tags,
          m.price = newMarkerInfo.price
        //sync marker's popup
        this.updateMarkerPopup(m.id);
      };
      return m;
    })))
  }
  //
  updateMarkerPopup = (markerId: string) => {
    const marker = this.markers().find(m => m.id === markerId);
    if (!marker) return;
    const popup = marker.getPopup();
    popup.setText(marker.name);
  }

  activateMarkerPopUp = (markerId: string) => {
    const marker = this.markers().find(m => m.id === markerId);
    if (!marker) return;
    marker.togglePopup();
  }

  // sync markers with localstorage
  syncMarkers = effect(() => {

    if (!environment.production) console.log("save marker changes to local storage");
    const markers = this.markers();

    const formatedMarkers: LocalStorageMarker[] = markers.map((m) => ({
      id: m.id, // Keep the ID!
      name: m.name, // Keep the ID!
      description: m.description ?? 'no description lcstorage',
      price: m.price ?? 0,
      tags: m.tags ?? ["a", "e"],
      lng: m.getLngLat().lng,
      lat: m.getLngLat().lat,
      color: m._color, // Hardcoded or dynamic
    }));

    console.log({ formatedMarkers });

    untracked(() => {
      window.localStorage.setItem(this.MARKERS_KEY, JSON.stringify(formatedMarkers));
    })
  })

}
