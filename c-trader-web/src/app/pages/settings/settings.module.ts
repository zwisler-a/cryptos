import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';

import { AuthnSettingsComponent } from './authn-settings.component';
import { LogEntryComponent } from './log-entry.component';
import { LogComponent } from './log.component';
import { LoggingService } from './logging.service';
import { SettingsComponent } from './settings.component';

@NgModule({
  declarations: [
    SettingsComponent,
    LogEntryComponent,
    LogComponent,
    AuthnSettingsComponent,
  ],
  imports: [CommonModule, ClarityModule, FormsModule],
  providers: [LoggingService],
})
export class SettingsModule {}
