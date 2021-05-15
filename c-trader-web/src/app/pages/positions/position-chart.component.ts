import { Component, Input, OnInit } from '@angular/core';
import { LineStyle, PriceLineOptions } from 'lightweight-charts';
import { concat, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { CandlestickService } from 'src/app/services/candlestick.service';
import { InstrumentService } from 'src/app/services/instruments.service';
import { PositionData } from 'src/app/services/position.service';
import { TickerData, TickerService } from 'src/app/services/ticker.service';
import { CandlestickChartData, ChartData } from 'src/app/types/chart-data.type';

@Component({
  selector: 'app-position-chart',
  template: `
    <app-candlestick-chart
      [data]="ticker$"
      [decimalPlaces]="(deciamals$ | async) || 2"
      [lines]="lines"
    ></app-candlestick-chart>
    <!-- <app-value-chart
      class="chart"
      [data]="ticker$"
      [rangeInMinutes]="chartRange"
      [decimalPlaces]="(deciamals$ | async) || 2"
      [lines]="lines"
    ></app-value-chart> -->

    <div class="card-block">
      <div class="btn-group">
        <div class="radio btn btn-sm" *ngFor="let option of options">
          <input
            [checked]="currentOption === option"
            type="radio"
            name="radios"
            [id]="option"
          />
          <label [for]="option" (click)="setTimespan(option)">{{
            option
          }}</label>
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
  currentOption = '1m';
  options = ['1m', '15m', '30m', '1h', '4h', '6h', '12h', '1D', '7D'];
  ticker$?: Observable<CandlestickChartData[]>;
  deciamals$?: Observable<number> = of(2);
  lines: PriceLineOptions[] = [];
  _instrument?: string;
  chartRange: number = 60;

  @Input() set position(val: PositionData) {
    this._instrument = val.instrument;
    this.deciamals$ = this.instrumentService
      .get(val.instrument)
      .pipe(map((val) => val?.price_decimals ?? 0));

    this.lines = [
      {
        price: val.avgBuyIn,
        color: 'black',
        lineWidth: 1,
        lineStyle: LineStyle.Dotted,
        axisLabelVisible: true,
        title: 'Avarage Buy In',
      } as PriceLineOptions,
    ];
  }

  constructor(
    private candlestickService: CandlestickService,
    private instrumentService: InstrumentService
  ) {}

  ngOnInit(): void {
    if (window.innerWidth < 600) this.options = ['1m', '1h', '1D'];
    this.setTimespan('1m');
  }

  setTimespan(option: string) {
    if (!this._instrument) return;
    this.ticker$ = this.candlestickService
      .stream(option, this._instrument)
      .pipe(this.toCandlestickChartValue());
    this.currentOption = option;
  }

  private toCandlestickChartValue() {
    return (source$: Observable<any>) =>
      source$.pipe(
        map((res) =>
          res.data.map((v: any) =>
            CandlestickChartData.from(new Date(v.t), v.o, v.c, v.h, v.l)
          )
        )
      );
  }
}
