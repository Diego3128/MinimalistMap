import { Component, input } from '@angular/core';

@Component({
  selector: 'app-summary-cord-info',
  imports: [],
  templateUrl: './summary-cord-info.html',
})
export class SummaryCordInfo {
  info = input.required<{ label: string; value: any }>()
}
