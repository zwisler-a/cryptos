import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-shell',
  template: `
    <clr-main-container>
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
  constructor() {}

  ngOnInit(): void {}
}
