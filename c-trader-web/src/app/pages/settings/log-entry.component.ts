import { Component, Input, OnInit } from '@angular/core';

import { LogEntry } from './logging.service';

@Component({
  selector: 'app-log-entry',
  template: ` <div>
    <b [ngClass]="'level-' + log?.level"
      >[{{ log?.timestamp | date: 'dd.MM.YYYY, HH:mm:ss' }} -
      {{ log?.context }}]
    </b>
    <span>{{ log?.message }}</span>
  </div>`,
  styles: [
    `
      .level-0 {
        color: yellow;
      }
      .level-1 {
        color: green;
      }
      .level-2 {
        color: orange;
      }
      .level-3 {
        color: blue;
      }
      .level-4 {
        color: red;
      }
    `,
  ],
})
export class LogEntryComponent implements OnInit {
  @Input() log?: LogEntry;
  constructor() {}
  ngOnInit(): void {}
}
