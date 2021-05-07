import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-positions',
  template: `
    <div class="card">
      <div class="card-header">
        Positions

        <app-create-position></app-create-position>
      </div>

      <app-position-list (position)="viewPosition($event)"></app-position-list>
    </div>
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
