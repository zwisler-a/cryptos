import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { LogEntry, LoggingService } from './logging.service';

@Component({
  selector: 'app-log',
  template: `
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
      <div class="card-block log">
        <app-log-entry *ngFor="let entry of log" [log]="entry"></app-log-entry>
      </div>
    </div>
  `,
  styles: [
    `
      .log {
        max-height: 300px;
        overflow-y: scroll;
        overflow-x: hidden;
      }
    `,
  ],
})
export class LogComponent implements OnInit, OnDestroy {
  level: number = 1;
  log: LogEntry[] = [];
  sub?: Subscription;
  constructor(private logService: LoggingService) {}

  log$ = this.logService.stream$.pipe(filter((val) => val.level >= this.level));

  ngOnInit(): void {
    this.sub = this.log$.subscribe((log) => {
      this.log.unshift(log);
    });
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
  }
}
