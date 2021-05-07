import { Injectable, Logger } from '@nestjs/common';
import { merge, Observable, Subject, timer } from 'rxjs';
import { concatMap, debounceTime, ignoreElements, share, startWith, tap } from 'rxjs/operators';

import { SignService } from './sign.service';
import { CryptoRequest, FilledCryptoRequest } from './types/request.interface';
import { CryptoBaseResponse } from './types/response.interface';
import { AuthCryptoWs } from './ws/auth-ws.class';
import { CryptoWs } from './ws/ws.class';

@Injectable()
export class WSService {
  private logger = new Logger(WSService.name);
  private userUrl = 'wss://stream.crypto.com/v2/user';
  private marketUrl = 'wss://stream.crypto.com/v2/market';
  private wsMarket = new CryptoWs(this.marketUrl);
  private wsUser = new AuthCryptoWs(this.userUrl, this.signService);
  message$: Observable<CryptoBaseResponse>;
  reconnect$: Observable<void>;
  private sendingQueue$ = new Subject();

  constructor(private signService: SignService) {
    this.message$ = merge(
      this.wsMarket.onMessage$.pipe(share(), this.onMessage('Market')),
      this.wsUser.onMessage$.pipe(share(), this.onMessage('User')),
    ).pipe(share());
    this.reconnect$ = merge(
      this.wsMarket.onReconnect$,
      this.wsUser.onReconnect$,
    ).pipe(debounceTime(1000));
    this.sendingQueue$
      .pipe(
        concatMap((value) =>
          timer(10).pipe(ignoreElements(), startWith(value)),
        ),
      )
      .subscribe(this.wsSend.bind(this));
  }

  send<T>(data: CryptoRequest<T>): FilledCryptoRequest<T> {
    const filledData = this.signService.fillRequest(data);
    this.sendingQueue$.next(filledData);
    return filledData;
  }

  private wsSend(request: CryptoRequest<any>, log = true) {
    if (request.marketApi) {
      delete request.marketApi;
      const dataString = JSON.stringify(request);
      if (log) this.logger.debug(`[Market] Sending: ${dataString}`);
      this.wsMarket.send(dataString);
    } else {
      const dataString = JSON.stringify(request);
      if (log) this.logger.debug(`[User] Sending: ${dataString}`);
      this.wsUser.send(dataString);
    }
  }

  onMessage(source: string) {
    return tap((data: any) => {
      if (data.id)
        this.logger.debug(
          `[${source}] Recieved: ${JSON.stringify(data).substr(0, 300)}`,
        );
    });
  }
}
