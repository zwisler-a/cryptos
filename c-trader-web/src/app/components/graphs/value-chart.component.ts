import { ReturnStatement } from '@angular/compiler';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import {
  createChart,
  IChartApi,
  IPriceLine,
  ISeriesApi,
  PriceLineOptions,
  UTCTimestamp,
} from 'lightweight-charts';
import { Observable, Subscription } from 'rxjs';
import { ChartData } from 'src/app/types/chart-data.type';

@Component({
  selector: 'app-value-chart',
  template: `
    <div
      class="chart"
      [ngClass]="{ hidden: loading, 'fade-in': !loading }"
      #chart
    ></div>
    <div class="progress loop fade-in" *ngIf="loading">
      <progress></progress>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
      }
      .chart {
        display: flex;
      }
      .hidden {
        opacity: 0;
      }
    `,
  ],
})
export class ValueChartComponent implements OnInit {
  @ViewChild('chart', { static: true }) chartRef?: ElementRef<any>;
  private chart?: IChartApi;
  private areaSeries?: ISeriesApi<'Area'>;
  loading = true;
  private dataSubscription?: Subscription;
  private createdLines: IPriceLine[] = [];

  @Input() rangeInMinutes = 60;
  @Input() decimalPlaces: number = 2;
  @Input() lines: PriceLineOptions[] = [];

  @Input() set data(val: Observable<ChartData[]> | undefined) {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    if (val) {
      this.areaSeries?.setData([]);
      this.loading = true;
      this.dataSubscription = val.subscribe(this.updateData.bind(this));
    }
  }

  constructor(private ref: ElementRef) {}

  private updateData(data: ChartData[]) {
    this.loading = false;
    if (!this.chart) window.requestAnimationFrame(() => this.updateData(data));
    data.forEach((value) => this.areaSeries?.update(value));
    this.setRange();
    this.updateLines();
  }

  private updateLines() {
    if (!this.areaSeries) return;
    const series = this.areaSeries;
    this.createdLines.forEach((line) => series.removePriceLine(line));
    this.createdLines = this.lines.map((line) => {
      return series.createPriceLine(line);
    });
  }

  ngOnInit(): void {
    if (!this.chartRef) return console.log('fuck');
    this.chart = createChart(this.chartRef.nativeElement, {
      layout: { backgroundColor: '#33333300' },
      grid: { horzLines: { visible: true }, vertLines: { visible: false } },
      width: this.ref.nativeElement.width,
      height: 200,
      handleScroll: false,
      // handleScale: false,
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
      },
    });
    this.areaSeries = this.chart.addAreaSeries({
      priceFormat: {
        precision: this.decimalPlaces,
        minMove: 1 / Math.pow(10, this.decimalPlaces),
      },
    });
  }

  private setRange() {
    this.chart?.timeScale().setVisibleRange({
      from: (new Date().getTime() / 1000 -
        this.rangeInMinutes * 60) as UTCTimestamp,
      to: (new Date().getTime() / 1000) as UTCTimestamp,
    });
  }
}
