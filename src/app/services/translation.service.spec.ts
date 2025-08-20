import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { TranslationService } from './translation.service';

describe('TranslationService', () => {
  let service: TranslationService;
  let httpTestingController: HttpTestingController;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;

  const mockTranslations = 
    {
        "heroes": {
          "noHeroes": "No superheroes available",
          "error": "Error loading superheroes",
          "notFound": "Hero not found",
          "addSuccess": "Hero added successfully",
          "updateSuccess": "Hero updated successfully",
          "deleteSuccess": "Hero deleted successfully",
          "addError": "Error adding hero",
          "updateError": "Error updating hero",
          "deleteError": "Error deleting hero"
        },
        "common": {
          "error": "Error",
          "success": "Success",
          "save": "Save",
          "cancel": "Cancel",
          "delete": "Delete",
          "edit": "Edit",
          "add": "Add",
          "yes": "Yes",
          "no": "No"
        }
      
  };

  beforeEach(() => {
    mockTranslateService = jasmine.createSpyObj('TranslateService', [
      'setTranslation',
      'use',
      'instant'
    ], {
      currentLang: 'en'
    });

    mockTranslateService.instant.and.returnValue('Mocked translation');

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
    pendingRequests.forEach(req => req.flush(mockTranslations));
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load translations on initialization', () => {
    const req = httpTestingController.expectOne('assets/i18n/en.json');
    expect(req.request.method).toBe('GET');
    
    req.flush(mockTranslations);
    
    expect(mockTranslateService.setTranslation).toHaveBeenCalledWith('en', mockTranslations);
    expect(mockTranslateService.use).toHaveBeenCalledWith('en');
  });

  it('should get translation using key', () => {
    const result = service.get('heroes.error');
    
    expect(mockTranslateService.instant).toHaveBeenCalledWith('heroes.error');
    expect(result).toBe('Mocked translation');
  });

  it('should set language', () => {
    service.setLanguage('es');
    
    expect(mockTranslateService.use).toHaveBeenCalledWith('es');
  });

  it('should get current language', () => {
    const result = service.getCurrentLanguage();
    
    expect(result).toBe('en');
  });

  it('should return default language when currentLang is null', () => {
    Object.defineProperty(mockTranslateService, 'currentLang', {
      value: null,
      writable: true
    });

    const result = service.getCurrentLanguage();
    
    expect(result).toBe('en');
  });

  it('should return default language when currentLang is undefined', () => {
    Object.defineProperty(mockTranslateService, 'currentLang', {
      value: undefined,
      writable: true
    });

    const result = service.getCurrentLanguage();
    
    expect(result).toBe('en');
  });
});