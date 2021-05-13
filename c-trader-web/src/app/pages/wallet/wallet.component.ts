import { Component, OnInit } from '@angular/core';
import { concat, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  BalanceHistroyData,
  TotalBalanceService,
} from 'src/app/services/total-balance.service';
import { ChartData } from 'src/app/types/chart-data.type';

@Component({
  selector: 'app-wallet',
  template: ` <app-value-chart
      class="chart"
      [rangeInMinutes]="chartRange"
      [data]="totalBalance$"
    ></app-value-chart>
    <div>
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
    <app-balance></app-balance>`,
  styles: [
    `
      .chart {
        display: flex;
        justify-content: center;
        margin-bottom: 16px;
      }
    `,
  ],
})
export class WalletComponent implements OnInit {
  totalBalance$?: Observable<ChartData[]>;
  chartRange = 60;
  constructor(private totalBalanceService: TotalBalanceService) {}

  ngOnInit(): void {
    this.setTimespanMinutes();
  }

  setTimespanMinutes() {
    this.totalBalance$ = concat(
      this.totalBalanceService.getHistoricalData(),
      this.totalBalanceService.stream$.pipe(map((d) => [d]))
    ).pipe(this.toChartValue());
    this.chartRange = 60;
  }

  setTimespanHours() {
    this.totalBalance$ = concat(
      this.totalBalanceService.getHistoricalData(
        undefined,
        60 * 24, // Data of a day
        60 * 15 // 15 Minute interval
      ),
      this.totalBalanceService.stream$.pipe(map((d) => [d]))
    ).pipe(this.toChartValue());
    this.chartRange = 60 * 24;
  }
  setTimespanMonth() {
    this.totalBalance$ = concat(
      this.totalBalanceService.getHistoricalData(
        undefined,
        60 * 24 * 30, // Data of a month
        60 * 60 * 2 // 4 Hour interval
      ),
      this.totalBalanceService.stream$.pipe(map((d) => [d]))
    ).pipe(this.toChartValue());
    this.chartRange = 60 * 24 * 30;
  }

  private toChartValue() {
    return map((data: BalanceHistroyData[]) => {
      return data.map((point) => {
        return ChartData.from(new Date(point.timestamp), point.value);
      });
    });
  }
}
