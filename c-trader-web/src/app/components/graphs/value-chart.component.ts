import { Component, ElementRef, Input, OnInit } from '@angular/core';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  UTCTimestamp,
} from 'lightweight-charts';
import { Observable, Subscription } from 'rxjs';
import { ChartData } from 'src/app/types/chart-data.type';

@Component({
  selector: 'app-value-chart',
  template: ``,
  styles: [``],
})
export class ValueChartComponent implements OnInit {
  private chart?: IChartApi;
  private areaSeries?: ISeriesApi<'Area'>;

  private dataSubscription?: Subscription;

  @Input() rangeInMinutes = 60;

  @Input() set data(val: Observable<ChartData[]> | undefined) {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    if (val) {
      this.areaSeries?.setData([]);
      val.subscribe(this.updateData.bind(this));
    }
  }

  constructor(private ref: ElementRef) {}

  private updateData(data: ChartData[]) {
    if (!this.chart) window.requestAnimationFrame(() => this.updateData(data));
    data.forEach((value) => this.areaSeries?.update(value));
    this.setRange();
  }

  ngOnInit(): void {
    this.chart = createChart(this.ref.nativeElement, {
      layout: { backgroundColor: '#33333300' },
      grid: { horzLines: { visible: true }, vertLines: { visible: false } },
      width: this.ref.nativeElement.width,
      height: 200,
      handleScroll: false,
      handleScale: false,
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
      },
    });
    this.areaSeries = this.chart.addAreaSeries();
  }

  private setRange() {
    this.chart?.timeScale().setVisibleRange({
      from: (new Date().getTime() / 1000 -
        this.rangeInMinutes * 60) as UTCTimestamp,
      to: (new Date().getTime() / 1000) as UTCTimestamp,
    });
  }
}
