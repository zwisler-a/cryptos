import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ActivationEnd, Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { BehaviorSubject, concat, Subscription } from 'rxjs';
import { filter, mergeMap } from 'rxjs/operators';
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
          <a
            *ngFor="let route of routes"
            routerLinkActive="active"
            [routerLink]="route.path"
            class="nav-link"
          >
            <span class="nav-text">{{ route.name }}</span>
          </a>
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
  routes = [
    { path: '/dash', name: 'Dashboard' },
    { path: '/positions', name: 'Positions' },
    { path: '/wallet', name: 'Wallet' },
    { path: '/trades', name: 'Trades' },
    { path: '/settings', name: 'Settings' },
  ];

  date = new Date();
  showIndicator: boolean = true;
  alerts$ = this.alert.alerts$;
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
    });
    socket.on('connect', () => {
      if (sub) sub.unsubscribe();
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
    this.swUpdate.available
      .pipe(
        mergeMap(() =>
          this.alert.addAlert(
            'Eine neue Version ist verfügber! Willst du sie laden?',
            'Yeah, bitte!',
            'success'
          )
        )
      )
      .subscribe(() => {
        window.location.reload();
      });
  }
}
