import { Component, computed, effect, ElementRef, input, output, signal, viewChild } from '@angular/core';
import { CustomMarker } from '../../../../services/map-service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-marker-item',
  imports: [NgClass],
  templateUrl: './marker-item.html',
})
export class MarkerItem {

  marker = input.required<CustomMarker>();

  markerClick = output<string>();

  markerDelete = output<string>();

  markerUpdate = output<{ markerId: string, newName: string }>();

  currentCoordinates = input.required<{ lng: number, lat: number }>();

  isEditingMarker = signal(false);

  editInputNameElement = viewChild<ElementRef<HTMLInputElement>>("markerNameInput");

  toggleEditingMarker = (newValue: boolean) => {
    this.isEditingMarker.set(newValue)
  };

  updateMarkerName = (markerId: string, newName: string) => {
    if (!newName || !newName.trim()) return;
    this.isEditingMarker.set(false)
    this.markerUpdate.emit({ markerId, newName });
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


  onMarkerClick(markerId: string) {
    this.markerClick.emit(markerId);
  }

  onDeleteMarker(markerId: string) {
    this.markerDelete.emit(markerId);
  }
}
