import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { finalize, share, shareReplay } from 'rxjs/operators';

export interface CandlestickData {
  result: {
    instrument_name: string; // instrument_name
    subscription: string;
    channel: string;
    interval: string;
    data: {
      i: string;
      o: number; // open
      c: number; // close
      h: number; // high
      l: number; // low
      v: number; // volume
      t: number; // start time of the stick, in epochtime
    }[];
  };
}

@Injectable({
  providedIn: 'root',
})
export class CandlestickService {
  private streamSubject: Subject<CandlestickData[]> | null = null;
  private streamObservable: Observable<CandlestickData[]> | null = null;
  private currentBalance: CandlestickData[] = [];

  constructor() {
  }

  private handleTickerData(data: CandlestickData[]) {
    if (this.streamSubject) {
      this.streamSubject.next(data);
    }
  }

  stream(interval: string, instrument: string): Observable<CandlestickData[]> {
    if (!this.streamSubject || !this.streamObservable) {
      this.streamSubject = new Subject();
      this.streamObservable = this.streamSubject.pipe(
        shareReplay(1),
        finalize(() => {
          this.streamSubject = null;
          this.streamObservable = null;
          // this.send('unsubscribe', { interval, instrument });
        }),
        share()
      );
      // this.send('subscribe', { interval, instrument });
    }
    return this.streamObservable;
  }
}
