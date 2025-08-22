import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { TranslationService } from './translation.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('TranslationService', () => {
  let service: TranslationService;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    mockTranslateService = jasmine.createSpyObj('TranslateService', [
      'setTranslation',
      'setDefaultLang',
      'use'
    ], {
      currentLang: 'es'
    });

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TranslateService, useValue: mockTranslateService }
      ]
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(TranslationService);
  });

  afterEach(() => {
    const pendingRequests = httpTestingController.match(() => true);
    pendingRequests.forEach(req => req.flush({}));
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load and initialize translations successfully', async () => {
    const mockTranslations = {
      heroes: { title: 'Gestión de Héroes' },
      actions: { save: 'Guardar' }
    };

    const req = httpTestingController.expectOne('assets/i18n/es.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockTranslations);

    await new Promise(resolve => setTimeout(resolve, 0));

    expect(mockTranslateService.setTranslation).toHaveBeenCalledWith('es', mockTranslations);
    expect(mockTranslateService.setDefaultLang).toHaveBeenCalledWith('es');
    expect(mockTranslateService.use).toHaveBeenCalledWith('es');
  });

  it('should handle translation loading errors gracefully', async () => {
    const req = httpTestingController.expectOne('assets/i18n/es.json');
    req.error(new ErrorEvent('Network error'));

    await new Promise(resolve => setTimeout(resolve, 0));

    expect(mockTranslateService.setDefaultLang).toHaveBeenCalledWith('es');
    expect(mockTranslateService.use).toHaveBeenCalledWith('es');
  });

  it('should initialize translations on service creation', async () => {
    const req = httpTestingController.expectOne('assets/i18n/es.json');
    req.flush({ test: 'data' });
    
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(mockTranslateService.setDefaultLang).toHaveBeenCalledWith('es');
    expect(mockTranslateService.use).toHaveBeenCalledWith('es');
  });
});