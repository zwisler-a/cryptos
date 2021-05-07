import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-shell',
  template: `
    <header class="header header-1">
      <div class="branding">
        <a href="javascript://" class="nav-link">
          <cds-icon shape="namespace"></cds-icon>
          <span class="title">Crypt<strong>OS</strong></span>
        </a>
      </div>
      <div class="header-nav">
        <a
          routerLinkActive="active"
          [routerLink]="'/positions'"
          class="nav-link nav-text"
          >Positions</a
        >
        <a
          routerLinkActive="active"
          [routerLink]="'/wallet'"
          class="nav-link nav-text"
          >Wallet</a
        >
        <a
          routerLinkActive="active"
          [routerLink]="'/trades'"
          class="nav-link nav-text"
          >Trades</a
        >
      </div>
      <div class="header-actions">
        <app-wallet-indicator></app-wallet-indicator>
      </div>
    </header>
    <div class="content">
      <router-outlet></router-outlet>
      <div></div>
    </div>
  `,
  styles: [
    `
      .content {
        padding: 8px;
      }
    `,
  ],
})
export class ShellComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
