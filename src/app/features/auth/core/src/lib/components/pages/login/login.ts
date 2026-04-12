import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../../../states/authFacade';
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
  protected readonly passwordConfirm = signal('');
  protected readonly isSignUp = signal(false);
  protected readonly loading = signal(false);
  protected readonly usernameFocused = signal(false);
  protected readonly passwordFocused = signal(false);

  // Computed: hint visible only while focused, in signup mode, AND condition not yet met
  protected readonly showUsernameHintLength = computed(() => this.isSignUp() && this.usernameFocused() && this.username().length < 4);
  protected readonly showUsernameHintChars  = computed(() => this.isSignUp() && this.usernameFocused() && this.username().length > 0 && !this.USERNAME_PATTERN.test(this.username()));
  protected readonly showUsernameHintDigits = computed(() => this.isSignUp() && this.usernameFocused() && this.username().length > 0 && /^\d+$/.test(this.username()));
  protected readonly showPasswordHintLength  = computed(() => this.isSignUp() && this.passwordFocused() && this.password().length < 6);
  protected readonly showPasswordHintDigits  = computed(() => this.isSignUp() && this.passwordFocused() && this.password().length > 0 && /^\d+$/.test(this.password()));
  protected readonly showPasswordHintDanger  = computed(() => this.isSignUp() && this.passwordFocused() && this.password().length > 0 && this.DANGEROUS_PATTERN.test(this.password()));
  protected readonly showPasswordMismatch   = computed(() => this.isSignUp() && this.passwordConfirm().length > 0 && this.password() !== this.passwordConfirm());

  // True when all signup fields pass validation – enables the submit button
  protected readonly isSignUpFormValid = computed(() => {
    const u = this.username().trim();
    const p = this.password();
    return (
      u.length >= 4 &&
      u.length <= this.MAX_USERNAME_LENGTH &&
      !/^\d+$/.test(u) &&
      this.USERNAME_PATTERN.test(u) &&
      p.length >= 6 &&
      p.length <= this.MAX_PASSWORD_LENGTH &&
      !/^\d+$/.test(p) &&
      !this.DANGEROUS_PATTERN.test(p) &&
      p === this.passwordConfirm()
    );
  });

  // Hint is in "error" state (red) when user has typed something but condition still fails
  protected readonly usernameHintLengthIsError = computed(() => this.username().length > 0 && this.username().length < 4);
  protected readonly usernameHintCharsIsError  = computed(() => true); // only visible when already invalid
  protected readonly usernameHintDigitsIsError = computed(() => true); // only visible when already invalid
  protected readonly passwordHintLengthIsError = computed(() => this.password().length > 0 && this.password().length < 6);
  protected readonly passwordHintDigitsIsError = computed(() => true); // only visible when already invalid
  protected readonly passwordHintDangerIsError = computed(() => true); // only visible when already invalid

  // Backslash removed – only letters, digits, underscore, dot, dash
  private readonly USERNAME_PATTERN = /^[a-zA-Z0-9_.\-]+$/;
  // Reject dangerous sequences: <, >, ", ', ;, --, /* */ for SQL/HTML/JS injection
  private readonly DANGEROUS_PATTERN = /[<>"';]|--|\/\*/;

  private readonly MAX_USERNAME_LENGTH = 16;
  private readonly MAX_PASSWORD_LENGTH = 128;

  constructor(
    private readonly auth: AuthService,
    private readonly snackbar: SnackbarService,
    private readonly router: Router,
    private readonly transloco: TranslocoService,
  ) {}

  private validateForSignUp(): string | null {
    const u = this.username().trim();
    const p = this.password();

    if (u.length < 4) return 'auth.login.usernameTooShort';
    if (u.length > this.MAX_USERNAME_LENGTH) return 'auth.login.usernameInvalid';
    if (/^\d+$/.test(u)) return 'auth.login.usernameOnlyDigits';
    if (!this.USERNAME_PATTERN.test(u)) return 'auth.login.usernameInvalid';
    if (p.length < 6) return 'auth.login.passwordTooShort';
    if (p.length > this.MAX_PASSWORD_LENGTH) return 'auth.login.passwordInvalid';
    if (/^\d+$/.test(p)) return 'auth.login.passwordOnlyDigits';
    if (this.DANGEROUS_PATTERN.test(p)) return 'auth.login.passwordInvalid';
    if (p !== this.passwordConfirm()) return 'auth.login.passwordMismatch';

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

      // Trim username before sending
      this.auth.signUp(this.username().trim(), this.password()).subscribe({
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
      this.auth.signIn(this.username().trim(), this.password()).subscribe({
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
    // Reset confirm field when switching modes
    this.passwordConfirm.set('');
  }
}
