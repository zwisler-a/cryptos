import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { CandlestickService } from 'src/app/services/candlestick.service';
import {
  InstrumentData,
  InstrumentService,
} from 'src/app/services/instruments.service';
import {
  PositionData,
  PositionService,
} from 'src/app/services/position.service';
import { CandlestickChartData, ChartData } from 'src/app/types/chart-data.type';

@Component({
  selector: 'app-view-position',
  template: `
    <ng-container *ngIf="position$ | async as position">
      <h1 class="view-title">
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
          <div class="card-text position-info">
            <div>
              <b>Average Buy In:</b>
              {{
                position.avgBuyIn
                  | number: getNumberFormat(position.instrument_data | async)
              }}
              {{ position.instrument.split('_')[1] }}
            </div>
            <div>
              <b>Quantity:</b>
              {{
                position.quantity
                  | number
                    : getNumberFormat(position.instrument_data | async, false)
              }}

              {{ position.instrument.split('_')[0] }}
            </div>
            <div>
              <b>Change:</b>
              <app-change-since
                [start]="position.avgBuyIn || 1"
                [instrument]="position.instrument"
                [direction]="position.side"
              ></app-change-since>
            </div>
          </div>
        </div>
        <div class="card-block">
          <div class="card-text">
            <app-buy-form
              [loading]="loading"
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
        .view-title {
          gap: 8px;
          flex-wrap: wrap;
          font-size: 10px;
          line-height: 14px;
        }
      }
      .position-info b {
        min-width: 140px;
        display: inline-block;
      }
      .view-title {
        margin: 0 0 8px 0;
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
  loading = false;
  constructor(
    private instrumentService: InstrumentService,
    private positionService: PositionService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.position$ = this.selectedPosition().pipe(
      map((position) =>
        position
          ? {
              ...position,
              instrument_data: this.instrumentService.get(position.instrument),
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
    this.loading = true;
    this.positionService
      .buyInPosition(position.id, event.price)
      .subscribe(() => {
        this.loading = false;
      });
  }

  getNumberFormat(instrument?: InstrumentData | null, price = true): string {
    if (!instrument) return '1.10-10';
    const dec = price
      ? instrument.price_decimals
      : instrument.quantity_decimals;
    return '1.' + dec + '-' + dec;
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
