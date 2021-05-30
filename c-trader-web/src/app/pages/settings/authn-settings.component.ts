import { Component, OnInit } from '@angular/core';
import { bufferCount, filter, throttleTime } from 'rxjs/operators';
import { AuthnService } from '../shell/authn.service';
import { LoggingService } from './logging.service';

@Component({
  selector: 'app-authn-settings',
  template: `
    <div class="card">
      <div class="card-header">Authentication</div>
      <div class="card-block">
        <ng-container *ngIf="devices && devices.length; else empty">
          <div *ngFor="let device of devices">
            <b>ID: </b>{{ device.id }} - <b>Count: </b> {{ device.count }}
          </div>
        </ng-container>
      </div>
      <div class="card-footer">
        <button class="btn" (click)="registerFingerpring()">
          Register fingerprint
        </button>
        <button class="btn btn-danger" (click)="removeFingerpring()">
          Remove fingerprints
        </button>
      </div>
    </div>

    <ng-template #empty>No devices registered!</ng-template>
  `,
  styles: [``],
})
export class AuthnSettingsComponent implements OnInit {
  devices: any;
  constructor(private authnService: AuthnService) {}

  ngOnInit(): void {
    this.loadDevices();
  }

  private loadDevices() {
    this.authnService.getDevices().subscribe((devices) => {
      this.devices = devices;
    });
  }

  registerFingerpring() {
    this.authnService.register().subscribe();
  }
  removeFingerpring() {
    this.authnService.clearDevices().subscribe(() => {
      this.loadDevices();
    });
  }
}
