import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BalanceData, BalanceService } from '../services/balance.service';
import {
  InstrumentData,
  InstrumentService,
} from '../services/instruments.service';

@Component({
  selector: 'app-balance',
  template: `
    <table class="table">
      <thead>
        <tr>
          <th class="left">Währung</th>
          <th class="right">Wert</th>
          <th class="right">In Order</th>
          <th class="right">Verfügbar</th>
        </tr>
      </thead>
      <tbody>
        <tr
          *ngFor="let wallet of balance$ | async; trackBy: trackBy"
          [appBlinking]="wallet.balance"
          class="text-flash"
        >
          <td class="left">{{ wallet.currency }}</td>
          <td class="right">{{ wallet.balance }}</td>
          <td class="right">{{ wallet.order }}</td>
          <td class="right">{{ wallet.available }}</td>
        </tr>
      </tbody>
    </table>
  `,
  styles: [``],
})
export class BalanceComponent implements OnInit {
  balance$ = this.balanceService.stream().pipe(this.tableManipulations());
  instuments: InstrumentData[] = [];

  constructor(private balanceService: BalanceService) {}

  ngOnInit(): void {}

  tableManipulations() {
    return map<BalanceData[], BalanceData[]>((data) => {
      return data.filter((wallet) => wallet.balance != 0);
    });
  }

  trackBy(index: number, name: BalanceData) {
    return name.currency;
  }
}
