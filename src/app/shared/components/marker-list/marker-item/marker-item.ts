import { Component, computed, effect, ElementRef, input, output, signal, viewChild } from '@angular/core';
import { CustomMarker } from '../../../../services/map-service';
import { NgClass } from '@angular/common';
import { EditMarkerForm } from "./edit-marker-form/edit-marker-form";

export interface Marker {
  description: string;
  name: string;
  price: number;
  tags: string[];
}

@Component({
  selector: 'app-marker-item',
  imports: [NgClass, EditMarkerForm],
  templateUrl: './marker-item.html',
})
export class MarkerItem {

  marker = input.required<CustomMarker>();

  markerClick = output<string>();

  markerActive = output<string>();

  markerDelete = output<string>();

  markerUpdate = output<{ marker: Marker, id: string }>();

  currentCoordinates = input.required<{ lng: number, lat: number }>();

  isEditingMarker = signal(false);

  editInputNameElement = viewChild<ElementRef<HTMLInputElement>>("markerNameInput");

  toggleEditingMarker = (newValue: boolean) => {
    this.isEditingMarker.set(newValue)
  };

  updateMarker = (marker: Marker) => {
    // todo: emit whole marker
    this.markerUpdate.emit({ marker, id: this.marker().id });
    this.isEditingMarker.set(false)
  }

  checkInputFocus = effect(() => {
    const isEditing = this.isEditingMarker();
    const inputElement = this.editInputNameElement()?.nativeElement;
    if (inputElement) {
      if (isEditing) {
        inputElement.focus();
      } else inputElement.blur();
    }
  })

  isCurrentPosition = computed(() => {
    const { lng, lat } = this.marker().getLngLat();
    const currentLng = this.currentCoordinates().lng;
    const currentLat = this.currentCoordinates().lat;
    return currentLat === lat && currentLng === lng;
  })

  showMarkerToolTip = effect(() => {
    const showToolTip = this.isCurrentPosition();
    if (showToolTip) this.markerActive.emit(this.marker().id)
  })

  onMarkerClick(markerId: string) {
    this.markerClick.emit(markerId);
  }

  onDeleteMarker(markerId: string) {
    this.markerDelete.emit(markerId);
  }
}
