import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { PositionsComponent } from './pages/positions/positions.component';
import { ViewPositionComponent } from './pages/positions/view-position.component';
import { AuthGuard } from './pages/shell/auth.guard';
import { ConfigComponent } from './pages/shell/config.component';
import { LoginComponent } from './pages/shell/login.component';
import { ShellComponent } from './pages/shell/shell.component';
import { TradesComponent } from './pages/trades/trades.component';
import { WalletComponent } from './pages/wallet/wallet.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: ShellComponent,
    canActivateChild: [AuthGuard],
    canActivate: [],
    children: [
      {
        path: 'dash',
        component: DashboardComponent,
        data: { walletIndicator: false },
      },
      { path: 'positions', component: PositionsComponent },
      { path: 'config', component: ConfigComponent },
      { path: 'positions/:id', component: ViewPositionComponent },
      { path: 'wallet', component: WalletComponent },
      { path: 'trades', component: TradesComponent },
      { path: '**', redirectTo: '/positions', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
