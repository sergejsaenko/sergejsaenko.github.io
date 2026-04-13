import { Injectable, signal, computed } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { map, tap } from 'rxjs';
import { SIGN_UP, SIGN_IN } from './authMutations';
import { persistToken, clearToken, getStoredToken, isTokenPresent, getStoredRole, decodeTokenPayload } from './authEffects';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _isLoggedIn = signal(isTokenPresent());
  private readonly _role = signal<string | null>(getStoredRole());

  readonly isLoggedIn = this._isLoggedIn.asReadonly();
  readonly isGuest = computed(() => !this._isLoggedIn());
  // True only when logged in AND the JWT carries role = "admin"
  readonly isAdmin = computed(() => this._isLoggedIn() && this._role() === 'admin');

  constructor(private readonly apollo: Apollo) {}

  signUp(username: string, password: string) {
    return this.apollo
      .mutate({ mutation: SIGN_UP, variables: { username, password } })
      .pipe(map((result: any) => result.data.signUp));
  }

  signIn(username: string, password: string) {
    return this.apollo
      .mutate({ mutation: SIGN_IN, variables: { username, password } })
      .pipe(
        map((result: any) => result.data.signIn.token),
        tap((token: string) => {
          persistToken(token);
          this._isLoggedIn.set(true);
          // Decode role directly from the just-received token
          const payload = decodeTokenPayload(token);
          this._role.set(
            (payload?.['role'] as string) ??
            (payload?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] as string) ??
            null
          );
        }),
      );
  }

  logout(): void {
    clearToken();
    this._isLoggedIn.set(false);
    this._role.set(null);
  }

  getToken(): string | null {
    return getStoredToken();
  }
}

