import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { filter, first, map, mergeMap } from 'rxjs/operators';

import { BalanceData, BalanceService } from '../services/balance.service';
import {
  InstrumentData,
  InstrumentService,
} from '../services/instruments.service';
import { TickerDataValues, TickerService } from '../services/ticker.service';

type FormData = [
  TickerDataValues,
  {
    base: {
      value: number | undefined;
      currency: string | undefined;
      decimals: number;
      decimal_str: string;
    };
    quote: {
      value: number | undefined;
      currency: string | undefined;
      decimals: number;
      decimal_str: string;
    };
  }
];
@Component({
  selector: 'app-buy-form',
  template: `
    <form clrForm *ngIf="data$ | async as data">
      <clr-input-container>
        <label>Preis ({{ data[1].quote.currency }})</label>
        <input
          [(ngModel)]="data[0].a"
          disabled
          name="price"
          clrInput
          [placeholder]="data[1].base.currency"
          type="number"
        />
      </clr-input-container>

      <clr-input-container>
        <label>Bid ({{ data[1].quote.currency }})</label>
        <input
          [(ngModel)]="bid"
          (input)="updateBid()"
          name="bid"
          clrInput
          [placeholder]="data[1].quote.currency"
          type="number"
        />
        <clr-control-helper
          >{{ data[1].quote.value | number: data[1].quote.decimal_str }}
          {{ data[1].quote.currency }}</clr-control-helper
        >
      </clr-input-container>
      <clr-button-group class="preselect">
        <clr-button
          class="btn-sm"
          (click)="selectPercent(data[1].quote.value, 25)"
          >25%</clr-button
        >
        <clr-button
          class="btn-sm"
          (click)="selectPercent(data[1].quote.value, 50)"
          >50%</clr-button
        >
        <clr-button
          class="btn-sm"
          (click)="selectPercent(data[1].quote.value, 75)"
          >75%</clr-button
        >
      </clr-button-group>
      <clr-input-container>
        <label class="result">= ({{ data[1].base.currency }})</label>
        <input
          [(ngModel)]="volume"
          name="volume"
          clrInput
          placeholder="Volume"
          type="number"
        />
        <clr-control-helper
          >{{ data[1].base.value | number: data[1].base.decimal_str }}
          {{ data[1].base.currency }}</clr-control-helper
        >
      </clr-input-container>
      <div class="actions">
        <button
          [clrLoading]="loading"
          class="btn btn-success"
          type="submit"
          (click)="submit()"
        >
          Order ausführen
        </button>
      </div>
    </form>
  `,
  styles: [
    `
      .preselect {
        margin: 16px auto 0 0;
      }
      .balance .base {
        display: inline-block;
        width: 180px;
      }
      .actions {
        margin-top: 24px;
      }
      .result {
        text-align: right;
      }
    `,
  ],
})
export class BuyFormComponent implements OnInit {
  @Input() loading = false;
  data$?: Observable<FormData>;

  @Input() set instrument(val: string) {
    console.log(val);
    this.subscribeToDataFor(val);
  }
  @Output() order = new EventEmitter<{ price: number }>();

  bid: number = 0;
  volume: number = 0;

  // private _bid = 0;
  // set bid(val: number) {
  //   if (this.tickerData)
  //     this._volume = this.toFixed(val / this.tickerData.a, 'quantity');
  //   this._bid = val;
  // }
  // get bid() {
  //   return this._bid;
  // }

  // private _volume = 0;
  // set volume(val: number) {
  //   if (this.tickerData)
  //     this._bid = this.toFixed(val * this.tickerData.a, 'price');
  //   this._volume = val;
  // }
  // get volume() {
  //   return this._volume;
  // }

  constructor(
    private tickerService: TickerService,
    private balanceService: BalanceService,
    private instrumentService: InstrumentService
  ) {}

  submit() {
    this.data$?.pipe(first()).subscribe((data) => {
      this.order.emit({
        price: Number.parseFloat(this.bid.toFixed(data[1].quote.decimals)),
      });
    });
  }

  ngOnInit(): void {}

  updateBid() {
    this.data$?.pipe(first()).subscribe((data) => {
      this.volume = this.bid / data[0].a;
    });
  }

  selectPercent(balance: number = 0, percent: number) {
    this.bid = (balance / 100) * percent;
    this.updateBid();
  }

  private subscribeToDataFor(instument: string) {
    const base_currenty = instument.split('_')[0];
    const quote_currenty = instument.split('_')[1];
    this.data$ = combineLatest([
      this.tickerService.stream(instument).pipe(map((val) => val.data[0])),
      this.balanceService
        .stream()
        .pipe(this.selectBalances(quote_currenty, base_currenty)),
    ]);
  }

  private toFixed(val: number, what: 'quantity' | 'price') {
    // const decimals = this.instrumentData
    //   ? (this.instrumentData as any)[what + '_decimals'] || 20
    //   : 20;
    // return Number.parseFloat(val.toFixed(decimals));
  }

  private selectInstrument(instrument: string) {
    return (source$: Observable<InstrumentData[]>) =>
      source$.pipe(
        first(),
        map((instruments) =>
          instruments.find((inst) => inst.instrument_name === instrument)
        )
      );
  }

  private selectBalances(quote: string, base: string) {
    return (source$: Observable<BalanceData[]>) =>
      source$.pipe(
        map((wallets) => ({
          base: wallets.find((wallet) => wallet.currency === base),
          quote: wallets.find((wallet) => wallet.currency === quote),
        })),
        map((walltes) => ({
          base: {
            value: walltes.base?.available,
            currency: walltes.base?.currency,
          },
          quote: {
            value: walltes.quote?.available,
            currency: walltes.quote?.currency,
          },
        })),
        mergeMap((data) =>
          this.instrumentService.get(`${base}_${quote}`).pipe(
            map((inst) => {
              return {
                base: {
                  ...data.base,
                  decimals: inst?.quantity_decimals,
                  decimal_str: `1.${inst?.quantity_decimals}-${inst?.quantity_decimals}`,
                },
                quote: {
                  ...data.quote,
                  decimals: inst?.price_decimals,
                  decimal_str: `1.${inst?.price_decimals}-${inst?.price_decimals}`,
                },
              };
            }),
            // map(res => ({base: res.quote, quote: res.base})),
            filter<any>((a) => a != undefined)
          )
        )
      );
  }
}
