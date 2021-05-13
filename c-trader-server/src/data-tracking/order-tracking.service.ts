import { Injectable } from '@nestjs/common';
import { forkJoin, from, of } from 'rxjs';
import {
  buffer,
  bufferCount,
  concatAll,
  delay,
  map,
  mergeMap,
} from 'rxjs/operators';
import { CryptoService } from 'src/crypto/crypto.service';
import { PrivateGetOrderHistory } from 'src/crypto/types/requests/get-order-history.private';

@Injectable()
export class OrderTrackingService {
  constructor(private cryptoService: CryptoService) {}
  getOrdersFor(instrument: string, lastDays = 1) {
    const requests: PrivateGetOrderHistory[] = [];
    for (let i = 0; i < lastDays; i++) {
      const now = new Date().getTime() - i * 86400000;
      const past = now - 60 * 60 * 24;
      requests.push(new PrivateGetOrderHistory(instrument, past, now));
    }

    const res = from(requests).pipe(
      map((req) => of(req).pipe(delay(250))),
      concatAll(),
      mergeMap((req) => this.cryptoService.makeRequest(req)),
      bufferCount(requests.length),
    );

    return res.pipe(
      map((values) => {
        return values.reduce(
          (acc, value) => acc.concat(...value.result.order_list),
          [],
        );
      }),
    );
  }
}
