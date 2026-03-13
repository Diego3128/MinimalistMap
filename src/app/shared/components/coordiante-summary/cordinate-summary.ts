import { Component, input, output } from "@angular/core";
import { SummaryCordInfo } from "./summary-cord-info/summary-cord-info";
import { DecimalPipe } from "@angular/common";


@Component({
  selector: 'app-coordinate-summary',
  templateUrl: './coordinate-summary.html',
  imports: [SummaryCordInfo, DecimalPipe,]
})
export class CordinateSummary {

  newZoomValue = output<number>();

  lng = input.required<number>();
  lat = input.required<number>();
  zoomValue = input.required<number>();

  loading = input(false);

  updateZoomValue = (input: HTMLInputElement) => {
    let value = parseInt(input.value);
    if (isNaN(value) || value > 22 || value < 0) value = 10;
    this.newZoomValue.emit(value);
  }
}
