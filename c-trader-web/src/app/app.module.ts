import { HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { ClarityIcons, namespaceIcon, timesIcon } from '@cds/core/icon';
import { ClarityModule } from '@clr/angular';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';

import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BalanceComponent } from './components/balance.component';
import { BuyFormComponent } from './components/buy-form.component';
import { ChangeSinceComponent } from './components/change-since.component';
import { CreatePositionComponent } from './components/create-position.component';
import { CandlestickChartComponent } from './components/graphs/candlestick-chart.component';
import { IndicatorChartComponent } from './components/graphs/indicator-chart.component';
import { PieChartComponent } from './components/graphs/pie-chart.component';
import { ValueChartComponent } from './components/graphs/value-chart.component';
import { InvestmentPiechartComponent } from './components/investment-piechart.component';
import { OrderListComponent } from './components/order-list.component';
import { PositionListComponent } from './components/position-list.component';
import { SellFormComponent } from './components/sell-form.component';
import { StockTickerComponent } from './components/stock-ticker.component';
import { TradesListComponent } from './components/trades-list.component';
import { WalletIndicatorComponent } from './components/wallet-indicator.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { WatchlistComponent } from './pages/dashboard/watchlist.component';
import { PositionChartComponent } from './pages/positions/position-chart.component';
import { PositionsComponent } from './pages/positions/positions.component';
import { ViewPositionComponent } from './pages/positions/view-position.component';
import { LogEntryComponent } from './pages/settings/log-entry.component';
import { LoggingService } from './pages/settings/logging.service';
import { SettingsComponent } from './pages/settings/settings.component';
import { AlertService } from './pages/shell/alert.service';
import { AuthGuard } from './pages/shell/auth.guard';
import { AuthnService } from './pages/shell/authn.service';
import { LoginComponent } from './pages/shell/login.component';
import { ShellComponent } from './pages/shell/shell.component';
import { TradesComponent } from './pages/trades/trades.component';
import { WalletComponent } from './pages/wallet/wallet.component';
import { BalanceService } from './services/balance.service';
import { CandlestickService } from './services/candlestick.service';
import { InstrumentService } from './services/instruments.service';
import { OrderService } from './services/order.service';
import { TickerService } from './services/ticker.service';
import { BlinkingDirective } from './shared/blinking.directive';
import { PercentagePipe } from './shared/percentage.pipe';

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
    ValueChartComponent,
    PositionChartComponent,
    OrderListComponent,
    PieChartComponent,
    InvestmentPiechartComponent,
    DashboardComponent,
    WatchlistComponent,
    CandlestickChartComponent,
    LoginComponent,
    SettingsComponent,
    LogEntryComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ClarityModule,
    BrowserAnimationsModule,
    LoggerModule.forRoot({ level: NgxLoggerLevel.DEBUG }),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
  providers: [
    LoggingService,
    AuthnService,
    AuthGuard,
    TickerService,
    InstrumentService,
    BalanceService,
    CandlestickService,
    OrderService,
    AlertService,
    {
      // processes all errors
      provide: ErrorHandler,
      useExisting: AlertService,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor() {}
}
