import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './features/layout/core/src';
import { InteractiveBackgroundComponent } from './shared/components/interactive-background/interactive-background.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, InteractiveBackgroundComponent],
  template: `
    <app-interactive-background></app-interactive-background>
    <app-header></app-header>
    <main>
      <router-outlet></router-outlet>
    </main>`,
  styles: `
    main {
      padding: 16px;
      }`,
})
export class App {
  protected readonly title = signal('scaffiz_website');
}
