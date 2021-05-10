import { Component, OnInit } from '@angular/core';
import { InstrumentService } from '../services/instruments.service';
import { PositionService } from '../services/position.service';

@Component({
  selector: 'app-create-position',
  template: `
    <div class="create-position">
      <div class="btn-group">
        <div class="radio btn btn-sm">
          <input type="radio" checked name="radio" id="buy" />
          <label (click)="side = 'BUY'" for="buy">BUY</label>
        </div>
        <div class="radio btn btn-sm">
          <input type="radio" name="radio" id="sell" />
          <label (click)="side = 'SELL'" for="sell">SELL</label>
        </div>
      </div>
      <clr-datalist-container>
        <input
          clrDatalistInput
          [(ngModel)]="newPostionInstrument"
          placeholder="Instrument"
        />
        <datalist>
          <option
            *ngFor="let item of instruments$ | async"
            [value]="item.instrument_name"
          ></option>
        </datalist>
      </clr-datalist-container>
      <button class="btn btn-sm" (click)="openPosition()">Hinzufügen</button>
    </div>
  `,
  styles: [
    `
      .create-position {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: flex-end;
        align-items: flex-end;
        gap: 8px;
      }
      .clr-form-control.clr-row {
        margin-top: 0;
      }
      .btn {
        margin-bottom: 0;
      }
    `,
  ],
})
export class CreatePositionComponent implements OnInit {
  positions$ = this.positionService.stream();
  instruments$ = this.instrumentService.stream();

  newPostionInstrument = '';
  side: 'BUY' | 'SELL' = 'BUY';
  constructor(
    private positionService: PositionService,
    private instrumentService: InstrumentService
  ) {}

  ngOnInit(): void {}

  openPosition() {
    this.positionService.openPosition(this.newPostionInstrument, this.side);
  }
  closePosition(id: string) {
    this.positionService.closePosition(id);
  }
}
