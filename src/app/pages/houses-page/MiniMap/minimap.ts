import { Component, ElementRef, input, OnInit, viewChild } from "@angular/core";
import { Map, MapStyle, Marker } from "@maptiler/sdk";
import { createCustomPopUp } from '../../../services/helpers/create-popup';


@Component({
  selector: "app-minimap",
  template: `<div class="absolute! w-full h-full" #minimapContainer></div>`
})
export class MiniMap implements OnInit {

  initialState = input.required<{ lng: number, lat: number, popupColor: string, popupName: string }>();

  private minimapContainerRef = viewChild<ElementRef<HTMLDivElement>>("minimapContainer");


  public ngOnInit(): void {
    //note: The component HousesPage calls uses the MapService. In the MapService's constructor the maptiler config is initialized, passing the apiKey. No need to use it when creating every map

    const { lat, lng, popupColor, popupName } = this.initialState();

    const element = this.minimapContainerRef()?.nativeElement;
    if (element) {
      // add map to element
      const map = new Map({
        container: element,
        style: MapStyle.STREETS_V4,
        // apiKey: environment.maptiler_api_key,
        center: { lat, lng },
        zoom: 15,
        geolocateControl: false,
        projectionControl: false,
        navigationControl: false
      });

      //add marker
      const marker = this.createMarker(popupName, popupColor, lat, lng);
      marker.addTo(map);
    }
  }

  private createMarker(title: string, color: string, lat: number, lng: number): Marker {
    const marker = new Marker({ color });
    marker.setLngLat({ lat, lng });
    const popup = createCustomPopUp(title);
    marker.setPopup(popup);
    marker.getElement().addEventListener("mouseenter", (e) => marker.togglePopup());
    return marker
  }


}
