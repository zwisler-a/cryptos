import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-shell',
  template: `
    <clr-main-container>
      <clr-alert
        *ngIf="newVersionAvialable"
        clrAlertType="success"
        [clrAlertAppLevel]="true"
      >
        <clr-alert-item>
          <div class="alert-text">
            A new version is available. Would you like to reload?
          </div>
          <div class="alert-actions" (click)="reload()">
            <button class="btn alert-action">Yes, please!</button>
          </div>
        </clr-alert-item>
      </clr-alert>
      <clr-header>
        <div class="branding">
          <a href="javascript://" class="nav-link">
            <img class="logo" src="/assets/logo_white_sm.png" />
          </a>
        </div>
        <div class="header-nav" [clr-nav-level]="1">
          <a
            routerLinkActive="active"
            [routerLink]="'/positions'"
            class="nav-link"
            ><span class="nav-text">Positions</span></a
          >
          <a routerLinkActive="active" [routerLink]="'/wallet'" class="nav-link"
            ><span class="nav-text">Wallet</span></a
          >
          <a routerLinkActive="active" [routerLink]="'/trades'" class="nav-link"
            ><span class="nav-text">Trades</span></a
          >
        </div>
        <div class="settings">
          <app-wallet-indicator></app-wallet-indicator>
        </div>
      </clr-header>
      <div class="content-container">
        <main class="content-area">
          <router-outlet></router-outlet>
        </main>
      </div>
    </clr-main-container>
  `,
  styles: [
    `
      .logo {
        height: 100%;
        padding: 15px;
      }
      .branding {
        background: #333;
      }
      a.nav-link {
        text-align: start !important;
      }
    `,
  ],
})
export class ShellComponent implements OnInit {
  newVersionAvialable = false;
  constructor(swUpdate: SwUpdate) {
    swUpdate.available.subscribe((event) => {
      this.newVersionAvialable = true;
    });
  }
  ngOnInit(): void {}
  reload() {
    window.location.reload();
  }
}
