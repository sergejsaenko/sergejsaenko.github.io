import { Injectable, signal, computed } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { map, tap } from 'rxjs';
import { SIGN_UP, SIGN_IN } from './authMutations';
import { persistToken, clearToken, getStoredToken, isTokenPresent } from './authEffects';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _isLoggedIn = signal(isTokenPresent());

  readonly isLoggedIn = this._isLoggedIn.asReadonly();
  readonly isGuest = computed(() => !this._isLoggedIn());

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
        }),
      );
  }

  logout(): void {
    clearToken();
    this._isLoggedIn.set(false);
  }

  getToken(): string | null {
    return getStoredToken();
  }
}

