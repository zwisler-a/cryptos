import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'percentage',
})
export class PercentagePipe implements PipeTransform {
  transform(change: number, absolute: number): unknown {
    return `${(change / (absolute / 100)).toFixed(2)}%`;
  }
}
