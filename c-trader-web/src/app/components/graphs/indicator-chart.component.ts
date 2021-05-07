import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { createChart, IChartApi, ISeriesApi, UTCTimestamp } from 'lightweight-charts';
import { Observable, Subscription } from 'rxjs';
import { ChartData } from 'src/app/types/chart-data.type';

@Component({
  selector: 'app-indicator-chart',
  template: `<div class="overlay"></div>`,
  styles: [
    `
      .overlay {
        background: linear-gradient(
          90deg,
          rgba(33, 33, 33, 1) 0%,
          rgba(0, 0, 0, 0) 14%
        );
      }
    `,
  ],
})
export class IndicatorChartComponent implements OnInit {
  private chart?: IChartApi;
  private areaSeries?: ISeriesApi<'Area'>;

  private dataSubscription?: Subscription;

  @Input() set data(val: Observable<ChartData[]>) {
    if (this.dataSubscription) this.dataSubscription.unsubscribe();
    val.subscribe(this.updateData.bind(this));
  }

  constructor(private ref: ElementRef) {}

  private updateData(data: ChartData[]) {
    if (!this.chart) window.requestAnimationFrame(() => this.updateData(data));
    data.forEach((value) => this.areaSeries?.update(value));
    this.setRange()
  }

  ngOnInit(): void {
    this.chart = createChart(this.ref.nativeElement, {
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

  private setRange() {
    this.chart?.timeScale().setVisibleRange({
      from: (new Date().getTime() / 1000 - 60 * 60) as UTCTimestamp,
      to: (new Date().getTime() / 1000) as UTCTimestamp,
    });
  }
}
