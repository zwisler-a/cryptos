import { Component, OnInit } from '@angular/core';
import { AuthnService } from './authn.service';

@Component({
  selector: 'app-shell-config',
  template: ` <button class="btn" (click)="registerFingerpring">Register fingerprint</button> `,
  styles: [``],
})
export class ConfigComponent implements OnInit {
  constructor(private authnService: AuthnService) {}
  ngOnInit(): void {}

  registerFingerpring() {
    this.authnService.register().subscribe();
  }
}
