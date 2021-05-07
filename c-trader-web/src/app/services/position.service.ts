import { Injectable } from '@angular/core';
import { concat, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { WsSubscription } from './base/ws-subscription.class';
import { TickerData, TickerService } from './ticker.service';

export interface PositionData {
  id: string;
  instrument: string;
  side: 'BUY' | 'SELL';
  avgBuyIn: number;
  quantity: number;
}

export interface TickerHistoryData {
  id: string;
  instrument: string;
  high: number; // Price of the 24h highest trade
  volume: number; // The total 24h traded volume
  trade: number; // The price of the latest trade, null if there weren't any trades
  last: number; // Price of the 24h lowest trade, null if there weren't any trades
  bid: number; // The current best bid price, null if there aren't any bids
  ask: number; // The current best ask price, null if there aren't any asks
  change: number; // 24-hour price change, null if there weren't any trades
  time: Date; // update time
}

@Injectable({
  providedIn: 'root',
})
export class PositionService {
  private wsSubscription = new WsSubscription<PositionData[]>('position');

  constructor(private tickerService: TickerService) {}

  stream(): Observable<PositionData[]> {
    return this.wsSubscription.data$;
  }

  tickerStream(instrument: string) {
    return concat(
      this.tickerService
        .getHistoricalData(instrument)
        .pipe(this.roundTimePipe()),
      this.tickerService.stream(instrument).pipe(
        map((d) => [d]),
        this.roundTimePipe()
      )
    );
  }

  private roundTimePipe() {
    return map((data: TickerData[]) =>
      data.map((d: TickerData) => {
        return {
          ...d,
          data: [{ ...d.data[0], t: Math.floor(d.data[0].t / 60000) * 60000 }],
        };
      })
    );
  }

  openPosition(instrument: string, side: 'BUY' | 'SELL') {
    this.wsSubscription.send('create', { instrument, side });
  }

  buyInPosition(id: string, price: number) {
    this.wsSubscription.send('buy-in', { id, price });
  }

  closePosition(id: string) {
    this.wsSubscription.send('close', { id });
  }
}
