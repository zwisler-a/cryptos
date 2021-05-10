import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-positions',
  template: `
    <!-- <h1>Positions</h1> -->

    <app-create-position></app-create-position>

    <app-position-list (position)="viewPosition($event)"></app-position-list>
  `,
  styles: [
    `
      .card-header {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
      }
    `,
  ],
})
export class PositionsComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {}

  viewPosition(id: string) {
    this.router.navigate(['/positions', id]);
  }
}
