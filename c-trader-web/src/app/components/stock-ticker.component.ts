import { Component, Input, OnInit } from '@angular/core';
import { TickerDataValues, TickerService } from '../services/ticker.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-stock-ticker',
  template: `
    <div
      class="text-flash"
      [appBlinking]="data.a"
      *ngIf="data$ | async as data"
    >
      <span>{{ name }}</span>
      <span class="tooltip tooltip-sm">
        <span>{{ data.a }}</span>
        <span class="tooltip-content">Last traded price</span>
      </span>   
      <span class="tooltip tooltip-sm">
      <span>{{ data.c | percentage: data.a }}</span>
        <span class="tooltip-content">24h price change</span>
      </span>

    </div>
  `,
  styles: [
    `
      span {
        margin: 8px;
      }
    `,
  ],
})
export class StockTickerComponent implements OnInit {
  data$: Observable<TickerDataValues> | null = null;
  name: string = 'Loading ...';

  @Input() set instrument(value: string) {
    this.name = value;
    this.data$ = this.tickerService
      .stream(value)
      .pipe(map((data) => data.data[0]));
  }

  constructor(private tickerService: TickerService) {}

  ngOnInit(): void {}
}
