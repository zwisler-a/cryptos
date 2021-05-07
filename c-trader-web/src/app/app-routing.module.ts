import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PositionsComponent } from './pages/positions/positions.component';
import { ViewPositionComponent } from './pages/positions/view-position.component';
import { TradesComponent } from './pages/trades/trades.component';
import { WalletComponent } from './pages/wallet/wallet.component';

const routes: Routes = [
  { path: 'positions', component: PositionsComponent },
  { path: 'positions/:id', component: ViewPositionComponent },
  { path: 'wallet', component: WalletComponent },
  { path: 'trades', component: TradesComponent },
  { path: '**', redirectTo: '/positions', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
