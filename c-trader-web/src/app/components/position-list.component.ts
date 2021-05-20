import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { map } from 'rxjs/operators';

import { InstrumentService } from '../services/instruments.service';
import { PositionData, PositionService } from '../services/position.service';
import { ChartData } from '../types/chart-data.type';

@Component({
  selector: 'app-position-list',
  template: `
    <clr-datagrid>
      <clr-dg-column>Instrument</clr-dg-column>
      <ng-container *ngIf="small">
        <clr-dg-column class="right">Quantity</clr-dg-column>
        <clr-dg-column class="right">Avg. Buy In</clr-dg-column>
      </ng-container>
      <clr-dg-column class="right">Change</clr-dg-column>
      <ng-container *ngIf="small">
        <clr-dg-column></clr-dg-column>
        <clr-dg-column>Side</clr-dg-column>
      </ng-container>
      <clr-dg-column></clr-dg-column>

      <clr-dg-row *ngFor="let position of positions$ | async; trackBy: trackBy">
        <clr-dg-cell>{{ position.instrument }}</clr-dg-cell>
        <ng-container *ngIf="small">
          <clr-dg-cell class="right">{{
            position.quantity | number: (position.decimals | async)?.quantity
          }}</clr-dg-cell>
          <clr-dg-cell class="right">{{
            position.avgBuyIn | number: (position.decimals | async)?.price
          }}</clr-dg-cell>
        </ng-container>
        <clr-dg-cell class="right">
          <app-change-since
            [instrument]="position.instrument"
            [start]="position.avgBuyIn"
            [direction]="position.side"
          ></app-change-since>
        </clr-dg-cell>

        <ng-container *ngIf="small">
          <clr-dg-cell class="centered">
            <app-indicator-chart
              [width]="250"
              [data]="position.tickerData"
            ></app-indicator-chart>
          </clr-dg-cell>
          <clr-dg-cell>
            <span [ngClass]="position.side">{{ position.side }}</span>
          </clr-dg-cell>
        </ng-container>
        <clr-dg-cell class="centered">
          <button (click)="positionSelected(position.id)" class="btn btn-sm">
            View
          </button>
        </clr-dg-cell>
      </clr-dg-row>
    </clr-datagrid>
  `,
  styles: [
    `
      .indicator-chart {
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .datagrid-cell {
        display: flex;
        flex-direction: row;
        align-items: center;
      }
      .centered {
        justify-content: center;
      }
      .right {
        justify-content: flex-end;
      }
    `,
  ],
})
export class PositionListComponent implements OnInit {
  small = true;

  @Output() position = new EventEmitter<string>();

  positions$ = this.positionService.stream().pipe(
    map((positions) =>
      positions.map((position) => ({
        ...position,
        tickerData: this.getTickerData(position.instrument),
        decimals: this.getDecimals(position.instrument),
      }))
    )
  );
  instruments$ = this.instrumentService.stream();

  newPostionInstrument = '';

  constructor(
    private positionService: PositionService,
    private instrumentService: InstrumentService
  ) {
    this.small = window.innerWidth > 600;
  }

  getTickerData(instrument: string) {
    return this.positionService.tickerStream(instrument).pipe(
      map((data) => {
        return data.map((point: any) => {
          return ChartData.from(new Date(point.data[0].t), point.data[0].a);
        });
      })
    );
  }

  ngOnInit(): void {}

  positionSelected(id: string) {
    this.position.emit(id);
  }

  getDecimals(instrument: string) {
    return this.instrumentService.get(instrument).pipe(
      map((instrument) => {
        if (!instrument) throw Error('Cant find instrument ' + instrument);
        return {
          price: `1.${instrument.price_decimals}-${instrument.price_decimals}`,
          quantity: `1.${instrument.quantity_decimals}-${instrument.quantity_decimals}`,
        };
      })
    );
  }

  trackBy(index: number, position: PositionData): number {
    return index;
  }
}
