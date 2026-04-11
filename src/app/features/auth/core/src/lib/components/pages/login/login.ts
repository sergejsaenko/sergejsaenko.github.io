import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../../../../../core/services/auth.service';

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
  protected readonly message = signal('');
  protected readonly loading = signal(false);

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  submit(): void {
    this.loading.set(true);
    this.message.set('');

    if (this.isSignUp()) {
      this.auth.signUp(this.username(), this.password()).subscribe({
        next: () => {
          this.message.set('Registrierung erfolgreich! Du kannst dich jetzt anmelden.');
          this.isSignUp.set(false);
          this.loading.set(false);
        },
        error: (err) => {
          this.message.set(err.message);
          this.loading.set(false);
        },
      });
    } else {
      this.auth.signIn(this.username(), this.password()).subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/']);
        },
        error: () => {
          this.message.set('Anmeldung fehlgeschlagen.');
          this.loading.set(false);
        },
      });
    }
  }

  toggleMode(): void {
    this.isSignUp.update((v) => !v);
    this.message.set('');
  }
}

