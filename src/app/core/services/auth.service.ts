import { Injectable, signal, computed } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { map, tap } from 'rxjs';

const SIGN_UP = gql`
  mutation SignUp($username: String!, $password: String!) {
    signUp(username: $username, password: $password) {
      id
      username
    }
  }
`;

const SIGN_IN = gql`
  mutation SignIn($username: String!, $password: String!) {
    signIn(username: $username, password: $password) {
      token
    }
  }
`;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'auth_token';
  private readonly _isLoggedIn = signal(!!localStorage.getItem('auth_token'));

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
          localStorage.setItem(this.tokenKey, token);
          this._isLoggedIn.set(true);
        }),
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this._isLoggedIn.set(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
}

