import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  createChart,
  CrosshairMode,
  IChartApi,
  IPriceLine,
  ISeriesApi,
  PriceLineOptions,
  UTCTimestamp,
} from 'lightweight-charts';
import { Observable, Subscription } from 'rxjs';
import { CandlestickChartData } from 'src/app/types/chart-data.type';

@Component({
  selector: 'app-candlestick-chart',
  template: `<div
      #chart
      [ngClass]="{ hidden: loading, 'fade-in': !loading }"
    ></div>
    <clr-progress-bar
      class="bar"
      *ngIf="loading"
      [clrLoop]="true"
    ></clr-progress-bar>`,
  styles: [
    `
      :host {
        position: relative;
      }
      .bar {
        position: absolute;
        top: 0;
      }
      .hidden {
        opacity: 0;
      }
    `,
  ],
})
export class CandlestickChartComponent implements OnInit, OnDestroy {
  @ViewChild('chart', { static: true }) chartRef?: ElementRef<any>;
  private chart?: IChartApi;
  private candleSeries?: ISeriesApi<'Candlestick'>;
  loading = true;

  private dataSubscription?: Subscription;

  @Input() lines: PriceLineOptions[] = [];
  private createdLines: IPriceLine[] = [];
  @Input() width?: number;
  @Input() decimalPlaces: number = 2;
  @Input() set data(val: Observable<CandlestickChartData[]> | undefined) {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    if (val) {
      this.candleSeries?.setData([]);
      this.loading = true;
      this.dataSubscription = val.subscribe(this.updateData.bind(this));
    }
  }

  constructor() {}
  ngOnDestroy(): void {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }

  private updateData(data: CandlestickChartData[]) {
    this.loading = false;
    if (!this.chart) window.requestAnimationFrame(() => this.updateData(data));
    data.forEach((value) => this.candleSeries?.update(value));
    this.updateLines();
  }

  ngOnInit(): void {
    this.chart = createChart(this.chartRef?.nativeElement, {
      crosshair: {
        vertLine: {
            color: '#6A5ACD',
            width: 1,
            style: 1,
            visible: true,
            labelVisible: true,
        },
        horzLine: {
            color: '#6A5ACD',
            width: 1,
            style: 0,
            visible: true,
            labelVisible: true,
        },
        mode: CrosshairMode.Normal,
    },
      layout: { backgroundColor: '#33333300' },
      width: this.width,
      height: 300,
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
      },
    });
    this.candleSeries = this.chart.addCandlestickSeries({
      priceFormat: {
        precision: this.decimalPlaces,
        minMove: 1 / Math.pow(10, this.decimalPlaces),
      },
    });
  }

  private updateLines() {
    if (!this.candleSeries) return;
    const series = this.candleSeries;
    this.createdLines.forEach((line) => series.removePriceLine(line));
    this.createdLines = this.lines.map((line) => {
      return series.createPriceLine(line);
    });
  }
}
