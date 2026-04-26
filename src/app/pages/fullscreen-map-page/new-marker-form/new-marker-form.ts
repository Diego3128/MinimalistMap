import { JsonPipe, NgClass } from '@angular/common';
import { Component, effect, inject, input, output } from '@angular/core';
import { FormArray, FormBuilder, FormControlName, ReactiveFormsModule, Validators, FormControlStatus } from '@angular/forms';
import { FormErrorMessage } from '../../../shared/components/form-error-message/form-error-message';
import { MapService } from '../../../services/map-service';

interface NewMarker {
  description: string;
  name: string;
  price: number;
  tags: string[];
}

@Component({
  selector: 'app-new-marker-form',
  // imports: [NgClass, ReactiveFormsModule, FormErrorMessage],
  imports: [NgClass, ReactiveFormsModule, FormErrorMessage],
  templateUrl: './new-marker-form.html',
})
export class NewMarkerForm {

  private fb = inject(FormBuilder);

  private myMapService = inject(MapService);

  newMarker = output<NewMarker>();
  //when true the marker is displayed
  isCreatingMarker = input.required<boolean>();

  newMarkerForm = this.fb.group({
    name: ["", [Validators.required]],
    description: ["", [Validators.required]],
    price: [0, [Validators.min(0)]],
    tags: this.fb.array([], [Validators.required, Validators.minLength(2)])
  })

  get newMarkerTags() {
    return this.newMarkerForm.get("tags") as FormArray;
  }

  addNewTag = (tag: string) => {
    if (!tag || tag.length > 10) return; // Prevent adding if it violates rules immediately
    // adds a form group to the array
    this.newMarkerTags.push(this.fb.control(tag, [Validators.required, Validators.maxLength(10)]))
  }

  deleteTag = (i: number) => this.newMarkerTags.removeAt(i);

  formStaus = this.newMarkerForm.statusChanges.subscribe({
    next: (value: FormControlStatus) => {
      // auto-send form
      if (value === "VALID") this.onSubmit()
    },
  });

  resetForm = effect(() => {
    const isCreatingMarker = this.myMapService.isCreatingMarker();
    if (!isCreatingMarker) {
      // console.log('reset form');
      this.newMarkerForm.reset()
      this.newMarkerForm.controls.tags.clear()
    };
  })

  onSubmit = () => {
    this.newMarkerForm.markAllAsTouched();
    if (this.newMarkerForm.invalid) return;
    const newMarker = {
      name: this.newMarkerForm.controls.name.value as string,
      description: this.newMarkerForm.controls.description.value as string,
      price: this.newMarkerForm.controls.price.value as number,
      tags: this.newMarkerForm.controls.tags.value as string[],
    }
    this.myMapService.newMarkerObject.set(newMarker);
  }

  getFormValidationErrors() {
    const errors: any = {};
    Object.keys(this.newMarkerForm.controls).forEach(key => {
      const controlErrors = this.newMarkerForm.get(key)?.errors;
      if (controlErrors != null) {
        errors[key] = controlErrors;
      }
    });
    return errors;
  }
}
