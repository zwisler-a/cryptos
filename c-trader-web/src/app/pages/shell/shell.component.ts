import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ActivationEnd, Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { BehaviorSubject, concat, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { io, Socket } from 'socket.io-client';
import { WsSubscription } from 'src/app/services/base/ws-subscription.class';
import { AlertService } from './alert.service';

@Component({
  selector: 'app-shell',
  template: `
    <clr-main-container>
      <clr-alert
        *ngFor="let alert of alerts$ | async"
        [clrAlertAppLevel]="true"
        [clrAlertType]="alert.type"
        (clrAlertClosed)="alert.callback(false)"
      >
        <clr-alert-item>
          <div class="alert-text">{{ alert.text }}</div>
          <div
            class="alert-actions"
            *ngIf="alert.action"
            (click)="alert.callback(true)"
          >
            <button class="btn alert-action">{{ alert.action }}</button>
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
    <div class="time">
      <span
        >Status:
        {{ (socketConnected$ | async) ? 'Connected' : 'Disconnected' }}</span
      >|
      <span>{{ date | date: 'hh:mm:ss':'UTC' }}</span>
    </div>
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
        display: flex;
        gap: 8px;
      }
    `,
  ],
})
export class ShellComponent implements OnInit {
  date = new Date();
  showIndicator: boolean = true;
  alerts$ = this.alert.alerts$;
  socketConnected$ = new BehaviorSubject(false);
  constructor(
    private swUpdate: SwUpdate,
    private router: Router,
    private alert: AlertService
  ) {}
  ngOnInit(): void {
    this.handleReconnect();
    this.handleWalletIndicator();
    this.handleUpdate();
    setInterval(() => (this.date = new Date()), 1000);
  }

  private handleReconnect() {
    const socket = io();
    let sub: Subscription | undefined = undefined;
    socket.on('disconnect', () => {
      sub = this.alert
        .addAlert(
          'Socket disconnected! Attempting reconnect ...',
          undefined,
          'warn'
        )
        .subscribe();
      this.socketConnected$.next(false);
    });
    socket.on('connect', () => {
      if (sub) sub.unsubscribe();
      this.socketConnected$.next(true);
    });
  }

  private handleWalletIndicator() {
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

  private handleUpdate() {
    concat(
      this.swUpdate.available,
      this.alert.addAlert(
        'Eine neue Version ist verfügber! Willst du sie laden?',
        'Yeah, bitte!',
        'success'
      )
    ).subscribe(() => {
      window.location.reload();
    });
  }
}
