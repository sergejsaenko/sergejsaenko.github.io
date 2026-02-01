import { HttpClient } from '@angular/common/http';
import {
  TRANSLOCO_LOADER,
  Translation,
  TranslocoLoader,
  provideTransloco,
  TranslocoConfig
} from '@jsverse/transloco';
import { Injectable, isDevMode } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  constructor(private http: HttpClient) {}

  getTranslation(lang: string) {
    return this.http.get<Translation>(`./i18n/${lang}.json`);
  }
}

export const translocoConfig: Partial<TranslocoConfig> = {
  availableLangs: ['de'],
  defaultLang: 'de',
  // Remove this option if your application doesn't support changing language in runtime.
  reRenderOnLangChange: true,
  prodMode: !isDevMode(),
};

export function provideTranslocoService() {
  return provideTransloco({
    config: translocoConfig,
    loader: TranslocoHttpLoader
  });
}
