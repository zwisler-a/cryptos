import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { map, tap } from 'rxjs/operators';

import { InstrumentService } from '../services/instruments.service';
import { PositionService } from '../services/position.service';
import { ChartData } from '../types/chart-data.type';

@Component({
  selector: 'app-position-list',
  template: `
    <table class="table">
      <thead>
        <tr>
          <th class="left">Instrument</th>
          <th class="right">Quantity [Base]</th>
          <th class="right">Quantity [Quote]</th>
          <th class="right">Avg. Buy In</th>
          <th class="right">Change</th>
          <th class="right"></th>
          <th>Side</th>
          <th class="right"></th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let position of positions$ | async">
          <td class="left">{{ position.instrument }}</td>
          <td class="right">{{ position.quantity }}</td>
          <td class="right">
            {{ position.quantity * position.avgBuyIn | number: '1.0-10' }}
          </td>
          <td class="right">{{ position.avgBuyIn | number: '1.0-10' }}</td>
          <td class="right">
            <app-change-since
              [instrument]="position.instrument"
              [start]="position.avgBuyIn"
              [direction]="position.side"
            ></app-change-since>
          </td>
          <td class="indicator-chart">
            <app-indicator-chart
              [data]="position.tickerData"
            ></app-indicator-chart>
          </td>
          <td>
            <span [ngClass]="position.side">{{ position.side }}</span>
          </td>
          <td>
            <span>
              <button
                (click)="positionSelected(position.id)"
                class="btn btn-sm"
              >View</button>
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  `,
  styles: [
    `
      .indicator-chart {
        display: flex;
        justify-content: center;
        align-items: center;
      }
    `,
  ],
})
export class PositionListComponent implements OnInit {
  @Output() position = new EventEmitter<string>();

  positions$ = this.positionService.stream().pipe(
    map((positions) =>
      positions.map((position) => ({
        ...position,
        tickerData: this.getTickerData(position.instrument),
      }))
    )
  );
  instruments$ = this.instrumentService.stream();

  newPostionInstrument = '';

  constructor(
    private positionService: PositionService,
    private instrumentService: InstrumentService
  ) {}

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
}
