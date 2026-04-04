import { Component, inject, input, OnInit, output } from '@angular/core';
import { FormArray, FormBuilder, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormErrorMessage } from "../../../form-error-message/form-error-message";
import { Marker } from '../marker-item';

@Component({
  selector: 'app-edit-marker-form',
  imports: [FormsModule, ReactiveFormsModule, FormErrorMessage],
  templateUrl: './edit-marker-form.html',
})
export class EditMarkerForm implements OnInit {
  ngOnInit(): void {
    // Set initial form values from the marker input
    this.markerForm.patchValue({
      name: this.marker().name,
      description: this.marker().description,
      price: this.marker().price,
      tags: this.marker().tags
    });

    // Clear existing tags and add the marker's tags
    this.newMarkerTags.clear();
    this.marker().tags.forEach(tag => {
      this.addNewTag(tag);
    });
  }

  marker = input.required<Marker>();

  private fb = inject(FormBuilder);

  updateMarker = output<Marker>();


  // todo set initial value
  markerForm = this.fb.group({
    name: ["", [Validators.required]],
    description: ["", [Validators.required]],
    price: [0, [Validators.min(0)]],
    tags: this.fb.array([], [Validators.required, Validators.minLength(2)])
  })

  get newMarkerTags() {
    return this.markerForm.get("tags") as FormArray;
  }

  addNewTag = (tag: string) => {
    if (!tag || tag.length > 10) return; // Prevent adding if it violates rules immediately
    // adds a form group to the array
    this.newMarkerTags.push(this.fb.control(tag, [Validators.required, Validators.maxLength(10)]))
  }

  deleteTag = (i: number) => this.newMarkerTags.removeAt(i);


  onSubmit = () => {
    this.markerForm.markAllAsTouched();
    if (this.markerForm.invalid) return;
    const newMarker = {
      name: this.markerForm.controls.name.value as string,
      description: this.markerForm.controls.description.value as string,
      price: this.markerForm.controls.price.value as number,
      tags: this.markerForm.controls.tags.value as string[],
    }
    this.updateMarker.emit(newMarker);
  }

  getFormValidationErrors() {
    const errors: any = {};
    Object.keys(this.markerForm.controls).forEach(key => {
      const controlErrors = this.markerForm.get(key)?.errors;
      if (controlErrors != null) {
        errors[key] = controlErrors;
      }
    });
    return errors;
  }

}
