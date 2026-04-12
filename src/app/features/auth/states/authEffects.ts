// Token persistence side effects – isolated from the facade so they can be tested/mocked independently

const TOKEN_KEY = 'auth_token';

export function persistToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function isTokenPresent(): boolean {
  return !!localStorage.getItem(TOKEN_KEY);
}

