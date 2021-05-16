import { Component, OnInit } from '@angular/core';

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
  error = false;
  form = {
    username: '',
    password: '',
    rememberMe: true,
  };

  constructor() {}

  ngOnInit(): void {}

  login(){
    
  }
}
