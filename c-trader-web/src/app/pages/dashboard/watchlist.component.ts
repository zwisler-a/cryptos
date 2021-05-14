import { Component, Input, OnInit } from '@angular/core';
import { concat, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TickerService } from 'src/app/services/ticker.service';
import { ChartData } from 'src/app/types/chart-data.type';

@Component({
  selector: 'app-watchlist',
  template: `
    <clr-datagrid>
      <clr-dg-row *ngFor="let instrument of processedWatchList">
        <clr-dg-cell>{{ instrument.instrument_name }}</clr-dg-cell>
        <ng-container *ngIf="instrument.tickerStream | async as stream">
          <clr-dg-cell>
            <span class="positive" [ngClass]="{ negative: stream.c < 0 }">
              {{ stream.c | percentage: stream.a }}
            </span>
          </clr-dg-cell>
        </ng-container>
        <clr-dg-row-detail *clrIfExpanded>
          <div class="chart">
            <app-indicator-chart
              [data]="instrument.chartStream"
              [rangeInMinutes]="1440"
            ></app-indicator-chart>
          </div>
        </clr-dg-row-detail>
      </clr-dg-row>
    </clr-datagrid>
  `,
  styles: [
    `
      .chart {
        box-sizing: border-box;
        width: calc(100% - 18px);
      }
      .positive.negative {
        color: red;
      }
      .positive {
        color: green;
      }
    `,
  ],
})
export class WatchlistComponent implements OnInit {
  @Input()
  set watchlist(val: string[]) {
    if (val) this.process(val);
  }
  processedWatchList: {
    instrument_name: string;
    chartStream: Observable<any>;
    tickerStream: Observable<any>;
  }[] = [];
  constructor(private tickerService: TickerService) {}

  ngOnInit(): void {}

  private process(val: string[]) {
    this.processedWatchList = val.map((inst) => {
      return {
        instrument_name: inst,
        chartStream: this.getChartStream(inst),
        tickerStream: this.tickerService
          .stream(inst)
          .pipe(map((res) => res.data[0])),
      };
    });
  }

  private getChartStream(instrument: string) {
    return concat(
      this.tickerService.getHistoricalData(instrument, 60 * 24, '15m'),
      this.tickerService.stream(instrument).pipe(map((d) => [d]))
    ).pipe(
      this.tickerService.roundTimePipe(60 * 15),
      map((data) => {
        return data.map((point: any) => {
          return ChartData.from(new Date(point.data[0].t), point.data[0].a);
        });
      })
    );
  }
}
