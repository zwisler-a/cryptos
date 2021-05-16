import { ErrorHandler, Injectable, NgZone } from '@angular/core';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

export interface GlobalAlert {
  text: string;
  action?: string;
  type: string;
  closable: boolean;
  callback: (val?: any) => void;
}

@Injectable()
export class AlertService implements ErrorHandler {
  private alters: GlobalAlert[] = [];
  private _alerts$ = new ReplaySubject<GlobalAlert[]>();
  alerts$ = this._alerts$.asObservable();

  constructor(private zone: NgZone) {}

  addAlert(
    text: string,
    action?: string,
    type: string = 'warning',
    closable = true
  ): Observable<void> {
    return new Observable((subscriber) => {
      const alert = {
        text,
        action,
        type,
        closable,
        callback: (val?: any) => {
          subscriber.next(val);
          subscriber.complete();
          this.alters.splice(this.alters.indexOf(alert), 1);
        },
      };
      this.alters.push(alert);
      this._alerts$.next(this.alters);
      return () => {
        this.alters.splice(this.alters.indexOf(alert), 1);
      };
    });
  }

  handleError(error: Error) {
    this.zone.run(() =>
      this.addAlert(
        'An Error has occured: ' + error.message,
        'Ok',
        'danger'
      ).subscribe()
    );

    console.error('Error from global error handler', error);
  }
}
