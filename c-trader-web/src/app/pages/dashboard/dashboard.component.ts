import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BalanceService } from 'src/app/services/balance.service';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="wallet">
      <app-wallet-indicator></app-wallet-indicator>
    </div>
    <app-investment-piechart></app-investment-piechart>
    <app-watchlist [watchlist]="watchList$ | async"></app-watchlist>
  `,
  styles: [
    `
      app-investment-piechart {
        width: 100%;
        justify-content: center;
        margin-bottom: -32px;
        margin-top: -32px;
        display: flex;
        z-index: -1;
      }
      .wallet {
        position: relative;
        padding: 0px 16px;
        background: #515151;
        color: white;
        border: solid 1px lightgray;
        border-radius: 4px;
        max-width: 300px;
        margin: auto;
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  watchList$: Observable<any>;
  constructor(private balanceService: BalanceService) {
    this.watchList$ = this.balanceService.getBalancePercentages().pipe(
      map((res) => {
        return res
          .filter((balance) => balance.percentage > 1)
          .map((balance) => balance.currency + '_USDT');
      })
    );
  }

  ngOnInit(): void {}
}
