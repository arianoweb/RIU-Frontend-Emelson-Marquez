import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private translateService = inject(TranslateService);
  private http = inject(HttpClient);

  constructor() {
    this.loadTranslations();
  }

  private loadTranslations(): void {
    this.http.get('/assets/i18n/en.json').subscribe((translations: any) => {
      this.translateService.setTranslation('en', translations);
      this.translateService.use('en');
    });
  }

  get(key: string): string {
    return this.translateService.instant(key);
  }

  setLanguage(language: string): void {
    this.translateService.use(language);
  }

  getCurrentLanguage(): string {
    return this.translateService.currentLang || 'en';
  }
}