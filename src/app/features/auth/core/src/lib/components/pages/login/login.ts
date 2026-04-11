import { Component, computed, signal } from '@angular/core';
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

  // Computed: hint is visible only while focused AND condition not yet met
  protected readonly showUsernameHintLength = computed(() => this.usernameFocused() && this.username().length < 4);
  protected readonly showUsernameHintChars  = computed(() => this.usernameFocused() && this.username().length > 0 && !this.USERNAME_PATTERN.test(this.username()));
  protected readonly showUsernameHintDigits = computed(() => this.usernameFocused() && this.username().length > 0 && /^\d+$/.test(this.username()));
  protected readonly showPasswordHintLength = computed(() => this.passwordFocused() && this.password().length < 6);
  protected readonly showPasswordHintDigits = computed(() => this.passwordFocused() && this.password().length > 0 && /^\d+$/.test(this.password()));

  // Only letters, digits, underscore, dot, dash – no HTML/SQL special chars
  private readonly USERNAME_PATTERN = /^[a-zA-Z0-9_.\\-]+$/;
  // Reject dangerous sequences: <, >, ", ', ;, --, /* */ for SQL/HTML/JS injection
  private readonly DANGEROUS_PATTERN = /[<>"';]|--|\/\*/;

  constructor(
    private readonly auth: AuthService,
    private readonly snackbar: SnackbarService,
    private readonly router: Router,
    private readonly transloco: TranslocoService,
  ) {}

  private validateForSignUp(): string | null {
    const u = this.username();
    const p = this.password();

    if (u.length < 4) return 'auth.login.usernameTooShort';
    if (/^\d+$/.test(u)) return 'auth.login.usernameOnlyDigits';
    if (!this.USERNAME_PATTERN.test(u)) return 'auth.login.usernameInvalid';
    if (p.length < 6) return 'auth.login.passwordTooShort';
    if (/^\d+$/.test(p)) return 'auth.login.passwordOnlyDigits';
    if (this.DANGEROUS_PATTERN.test(p)) return 'auth.login.passwordInvalid';

    return null;
  }

  submit(): void {
    this.loading.set(true);

    if (this.isSignUp()) {
      const validationError = this.validateForSignUp();
      if (validationError) {
        this.snackbar.error(this.transloco.translate(validationError));
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
