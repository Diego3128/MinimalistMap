import { JsonPipe, NgClass } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { FormArray, FormBuilder, FormControlName, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormErrorMessage } from '../../../shared/components/form-error-message/form-error-message';

interface NewMarker {
  description: string;
  name: string;
  price: number;
  tags: string[];
}

@Component({
  selector: 'app-new-marker-form',
  // imports: [NgClass, ReactiveFormsModule, FormErrorMessage],
  imports: [NgClass, ReactiveFormsModule, FormErrorMessage, JsonPipe],
  templateUrl: './new-marker-form.html',
})
export class NewMarkerForm {

  private fb = inject(FormBuilder);

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

  deleteTag = (i: number) => {
    this.newMarkerTags.removeAt(i);
  }


  onSubmit = () => {
    this.newMarkerForm.markAllAsTouched();
    if (this.newMarkerForm.invalid) return;
    // show message to add marker
    // create new marker
    // todo: place somewhere so the service can grab it?
    // todo: use the service here and add the value?
    console.log(this.newMarkerForm.value);
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
