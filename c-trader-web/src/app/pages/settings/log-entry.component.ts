import { Component, Input, OnInit } from '@angular/core';

import { LogEntry } from './logging.service';

@Component({
  selector: 'app-log-entry',
  template: ` <div>
    <b>[{{ log?.context }}] </b> <span>{{ log?.message }}</span>
  </div>`,
  styles: [``],
})
export class LogEntryComponent implements OnInit {
  @Input() log?: LogEntry;
  constructor() {}
  ngOnInit(): void {}
}
