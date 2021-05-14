import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ArcElement, Chart, DoughnutController } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { PieChartData } from 'src/app/types/chart-data.type';

Chart.register(DoughnutController, ArcElement, ChartDataLabels);

@Component({
  selector: 'app-pie-chart',
  template: `<div><canvas #chart></canvas></div>`,
  styles: [
    `
      div {
        max-width: 400px;
        margin: auto;
      }
    `,
  ],
})
export class PieChartComponent implements OnInit, OnChanges {
  @ViewChild('chart', { static: true }) chartRef?: ElementRef<any>;
  chart?: Chart;

  @Input() data?: PieChartData[];

  constructor() {}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) this.updateData();
  }

  ngOnInit(): void {
    this.chart = new Chart(this.chartRef?.nativeElement, {
      type: 'doughnut',
      options: {
        plugins: {
          datalabels: {
            color: 'black',
            formatter: function (value, context) {
              if (context.chart.data.labels)
                return context.chart.data.labels[context.dataIndex];
            },
            textStrokeWidth: 0.5,
            anchor: 'end',
            align: 'end',
            offset: 5,
          },
        },
        layout: { padding: 80 },
        responsive: true,
      },

      plugins: [ChartDataLabels],
      data: {
        labels: [],
        datasets: [
          {
            rotation: 30,
            label: '',
            data: [],
            backgroundColor: [],
            hoverOffset: 4,
          },
        ],
      },
    });
    this.updateData();
  }

  private updateData() {
    if (!this.chart || !this.data) return;
    const chartData = this.chart.data;
    chartData.labels = [];
    chartData.datasets[0].data = [];
    chartData.datasets[0].backgroundColor = [];
    this.data.forEach((dat) => {
      chartData.labels?.push(dat.label);
      chartData.datasets[0].data.push(dat.data);
      (chartData.datasets[0].backgroundColor as any[]).push(dat.color);
      (chartData.datasets[0] as any).rotation = 45;
    });
    this.chart.update();
  }
}
