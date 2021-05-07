import { Time, UTCTimestamp } from 'lightweight-charts';

export class ChartData {
  constructor(public time: Time, public value: number) {}

  static from(time: Date, value: number): ChartData {
    return { time: Math.floor(time.getTime() / 1000) as UTCTimestamp, value };
  }
}
