import { Component, inject, OnInit, Signal, signal, WritableSignal } from '@angular/core';
import { LocalStorageMarker, MapService } from '../../services/map-service';
import { LocationCard } from "./LocationCard/LocationCard";
import { Loader } from "../../shared/components/loader/loader";

@Component({
  selector: 'app-houses-page',
  imports: [LocationCard, Loader],
  templateUrl: './houses-page.html',
})
export class HousesPage implements OnInit {

  private myMapService: MapService = inject(MapService);

  public loadingUserMarkers: WritableSignal<boolean> = signal(true);
  private userMarkers: WritableSignal<LocalStorageMarker[]> = signal([]);

  ngOnInit(): void {
    const markers: LocalStorageMarker[] = this.myMapService.getPlainStoredMarkers()
    setTimeout(() => {
      this.userMarkers.set(markers);
      this.loadingUserMarkers.set(false);
    }, 1000);
  }

  get userStoredMarkers() {
    return this.userMarkers;
  }

}
