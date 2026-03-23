import { Component, input } from '@angular/core';

@Component({
  selector: 'app-form-error-message',
  imports: [],
  templateUrl: './form-error-message.html',
})
export class FormErrorMessage {
  errorMessage = input.required<string>();
}
