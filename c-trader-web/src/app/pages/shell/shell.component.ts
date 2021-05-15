import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ActivationEnd, Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { concat } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AlertService } from './alert.service';

@Component({
  selector: 'app-shell',
  template: `
    <clr-main-container>
      <clr-alert
        *ngFor="let alert of alerts$ | async"
        [clrAlertAppLevel]="true"
        [clrAlertType]="alert.type"
      >
        <clr-alert-item>
          <div class="alert-text">{{ alert.text }}</div>
          <div class="alert-actions" (click)="alert.callback()">
            <button class="btn alert-action">{{ alert.action }}</button>
          </div>
        </clr-alert-item>
      </clr-alert>

      <clr-alert *ngIf="newVersionAvialable"> </clr-alert>
      <clr-header>
        <div class="branding">
          <a href="javascript://" class="nav-link">
            <img class="logo" src="/assets/logo_white_sm.png" />
          </a>
        </div>
        <div class="header-nav" [clr-nav-level]="1">
          <a routerLinkActive="active" [routerLink]="'/dash'" class="nav-link">
            <span class="nav-text">Dashboard</span>
          </a>
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
        <div class="settings" *ngIf="showIndicator">
          <app-wallet-indicator></app-wallet-indicator>
        </div>
      </clr-header>
      <div class="content-container">
        <main class="content-area">
          <router-outlet></router-outlet>
        </main>
      </div>
    </clr-main-container>
    <div class="time">{{ date | date: 'hh:mm:ss':'UTC' }}</div>
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
      .time {
        border-top-left-radius: 3px;
        font-size: 10px;
        line-height: 10px;
        color: white;
        padding: 4px 16px 4px 12px;
        position: fixed;
        bottom: 0;
        right: 0;
        background: #333;
      }
    `,
  ],
})
export class ShellComponent implements OnInit {
  date = new Date();
  newVersionAvialable = false;
  showIndicator: boolean = true;
  alerts$ = this.alert.alerts$;
  constructor(
    swUpdate: SwUpdate,
    private router: Router,
    private alert: AlertService
  ) {
    concat(
      swUpdate.available,
      this.alert.addAlert(
        'Eine neue Version ist verfügber! Willst du sie laden?',
        'Yeah, bitte!',
        'success'
      )
    ).subscribe(() => {
      window.location.reload();
    });

    this.alert.alerts$.subscribe(console.log);
    this.router.events
      .pipe(filter((r) => r instanceof ActivationEnd))
      .subscribe((ev: any) => {
        if (ev.snapshot.data['walletIndicator'] !== undefined) {
          this.showIndicator = ev.snapshot.data['walletIndicator'];
        } else {
          this.showIndicator = true;
        }
      });
  }
  ngOnInit(): void {
    setInterval(() => (this.date = new Date()), 1000);
  }
  reload() {}
}
