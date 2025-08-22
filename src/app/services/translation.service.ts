import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private translateService = inject(TranslateService);
  private http = inject(HttpClient);

  constructor() {
    this.initializeTranslations();
  }

  private async initializeTranslations(): Promise<void> {
    try {
      const translations = await firstValueFrom(
        this.http.get<any>('assets/i18n/es.json')
      );

      this.translateService.setTranslation('es', translations);
      this.translateService.setDefaultLang('es');
      this.translateService.use('es');
    } catch (error) {
      console.error('Error loading translations:', error);
      this.translateService.setDefaultLang('es');
      this.translateService.use('es');
    }
  }
}