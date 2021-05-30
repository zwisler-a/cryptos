import { Component, OnInit } from '@angular/core';
import { bufferCount, filter, throttleTime } from 'rxjs/operators';
import { AuthnService } from '../shell/authn.service';
import { LoggingService } from './logging.service';

@Component({
  selector: 'app-settings',
  template: `
    <app-authn-settings></app-authn-settings>

    <app-log></app-log>
  `,
  styles: [``],
})
export class SettingsComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
