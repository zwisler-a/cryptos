import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClarityIcons, namespaceIcon, snowflakeIcon, timesIcon } from '@cds/core/icon';
import { ClarityModule } from '@clr/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BalanceComponent } from './components/balance.component';
import { ChangeSinceComponent } from './components/change-since.component';
import { CreatePositionComponent } from './components/create-position.component';
import { PositionListComponent } from './components/position-list.component';
import { StockTickerComponent } from './components/stock-ticker.component';
import { TradesListComponent } from './components/trades-list.component';
import { PositionsComponent } from './pages/positions/positions.component';
import { ViewPositionComponent } from './pages/positions/view-position.component';
import { ShellComponent } from './pages/shell/shell.component';
import { TradesComponent } from './pages/trades/trades.component';
import { WalletComponent } from './pages/wallet/wallet.component';
import { BalanceService } from './services/balance.service';
import { InstrumentService } from './services/instruments.service';
import { TickerService } from './services/ticker.service';
import { BlinkingDirective } from './shared/blinking.directive';
import { PercentagePipe } from './shared/percentage.pipe';
import { BuyFormComponent } from './components/buy-form.component';
import { SellFormComponent } from './components/sell-form.component';
import { CandlestickService } from './services/candlestick.service';
import { IndicatorChartComponent } from './components/graphs/indicator-chart.component';
import { WalletIndicatorComponent } from './components/wallet-indicator.component';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { ValueChartComponent } from './components/graphs/value-chart.component';
import { PositionService } from './services/position.service';

ClarityIcons.addIcons(namespaceIcon, timesIcon);

@NgModule({
  declarations: [
    AppComponent,
    StockTickerComponent,
    PercentagePipe,
    BlinkingDirective,
    BalanceComponent,
    TradesListComponent,
    ChangeSinceComponent,
    PositionListComponent,
    CreatePositionComponent,
    ShellComponent,
    PositionsComponent,
    TradesComponent,
    WalletComponent,
    ViewPositionComponent,
    BuyFormComponent,
    SellFormComponent,
    IndicatorChartComponent,
    WalletIndicatorComponent,
    ValueChartComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ClarityModule,
    BrowserAnimationsModule,
    LoggerModule.forRoot({ level: NgxLoggerLevel.DEBUG }),
  ],
  providers: [
    TickerService,
    InstrumentService,
    BalanceService,
    CandlestickService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(private a: PositionService) {}
}
