import { BarData, Time, UTCTimestamp } from 'lightweight-charts';

export class ChartData {
  constructor(public time: Time, public value: number) {}

  static from(time: Date, value: number): ChartData {
    return { time: Math.floor(time.getTime() / 1000) as UTCTimestamp, value };
  }
}

export class CandlestickChartData implements BarData{
  constructor(
    public time: Time,
    public open: number,
    public close: number,
    public high: number,
    public low: number
  ) {}
  static from(
    time: Date,
    open: number,
    close: number,
    high: number,
    low: number
  ): CandlestickChartData {
    return {
      time: Math.floor(time.getTime() / 1000) as UTCTimestamp,
      open,
      close,
      high,
      low,
    };
  }
}

export class PieChartData {
  static colorPalette = ['#1d2d50', '#133b5c', '#1e5f74', '#222831'];
  static colorCount = 0;

  constructor(
    public data: number,
    public label: string,
    public index?: number,
    public color?: string
  ) {
    if (!color && index) {
      this.color =
        PieChartData.colorPalette[index % PieChartData.colorPalette.length];
    }
  }
}
