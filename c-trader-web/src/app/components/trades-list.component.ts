import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { TradesService } from '../services/trades.service';

@Component({
  selector: 'app-trades-list',
  template: `
    <table class="table">
      <thead>
        <tr>
          <th class="left">Date</th>
          <th class="left">Pair</th>
          <th>Side</th>
          <th class="right">Price</th>
          <th class="right">Quantity</th>
          <th class="right">Change</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let wallet of trades$ | async">
          <td class="left">
            {{ wallet.create_time | date: 'dd.MMM - HH:mm:ss' }}
          </td>
          <td class="left">{{ wallet.instrument_name }}</td>
          <td>
            <span [ngClass]="wallet.side">{{ wallet.side }}</span>
          </td>
          <td class="right">{{ wallet.traded_price }}</td>
          <td class="right">{{ wallet.traded_quantity }}</td>
          <td class="right">
            <app-change-since
              #change
              [instrument]="wallet.instrument_name"
              [start]="wallet.traded_price"
              [direction]="wallet.side"
            ></app-change-since>
          </td>
          <td><button class="btn btn-outline btn-sm">Revert</button></td>
        </tr>
      </tbody>
    </table>
  `,
  styles: [],
})
export class TradesListComponent implements OnInit {
  trades$:Observable<any> = this.tradesService.stream();

  constructor(private tradesService: TradesService) {}

  ngOnInit(): void {}
}
