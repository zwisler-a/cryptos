import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BalanceService } from '../services/balance.service';
import { PieChartData } from '../types/chart-data.type';

@Component({
  selector: 'app-investment-piechart',
  template: `
    <app-pie-chart
      *ngIf="balanceInPercent$ | async as perc"
      [data]="perc"
    ></app-pie-chart>
  `,
  styles: [],
})
export class InvestmentPiechartComponent implements OnInit {
  balanceInPercent$?: Observable<PieChartData[]>;
  constructor(private balanceService: BalanceService) {
    this.balanceInPercent$ = balanceService.getBalancePercentages().pipe(
      map((data) => {
        return data
          .filter((d) => d.percentage > 1)
          .map(
            (d, i) =>
              new PieChartData(
                d.percentage,
                d.currency + ` - ${d.percentage.toFixed(2)}%`,
                i
              )
          );
      })
    );
  }
  ngOnInit(): void {}
}
