import { Component } from '@angular/core';
import { OrderService } from './services/order.service';

@Component({
  selector: 'app-root',
  template: ` <app-shell></app-shell> `,
  styles: [],
})
export class AppComponent {
  constructor(private orderService: OrderService) {
    // this.orderService.getOrders('SHIB_USDT', 20).subscribe(console.log);
  }
}
