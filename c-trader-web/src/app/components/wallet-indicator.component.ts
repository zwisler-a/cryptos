import { Component, Input, OnInit } from '@angular/core';
import { concat, from, Observable } from 'rxjs';
import { bufferCount, map, mergeMap } from 'rxjs/operators';

import {
  BalanceHistroyData,
  TotalBalanceService,
} from '../services/total-balance.service';
import { ChartData } from '../types/chart-data.type';

@Component({
  selector: 'app-wallet-indicator',
  template: `
    <div class="wrapper" (click)="nextDisplay()">
      <span
        *ngIf="balance$ | async as balance"
        class="balance"
        [ngClass]="{ red: balance.changeAbs < 0 }"
      >
        <span class="indicator"
          >{{ balance.changeAbs | number: '1.0-2' }}$</span
        >
        <span class="indicator"
          >{{ balance.changePrc | number: '1.0-2' }}%</span
        >
        <span>{{ balance.current | number: '1.0-2' }}$</span>
      </span>
      <app-indicator-chart
        *ngIf="showChart && totalBalance$"
        [data]="totalBalance$"
        [rangeInMinutes]="range"
      ></app-indicator-chart>
      <span class="ts-indicator">{{ currentDisplay }}</span>
    </div>
  `,
  styles: [
    `
      .ts-indicator {
        font-size: 8px;
        margin-left: -12px;
        padding-top: 3px;
      }
      .indicator {
        color: lime;
      }
      .red .indicator {
        color: #ff5858;
      }
      .balance {
        display: flex;
        gap: 14px;
      }
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
  @Input() showChart = false;

  totalBalance$?: Observable<ChartData[]>;
  balance$?: Observable<any>;
  currentDisplay = 'h';
  range = 60;

  constructor(private totalBalanceService: TotalBalanceService) {}

  ngOnInit(): void {
    this.hourData();
  }

  nextDisplay() {
    let newVal = '';
    if (this.currentDisplay === 'm') newVal = 'h';
    if (this.currentDisplay === 'd') newVal = 'm';
    if (this.currentDisplay === 'h') newVal = 'd';
    this.currentDisplay = newVal;
    this.setDisplay();
  }

  private setDisplay() {
    if (this.currentDisplay === 'h') this.hourData();
    if (this.currentDisplay === 'd') this.dayData();
    if (this.currentDisplay === 'm') this.monthData();
  }

  private hourData() {
    this.range = 60;
    this.totalBalance$ = concat(
      this.totalBalanceService.getHistoricalData().pipe(this.fillTo(60)),
      this.totalBalanceService.stream$.pipe(map((d) => [d]))
    ).pipe(this.toChartValue());
    this.balance$ = this.totalBalance$.pipe(this.balancePipe(59));
  }

  private dayData() {
    this.range = 1440;
    this.totalBalance$ = concat(
      this.totalBalanceService
        .getHistoricalData(undefined, 1440, 24 * 60)
        .pipe(this.fillTo(60)),
      this.totalBalanceService.stream$.pipe(map((d) => [d]))
    ).pipe(this.toChartValue());
    this.balance$ = this.totalBalance$.pipe(this.balancePipe(59));
  }

  private monthData() {
    this.range = 43200;
    this.totalBalance$ = concat(
      this.totalBalanceService
        .getHistoricalData(undefined, 43200, 720 * 60)
        .pipe(this.fillTo(60)),
      this.totalBalanceService.stream$.pipe(map((d) => [d]))
    ).pipe(this.toChartValue());
    this.balance$ = this.totalBalance$.pipe(this.balancePipe(60));
  }

  private toChartValue() {
    return map((data: BalanceHistroyData[]) => {
      return data.map((point) => {
        return ChartData.from(new Date(point.timestamp), point.value);
      });
    });
  }

  fillTo(size: number) {
    return (source$: Observable<any>) =>
      source$.pipe(
        map((val) => {
          val = [].concat(val);
          if (val.length < size) {
            const missing = size - val.length;
            for (let i = 0; i < missing; i++) {
              val.unshift(val[0]);
            }
          }
          return val;
        })
      );
  }

  private balancePipe(timeFrameInMinutes = 60) {
    return (source$: Observable<any>) =>
      source$.pipe(
        mergeMap((data: any) => from(data)),
        bufferCount(timeFrameInMinutes, 1),
        map((values: any) => {
          const first = values[0];
          const last = values[values.length - 1];
          const changeAbs = last.value - first.value;
          const changePrc = (changeAbs / first.value) * 100;
          return {
            current: last.value,
            changeAbs,
            changePrc,
          };
        })
      );
  }
}
