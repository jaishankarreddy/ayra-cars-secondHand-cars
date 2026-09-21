import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection
} from '@angular/core';
import { provideRouter, TitleStrategy, withComponentInputBinding, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './routes/app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { SeoTitleStrategy } from './services/seo-title.strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions(),
      withInMemoryScrolling({ anchorScrolling: 'enabled' })
    ),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: TitleStrategy, useClass: SeoTitleStrategy }
  ]
};
