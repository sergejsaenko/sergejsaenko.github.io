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

// Decode JWT payload (base64url → JSON) without verifying signature.
// Returns null on any parse error – treated as "no role".
export function decodeTokenPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    // base64url → base64
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

// Extracts role from the stored JWT. Handles both plain "role" and the
// .NET full-URI claim name that Hot Chocolate / ASP.NET Identity emits.
export function getStoredRole(): string | null {
  const token = getStoredToken();
  if (!token) return null;
  const payload = decodeTokenPayload(token);
  if (!payload) return null;
  return (
    (payload['role'] as string) ??
    (payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] as string) ??
    null
  );
}

