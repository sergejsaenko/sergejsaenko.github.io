import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './features/layout/core/src';
import { InteractiveBackgroundComponent } from './shared/interactive-background/interactive-background.component';
import { SnackbarComponent } from './shared/snackbar/snackbar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, InteractiveBackgroundComponent, SnackbarComponent],
  template: `
    <app-interactive-background></app-interactive-background>
    <app-header></app-header>
    <main>
      <router-outlet></router-outlet>
    </main>
    <app-snackbar></app-snackbar>`,
  styles: `
    main {
      padding: 16px;
      }`,
})
export class App {
  protected readonly title = signal('scaffiz_website');
}
