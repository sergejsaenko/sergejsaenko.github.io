import { Injectable, signal } from '@angular/core';

export interface SnackbarNotification {
  message: string;
  type: 'success' | 'error';
}

@Injectable({ providedIn: 'root' })
export class SnackbarService {
  private readonly _notification = signal<SnackbarNotification | null>(null);
  readonly notification = this._notification.asReadonly();

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error');
  }

  private show(message: string, type: 'success' | 'error'): void {
    this._notification.set({ message, type });
    // Clear after CSS animation finishes (5s) + small buffer
    setTimeout(() => this._notification.set(null), 5100);
  }
}

// (file moved from components/snackbar/)

