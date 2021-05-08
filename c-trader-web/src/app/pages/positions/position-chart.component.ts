import { Component, Input, OnInit } from '@angular/core';
import { concat, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TickerData, TickerService } from 'src/app/services/ticker.service';
import { ChartData } from 'src/app/types/chart-data.type';

@Component({
  selector: 'app-position-chart',
  template: `
    <app-value-chart
      class="chart"
      [data]="ticker$"
      [rangeInMinutes]="chartRange"
    ></app-value-chart>

    <div class="card-block">
      <div class="btn-group">
        <div class="radio btn btn-sm">
          <input type="radio" checked name="radios" id="radio-1" />
          <label for="radio-1" (click)="setTimespanMinutes()">Stunde</label>
        </div>
        <div class="radio btn btn-sm">
          <input type="radio" name="radios" id="radio-2" />
          <label for="radio-2" (click)="setTimespanHours()">Tag</label>
        </div>
        <div class="radio btn btn-sm">
          <input type="radio" name="radios" id="radio-3" />
          <label for="radio-3" (click)="setTimespanMonth()">Monat</label>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
      }
    `,
  ],
})
export class PositionChartComponent implements OnInit {
  ticker$?: Observable<ChartData[]>;
  _instrument?: string;
  chartRange: number = 60;

  @Input() set instrument(val: string) {
    this._instrument = val;
  }

  constructor(private tickerService: TickerService) {}

  ngOnInit(): void {
    this.setTimespanMinutes();
  }

  setTimespanMinutes() {
    if (!this._instrument) return;
    this.ticker$ = concat(
      this.tickerService.getHistoricalData(this._instrument, 60),
      this.tickerService.stream(this._instrument).pipe(map((d) => [d]))
    ).pipe(this.tickerService.roundTimePipe(60), this.toChartValue());
    this.chartRange = 60;
  }

  setTimespanHours() {
    if (!this._instrument) return;
    this.ticker$ = concat(
      this.tickerService.getHistoricalData(
        this._instrument,
        60 * 24, // Data of a day
        60 * 15 // 15 Minute interval
      ),
      this.tickerService.stream(this._instrument).pipe(map((d) => [d]))
    ).pipe(this.tickerService.roundTimePipe(60 * 15), this.toChartValue());
    this.chartRange = 60 * 24;
  }
  setTimespanMonth() {
    if (!this._instrument) return;
    this.ticker$ = concat(
      this.tickerService.getHistoricalData(
        this._instrument,
        60 * 24 * 30, // Data of a month
        60 * 60 * 2 // 2 Hour interval
      ),
      this.tickerService.stream(this._instrument).pipe(map((d) => [d]))
    ).pipe(this.tickerService.roundTimePipe(60 * 60 * 2), this.toChartValue());
    this.chartRange = 60 * 24 * 30;
  }

  private toChartValue() {
    return map((data: TickerData[]) => {
      return data.map((point) => {
        return ChartData.from(new Date(point.data[0].t), point.data[0].a);
      });
    });
  }
}
