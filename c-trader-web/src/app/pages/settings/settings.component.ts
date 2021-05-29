import { Component, OnInit } from '@angular/core';
import { bufferCount, filter, throttleTime } from 'rxjs/operators';
import { AuthnService } from '../shell/authn.service';
import { LoggingService } from './logging.service';

@Component({
  selector: 'app-settings',
  template: `
    <div class="card">
      <div class="card-header">Authentication</div>
      <div class="card-block">
        Hier wird der aktuelle Status irgendwann angezeiht.
      </div>
      <div class="card-footer">
        <button class="btn" (click)="registerFingerpring()">
          Register fingerprint
        </button>
        <button class="btn btn-danger" (click)="removeFingerpring()">
          Register fingerprint
        </button>
      </div>
    </div>

    <div class="card">
      <div class="card-header">Logs</div>
      <div class="card-block">
        <form clrForm>
          <clr-select-container>
            <label>Select Level</label>
            <select clrSelect name="level" [(ngModel)]="level">
              <option value="0">Verbose</option>
              <option value="1">Debug</option>
              <option value="2">Warn</option>
              <option value="3">Info</option>
              <option value="4">Error</option>
            </select>
          </clr-select-container>
        </form>
      </div>
      <div class="card-block">
        <app-log-entry
          *ngFor="let log of log$ | async"
          [log]="log"
        ></app-log-entry>
      </div>
    </div>
  `,
  styles: [``],
})
export class SettingsComponent implements OnInit {
  level: number = 1;
  constructor(
    private authnService: AuthnService,
    private logService: LoggingService
  ) {}

  log$ = this.logService.stream$.pipe(
    filter((val) => val.level >= this.level),
    throttleTime(5),
    bufferCount(30, 1)
  );

  ngOnInit(): void {}

  registerFingerpring() {
    this.authnService.register().subscribe();
  }
  removeFingerpring() {
    throw new Error('Not yet implemented!');
  }
}
