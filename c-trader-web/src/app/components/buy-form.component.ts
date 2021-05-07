import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';

import { BalanceService } from '../services/balance.service';
import {
  InstrumentData,
  InstrumentService,
} from '../services/instruments.service';
import { TickerDataValues, TickerService } from '../services/ticker.service';

@Component({
  selector: 'app-buy-form',
  template: `
    <form clrForm *ngIf="tickerData">
      <p *ngIf="balance$ | async as balance" class="balance">
        <span class="base">{{ balance.base }} {{ base_currenty }}</span>
        <span class="quote">{{ balance.quote }} {{ quote_currenty }}</span>
      </p>
      <clr-input-container>
        <label>Preis ({{ base_currenty }})</label>
        <input
          [(ngModel)]="tickerData.a"
          disabled
          name="price"
          clrInput
          [placeholder]="base_currenty"
          type="number"
        />
      </clr-input-container>

      <clr-input-container>
        <label>Bid ({{ quote_currenty }})</label>
        <input
          [(ngModel)]="bid"
          name="bid"
          clrInput
          [placeholder]="quote_currenty"
          type="number"
        />
      </clr-input-container>

      <clr-input-container>
        <label>Volume ({{ base_currenty }})</label>
        <input
          [(ngModel)]="volume"
          name="volume"
          clrInput
          placeholder="Volume"
          type="number"
        />
      </clr-input-container>
      <div class="actions">
        <button class="btn btn-success" type="submit" (click)="submit()">
          Order ausführen
        </button>
      </div>
    </form>
  `,
  styles: [
    `
      .balance .base {
        display: inline-block;
        width: 180px;
      }
      .actions {
        margin-top: 24px;
      }
    `,
  ],
})
export class BuyFormComponent implements OnInit {
  @Input() set instrument(val: string) {
    this._instrument = val;
    this.base_currenty = val.split('_')[0];
    this.quote_currenty = val.split('_')[1];
    this.subscriptions();
  }
  @Output() order = new EventEmitter<{ price: number }>();

  private _instrument: string = '';
  instrumentData: InstrumentData | undefined;
  base_currenty = 'CRO';
  quote_currenty = 'ETH';
  tickerData: TickerDataValues | null = null;
  balance$: Observable<{
    base: number | undefined;
    quote: number | undefined;
  }> | null = null;

  private _bid = 0;
  set bid(val: number) {
    if (this.tickerData)
      this._volume = this.toFixed(val / this.tickerData.a, 'quantity');
    this._bid = val;
  }
  get bid() {
    return this._bid;
  }

  private _volume = 0;
  set volume(val: number) {
    if (this.tickerData)
      this._bid = this.toFixed(val * this.tickerData.a, 'price');
    this._volume = val;
  }
  get volume() {
    return this._volume;
  }

  constructor(
    private tickerService: TickerService,
    private balanceService: BalanceService,
    private instrumentService: InstrumentService
  ) {}

  submit() {
    if (!this.instrumentData)
      return console.error('unknown instrument on', this._instrument);
    this.order.emit({
      price: Number.parseFloat(
        this.bid.toFixed(this.instrumentData.price_decimals)
      ),
    });
  }

  ngOnInit(): void {}

  private subscriptions() {
    this.tickerService
      .stream(this._instrument)
      .pipe(map((val) => val.data[0]))
      .subscribe((data) => (this.tickerData = data));
    this.balance$ = this.balanceService.stream().pipe(
      map((wallets) => ({
        base: wallets.find((wallet) => wallet.currency === this.base_currenty),
        quote: wallets.find(
          (wallet) => wallet.currency === this.quote_currenty
        ),
      })),
      map((walltes) => ({
        base: walltes.base?.available,
        quote: walltes.quote?.available,
      }))
    );
    this.instrumentService
      .stream()
      .pipe(
        first(),
        map((instruments) =>
          instruments.find((inst) => inst.instrument_name === this._instrument)
        )
      )
      .subscribe((instrument) => (this.instrumentData = instrument));
  }

  private toFixed(val: number, what: 'quantity' | 'price') {
    const decimals = this.instrumentData
      ? (this.instrumentData as any)[what + '_decimals'] || 20
      : 20;
    return Number.parseFloat(val.toFixed(decimals));
  }
}
