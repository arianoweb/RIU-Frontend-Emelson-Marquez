import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { heroApiInterceptor } from './app/interceptors/hero-api.interceptor';



bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([heroApiInterceptor])),
    importProvidersFrom(
      BrowserAnimationsModule,
      TranslateModule.forRoot({
        defaultLanguage: 'es'
      })
    )
  ]
}).catch(err => console.error(err));
