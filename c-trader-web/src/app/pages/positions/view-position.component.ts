import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
  PositionData,
  PositionService,
} from 'src/app/services/position.service';
import { ChartData } from 'src/app/types/chart-data.type';

@Component({
  selector: 'app-view-position',
  template: `
    <ng-container *ngIf="position$ | async as position">
      <h1 class="card-header">
        <button class="btn btn-icon" [routerLink]="'..'">
          <cds-icon shape="times"></cds-icon>
        </button>
        <app-stock-ticker [instrument]="position.instrument"></app-stock-ticker>
        <span [ngClass]="position.side">{{ position.side }}</span>
        <span style="flex:1 1 auto"></span>
        <app-change-since
          [start]="position.avgBuyIn || 1"
          [instrument]="position.instrument"
          [direction]="position.side"
        ></app-change-since>
      </h1>
      <app-position-chart [position]="position"></app-position-chart>
      <div class="card">
        <div class="card-block">
          <div class="card-text">
            <app-buy-form
              *ngIf="position.side == 'BUY'"
              (order)="buyIn(position, $event)"
              [instrument]="position.instrument"
            ></app-buy-form>
            <app-sell-form
              *ngIf="position.side == 'SELL'"
              (order)="buyIn(position, $event)"
              [instrument]="position.instrument"
            ></app-sell-form>
          </div>
        </div>
        <div class="card-footer">
          <button class="btn" (click)="closePosition(position.id)">
            Position auflösen
          </button>
        </div>
      </div>
    </ng-container>
  `,
  styles: [
    `
      @media screen and (max-width: 600px) {
        h1.card-header {
          gap: 8px;
          flex-wrap: wrap;
          font-size: 10px;
          font-weight: bold;
          line-height: 14px;
        }
        app-change-since {
          margin: 0 18px;
        }
      }
      .card-header {
        margin: 0;
        font-size: 18px;
        display: flex;
        align-items: center;
        gap: 8px;
        border-bottom: none;
      }
    `,
  ],
})
export class ViewPositionComponent implements OnInit {
  position$: Observable<any>;
  constructor(
    private positionService: PositionService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.position$ = this.selectedPosition().pipe(
      map((position) =>
        position
          ? {
              ...position,
              ticker: this.positionService
                .tickerStream(position.instrument)
                .pipe(
                  map((data) => {
                    return data.map((point: any) => {
                      return ChartData.from(
                        new Date(point.data[0].t),
                        point.data[0].a
                      );
                    });
                  })
                ),
            }
          : null
      )
    );
  }

  ngOnInit(): void {}

  buyIn(position: PositionData, event: { price: number }) {
    this.positionService.buyInPosition(position.id, event.price);
  }

  closePosition(id: string) {
    this.positionService.closePosition(id);
    this.router.navigate(['..']);
  }

  private selectedPosition() {
    return combineLatest([
      this.activatedRoute.params,
      this.positionService.stream(),
    ]).pipe(
      map(([params, positions]) => {
        const id = params.id;
        return positions.find((position) => position.id == id);
      })
    );
  }
}
