import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../../../../../core/services/auth.service';
import { SnackbarService } from '../../../../../../../../shared/snackbar/snackbar.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  protected readonly username = signal('');
  protected readonly password = signal('');
  protected readonly isSignUp = signal(false);
  protected readonly loading = signal(false);

  constructor(
    private readonly auth: AuthService,
    private readonly snackbar: SnackbarService,
    private readonly router: Router,
  ) {}

  submit(): void {
    this.loading.set(true);

    if (this.isSignUp()) {
      this.auth.signUp(this.username(), this.password()).subscribe({
        next: () => {
          this.snackbar.success('Registrierung erfolgreich! Du kannst dich jetzt anmelden.');
          this.isSignUp.set(false);
          this.loading.set(false);
        },
        error: (err) => {
          this.snackbar.error(err.message ?? 'Registrierung fehlgeschlagen.');
          this.loading.set(false);
        },
      });
    } else {
      this.auth.signIn(this.username(), this.password()).subscribe({
        next: () => {
          this.snackbar.success('Willkommen zurück!');
          this.loading.set(false);
          this.router.navigate(['/']);
        },
        error: () => {
          this.snackbar.error('Anmeldung fehlgeschlagen.');
          this.loading.set(false);
        },
      });
    }
  }

  toggleMode(): void {
    this.isSignUp.update((v) => !v);
  }
}

