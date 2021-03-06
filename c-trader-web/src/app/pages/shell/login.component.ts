import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import base64url from 'base64url';
import { delay, mergeMap } from 'rxjs/operators';
import { AuthnService } from './authn.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="login-wrapper">
      <form class="login" (ngSubmit)="login()">
        <section class="title">
          <!-- <h3 class="welcome">Welcome to</h3>
          Company Product Name
          <h5 class="hint">Use your Company ID to sign in or create one now</h5> -->
          <img src="/assets/logo_black_md.png" />
        </section>
        <ng-container *ngIf="formLogin">
          <div class="login-group">
            <clr-input-container>
              <label class="clr-sr-only">Username</label>
              <input
                type="text"
                name="username"
                clrInput
                placeholder="Username"
                [(ngModel)]="form.username"
              />
            </clr-input-container>
            <clr-password-container>
              <label class="clr-sr-only">Password</label>
              <input
                type="password"
                name="password"
                clrPassword
                placeholder="Password"
                [(ngModel)]="form.password"
              />
            </clr-password-container>
            <clr-checkbox-wrapper>
              <label>Remember me</label>
              <input
                type="checkbox"
                name="rememberMe"
                clrCheckbox
                [(ngModel)]="form.rememberMe"
              />
            </clr-checkbox-wrapper>
            <div class="error active" *ngIf="error">
              Invalid user name or password
            </div>
            <button type="submit" class="btn btn-primary">login</button>
          </div>
        </ng-container>
      </form>
    </div>
  `,
  styles: [
    `
      .title {
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `,
  ],
})
export class LoginComponent implements OnInit {
  formLogin = false;
  error = false;
  form = {
    username: '',
    password: '',
    rememberMe: true,
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private authnService: AuthnService
  ) {}

  async ngOnInit() {
    this.authnService.login().subscribe(
      () => {
        this.router.navigate(['/']);
      },
      () => {
        this.formLogin = true;
      }
    );
  }

  login() {
    this.http
      .post('/auth/login', {
        username: this.form.username,
        password: this.form.password,
      })
      .subscribe((res) => {
        if (res) this.router.navigate(['/']);
      });
  }

  async triggerWebAuthn() {}
}
