import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideTranslocoService } from './transloco-loader';
import { provideGraphQL } from './core/graphql.provider';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    ...provideGraphQL(),
    provideTranslocoService(),
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes)
  ]
};
