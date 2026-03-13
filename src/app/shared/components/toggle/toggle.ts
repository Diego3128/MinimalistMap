import { NgClass } from '@angular/common';
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-toggle',
  imports: [NgClass],
  templateUrl: './toggle.html',
})
export class Toggle {

  isOn = input<boolean>(false);
  textOn = input<string>("ON");
  textOff = input<string>("OFF");
  label = input<string | null>(null);

  toggle = output<void>();

  onClick = () => {
    this.toggle.emit();
  }

}
