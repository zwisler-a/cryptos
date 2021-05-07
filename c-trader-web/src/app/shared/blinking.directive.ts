import { Directive, HostBinding, Input } from '@angular/core';

@Directive({
  selector: '[appBlinking]',
})
export class BlinkingDirective {
  private previousValue: number = 0;
  @Input() set appBlinking(val: number) {
    if (this.previousValue < val) this.up();
    if (this.previousValue > val) this.down();
    this.previousValue = val;
  }

  @HostBinding('class')
  elementClass = '';

  constructor() {}

  private down() {
    this.elementClass = 'down';
    setTimeout(() => (this.elementClass = ''), 300);
  }
  private up() {
    this.elementClass = 'up';
    setTimeout(() => (this.elementClass = ''), 300);
  }
}
