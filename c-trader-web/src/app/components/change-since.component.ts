import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Subscription } from 'rxjs';

import { TickerService } from '../services/ticker.service';

@Component({
  selector: 'app-change-since',
  template: `<span
    class="text-flash"
    [appBlinking]="this.direction == 'BUY' ? change : -change"
    >{{ change | percentage: start }}</span
  >`,
  styles: [],
})
export class ChangeSinceComponent implements OnInit, OnChanges, OnDestroy {
  @Input() instrument: string = '';
  @Input() start: number = 0;
  @Input() direction: 'SELL' | 'BUY' = 'BUY';
  change = 0;
  sub: Subscription | null = null;

  constructor(private tickerService: TickerService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.instrument || changes.start) this.updateStream();
  }

  updateStream() {
    if (this.sub) this.sub.unsubscribe();
    this.sub = this.tickerService.stream(this.instrument).subscribe((data) => {
      this.change =
        this.direction == 'BUY'
          ? data.data[0].a - this.start
          : this.start - data.data[0].a;
    });
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
  }

  ngOnInit(): void {}
}
