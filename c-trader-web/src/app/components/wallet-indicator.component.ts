import { Component, OnInit } from '@angular/core';
import { concat } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  BalanceHistroyData,
  TotalBalanceService,
} from '../services/total-balance.service';
import { ChartData } from '../types/chart-data.type';

@Component({
  selector: 'app-wallet-indicator',
  template: `
    <div class="wrapper">
      <span>{{ balance$ | async }}</span>
      <app-indicator-chart [data]="totalBalance$"></app-indicator-chart>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .wrapper {
        padding: 8px 16px;
        display: flex;
        gap: 16px;
      }
      @media screen and (max-width: 600px) {
        app-indicator-chart {
          display: none;
        }
      }
    `,
  ],
})
export class WalletIndicatorComponent implements OnInit {
  totalBalance$ = concat(
    this.totalBalanceService.getHistoricalData(),
    this.totalBalanceService.stream$.pipe(map((d) => [d]))
  ).pipe(this.toChartValue());
  balance$ = this.totalBalance$.pipe(
    map((res) => {
      return res.length ? res[res.length - 1].value.toFixed(2) + '$' : '';
    })
  );

  constructor(private totalBalanceService: TotalBalanceService) {}

  ngOnInit(): void {}

  private toChartValue() {
    return map((data: BalanceHistroyData[]) => {
      return data.map((point) => {
        return ChartData.from(new Date(point.timestamp), point.value);
      });
    });
  }
}
