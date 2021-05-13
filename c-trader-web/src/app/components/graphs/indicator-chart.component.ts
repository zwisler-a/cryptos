import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  UTCTimestamp,
} from 'lightweight-charts';
import { Observable, Subscription } from 'rxjs';
import { ChartData } from 'src/app/types/chart-data.type';

@Component({
  selector: 'app-indicator-chart',
  template: `<div
    #chart
    [ngClass]="{ hidden: loading, 'fade-in': !loading }"
  ></div>`,
  styles: [
    `
        .hidden {
        opacity: 0;
      }
      }
    `,
  ],
})
export class IndicatorChartComponent implements OnInit {
  @ViewChild('chart', { static: true }) chartRef?: ElementRef<any>;
  private chart?: IChartApi;
  private areaSeries?: ISeriesApi<'Area'>;
  loading = true;

  private dataSubscription?: Subscription;

  @Input() range = 60;
  @Input() set data(val: Observable<ChartData[]>) {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    if (val) {
      this.areaSeries?.setData([]);
      this.loading = true;
      this.dataSubscription = val.subscribe(this.updateData.bind(this));
    }
  }

  constructor() {}

  private updateData(data: ChartData[]) {
    this.loading = false;
    if (!this.chart) window.requestAnimationFrame(() => this.updateData(data));
    data.forEach((value) => this.areaSeries?.update(value));
    if (data && data.length) this.setRange(this.range);
  }

  ngOnInit(): void {
    this.chart = createChart(this.chartRef?.nativeElement, {
      rightPriceScale: {
        visible: false,
      },
      layout: { backgroundColor: '#33333300' },
      timeScale: { visible: false },
      grid: { horzLines: { visible: false }, vertLines: { visible: false } },
      width: 200,
      height: 30,
      crosshair: {
        horzLine: { visible: false },
        vertLine: { visible: false },
      },
      handleScroll: false,
      handleScale: false,
    });
    this.areaSeries = this.chart.addAreaSeries({
      crosshairMarkerVisible: false,
    });
    this.areaSeries
      ?.priceScale()
      .applyOptions({ scaleMargins: { bottom: 0.01, top: 0.01 } });
  }

  private setRange(inMinutes = 60) {
    this.chart?.timeScale().setVisibleRange({
      from: (new Date().getTime() / 1000 - 60 * inMinutes) as UTCTimestamp,
      to: (new Date().getTime() / 1000) as UTCTimestamp,
    });
  }
}
