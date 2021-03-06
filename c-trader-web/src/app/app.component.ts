import { Component } from '@angular/core';
import { CandlestickService } from './services/candlestick.service';
import { OrderService } from './services/order.service';

@Component({
  selector: 'app-root',
  template: ` <router-outlet></router-outlet> `,
  styles: [],
})
export class AppComponent {
  constructor(private candlestick: CandlestickService) {
    // this.candlestick.stream('1m', 'BTC_USDT').subscribe(console.log)
  }
}
