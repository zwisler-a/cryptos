import { ErrorHandler, Injectable, NgZone } from '@angular/core';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

export interface GlobalAlert {
  text: string;
  action: string;
  type: string;
  callback: () => void;
}

@Injectable()
export class AlertService implements ErrorHandler {
  private alters: GlobalAlert[] = [];
  private _alerts$ = new ReplaySubject<GlobalAlert[]>();
  alerts$ = this._alerts$.asObservable();

  constructor(private zone: NgZone) {}

  addAlert(
    text: string,
    action: string,
    type: string = 'warning'
  ): Observable<void> {
    return new Observable((subscriber) => {
      const alert = {
        text,
        action,
        type,
        callback: () => {
          subscriber.next();
          subscriber.complete();
          this.alters.splice(this.alters.indexOf(alert), 1);
        },
      };
      this.alters.push(alert);
      this._alerts$.next(this.alters);
    });
  }

  handleError(error: Error) {
    this.zone.run(() =>
      this.addAlert('An Error has occured: ' + error.message, 'Ok', 'danger').subscribe()
    );

    console.error('Error from global error handler', error);
  }
}
