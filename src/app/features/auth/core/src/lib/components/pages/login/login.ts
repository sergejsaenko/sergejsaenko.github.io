import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../../../../../core/services/auth.service';
import { SnackbarService } from '../../../../../../../../shared/snackbar/snackbar.service';
import { TRANSLOCO_SCOPE, TranslocoDirective, TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, TranslocoDirective],
  templateUrl: './login.html',
  styleUrl: './login.css',
  providers: [
    {
      provide: TRANSLOCO_SCOPE,
      useValue: 'auth'
    }
  ]
})
export class Login {
  protected readonly username = signal('');
  protected readonly password = signal('');
  protected readonly isSignUp = signal(false);
  protected readonly loading = signal(false);
  protected readonly usernameFocused = signal(false);
  protected readonly passwordFocused = signal(false);

  constructor(
    private readonly auth: AuthService,
    private readonly snackbar: SnackbarService,
    private readonly router: Router,
    private readonly transloco: TranslocoService,
  ) {}

  submit(): void {
    this.loading.set(true);

    if (this.isSignUp()) {
      if (this.username().length < 4) {
        this.snackbar.error(this.transloco.translate('auth.login.usernameTooShort'));
        this.loading.set(false);
        return;
      }
      if (this.password().length < 6) {
        this.snackbar.error(this.transloco.translate('auth.login.passwordTooShort'));
        this.loading.set(false);
        return;
      }

      this.auth.signUp(this.username(), this.password()).subscribe({
        next: () => {
          this.snackbar.success(this.transloco.translate('auth.login.registrationSuccess'));
          this.isSignUp.set(false);
          this.loading.set(false);
        },
        error: (err) => {
          let msg = this.transloco.translate('auth.login.registrationFailed');
          if (err?.message?.includes('duplicate key value') || err?.message?.includes('users_username_key')) {
            msg = this.transloco.translate('auth.login.usernameExists');
          }
          this.snackbar.error(msg);
          this.loading.set(false);
        },
      });
    } else {
      this.auth.signIn(this.username(), this.password()).subscribe({
        next: () => {
          this.snackbar.success(this.transloco.translate('auth.login.welcome'));
          this.loading.set(false);
          this.router.navigate(['/']);
        },
        error: () => {
          this.snackbar.error(this.transloco.translate('auth.login.loginFailed'));
          this.loading.set(false);
        },
      });
    }
  }

  toggleMode(): void {
    this.isSignUp.update((v) => !v);
  }
}
