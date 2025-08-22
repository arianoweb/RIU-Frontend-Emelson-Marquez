import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { Component } from '@angular/core';

import { HeroListComponent } from './hero-list.component';
import { HeroService, Hero } from '../../services/hero.service';
import { PaginationService } from '../../services/pagination.service';
import { LoadingService } from '../../services/loading.service';
import { HeroUniverse } from '../../enums/hero.enum';
import { ImageUtil } from '../../utils/image.util';

@Component({
  selector: 'app-test-hero-list',
  template: '<div></div>',
  standalone: true
})
class TestHeroListComponent extends HeroListComponent {}

describe('HeroListComponent', () => {
  let component: TestHeroListComponent;
  let fixture: ComponentFixture<TestHeroListComponent>;
  let mocks: {
    heroService: jasmine.SpyObj<HeroService>;
    paginationService: jasmine.SpyObj<PaginationService>;
    translateService: jasmine.SpyObj<TranslateService>;
    loadingService: jasmine.SpyObj<LoadingService>;
    router: jasmine.SpyObj<Router>;
    activatedRoute: any;
    dialog: jasmine.SpyObj<MatDialog>;
    snackBar: jasmine.SpyObj<MatSnackBar>;
  };

  const mockHeroes: Hero[] = [
    {
      id: 1,
      name: 'Superman',
      realName: 'Clark Kent',
      description: 'Man of Steel',
      powers: ['Flight', 'Super Strength'],
      imageUrl: 'https://example.com/superman.jpg',
      universe: HeroUniverse.DC
    },
    {
      id: 2,
      name: 'Spider-Man',
      realName: 'Peter Parker',
      description: 'Your friendly neighborhood Spider-Man',
      powers: ['Web Slinging', 'Spider Sense'],
      imageUrl: 'https://example.com/spiderman.jpg',
      universe: HeroUniverse.Marvel
    }
  ];

  const setupValidForm = () => {
    component.heroForm.patchValue({
      name: 'Test Hero',
      realName: 'Test Real Name',
      description: 'Valid description with enough length',
      universe: HeroUniverse.DC,
      imageUrl: 'https://example.com/test.jpg'
    });
    component.addPower({ value: 'Test Power', chipInput: { clear: () => {} } });
  };

  const expectTranslateCall = (key: string) => {
    expect(mocks.translateService.instant).toHaveBeenCalledWith(key, jasmine.any(Object));
  };

  beforeEach(async () => {
    mocks = {
      heroService: jasmine.createSpyObj('HeroService', ['addHero', 'updateHero', 'deleteHero', 'getHeroById'], {
        heroes: jasmine.createSpy('heroes').and.returnValue(mockHeroes)
      }),
      paginationService: jasmine.createSpyObj('PaginationService', ['setConfig', 'resetToFirstPage', 'paginate'], {
        paginate: jasmine.createSpy('paginate').and.returnValue({
          data: mockHeroes,
          total: 2,
          currentPage: 1,
          pageSize: 5,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false
        })
      }),
      translateService: jasmine.createSpyObj('TranslateService', ['instant', 'get']),
      loadingService: jasmine.createSpyObj('LoadingService', ['show', 'hide'], {
        isLoading: jasmine.createSpy('isLoading').and.returnValue(false)
      }),
      router: jasmine.createSpyObj('Router', ['navigate']),
      activatedRoute: {
        paramMap: of(new Map()),
        snapshot: {
          url: [{ path: 'heroes' }],
          paramMap: {
            get: jasmine.createSpy('get').and.returnValue(null)
          }
        }
      },
      dialog: jasmine.createSpyObj('MatDialog', ['open']),
      snackBar: jasmine.createSpyObj('MatSnackBar', ['open'])
    };

    mocks.translateService.instant.and.returnValue('translated text');
    mocks.translateService.get.and.returnValue(of('translated text'));
    Object.defineProperty(mocks.router, 'url', { writable: true, value: '/heroes' });

    await TestBed.configureTestingModule({
      imports: [TestHeroListComponent, ReactiveFormsModule, NoopAnimationsModule],
      providers: [
        FormBuilder,
        { provide: HeroService, useValue: mocks.heroService },
        { provide: PaginationService, useValue: mocks.paginationService },
        { provide: TranslateService, useValue: mocks.translateService },
        { provide: LoadingService, useValue: mocks.loadingService },
        { provide: Router, useValue: mocks.router },
        { provide: ActivatedRoute, useValue: mocks.activatedRoute },
        { provide: MatDialog, useValue: mocks.dialog },
        { provide: MatSnackBar, useValue: mocks.snackBar }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHeroListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize correctly', () => {
      const formControls = ['name', 'realName', 'description', 'imageUrl', 'universe', 'powers', 'powerInput'];
      formControls.forEach(control => expect(component.heroForm.get(control)).toBeTruthy());
      
      expect(component.filterText()).toBe('');
      expect(component.isFormVisible()).toBe(false);
      expect(component.isEditing()).toBe(false);
      expect(component.selectedHero()).toBeNull();
      expect(component.imageError()).toBeNull();
    });

    it('should set pagination config on init', () => {
      component.ngOnInit();
      expect(mocks.paginationService.setConfig).toHaveBeenCalledWith(1, 5);
    });
  });

  describe('Basic Operations', () => {
    it('should handle filter and pagination changes', () => {
      expect(component.powerInputControl).toBe(component.heroForm.get('powerInput'));
      
      const result = component.getHeroCountText();
      expect(mocks.translateService.instant).toHaveBeenCalledWith('heroes.heroCount');
      expect(result).toBe('2 translated text');
      
      component.onFilterChange({ target: { value: 'superman' } } as any);
      expect(component.filterText()).toBe('superman');
      expect(mocks.paginationService.resetToFirstPage).toHaveBeenCalled();
      
      component.onPageChange({ pageIndex: 1, pageSize: 10 } as any);
      expect(mocks.paginationService.setConfig).toHaveBeenCalledWith(2, 10);
    });
  });

  describe('Form Display', () => {
    it('should handle add form correctly', () => {
      component.showAddForm();
      
      expect(component.isEditing()).toBe(false);
      expect(component.selectedHero()).toBeNull();
      expect(component.isFormVisible()).toBe(true);
      expect(component.imageError()).toBeNull();
      expect(mocks.router.navigate).toHaveBeenCalledWith(['/heroes/new']);
    });

    it('should handle edit form correctly', () => {
      const hero = mockHeroes[0];
      component.showEditForm(hero);
      
      expect(component.isEditing()).toBe(true);
      expect(component.selectedHero()).toBe(hero);
      expect(component.isFormVisible()).toBe(true);
      expect(component.heroForm.get('name')?.value).toBe(hero.name);
      expect(component.heroForm.get('realName')?.value).toBe(hero.realName);
      expect(mocks.router.navigate).toHaveBeenCalledWith(['/heroes/edit', hero.id]);
    });
  });

  describe('Power Management', () => {
    it('should handle powers correctly', () => {
      expect(component.powersArray.constructor.name).toBe('FormArray');
      
      const chipEvent = { value: 'Super Speed', chipInput: { clear: jasmine.createSpy('clear') } };
      component.addPower(chipEvent);
      expect(component.powersArray.length).toBe(1);
      expect(component.powersArray.at(0).value).toBe('Super Speed');
      expect(chipEvent.chipInput.clear).toHaveBeenCalled();
      
      component.powerInputControl?.setValue('Flight');
      component.addPower();
      expect(component.powersArray.length).toBe(2);
      expect(component.powersArray.at(1).value).toBe('Flight');
      expect(component.powerInputControl?.value).toBe('');
      
      component.addPower({ value: 'Flight', chipInput: { clear: () => {} } });
      expect(component.powersArray.length).toBe(2);
      
      component.addPower({ value: '', chipInput: { clear: () => {} } });
      expect(component.powersArray.length).toBe(2);
      
      component.removePower(0);
      expect(component.powersArray.length).toBe(1);
      expect(component.powersArray.at(0).value).toBe('Flight');
    });
  });

  describe('Form Submission', () => {
    it('should handle form submission correctly', () => {
      setupValidForm();
      
      component.isEditing.set(false);
      component.onSubmit();
      expect(mocks.heroService.addHero).toHaveBeenCalled();
      
      setupValidForm();
      component.isEditing.set(true);
      component.selectedHero.set(mockHeroes[0]);
      component.onSubmit();
      expect(mocks.heroService.updateHero).toHaveBeenCalledWith(1, jasmine.any(Object));
      
      component.powersArray.clear();
      component.onSubmit();
      expect(mocks.snackBar.open).toHaveBeenCalled();
      
      component.heroForm.patchValue({ name: '' });
      component.onSubmit();
      expect(mocks.heroService.addHero).toHaveBeenCalledTimes(1);
    });
  });

  describe('Form Actions', () => {
    it('should handle cancel and delete actions', () => {
      component.isFormVisible.set(true);
      component.isEditing.set(true);
      component.selectedHero.set(mockHeroes[0]);
      
      component.cancelForm();
      expect(component.isFormVisible()).toBe(false);
      expect(component.isEditing()).toBe(false);
      expect(component.selectedHero()).toBeNull();
      expect(mocks.router.navigate).toHaveBeenCalledWith(['/heroes']);
      
      const mockDialogRef = { afterClosed: () => of(true) };
      mocks.dialog.open.and.returnValue(mockDialogRef as any);
      component.deleteHero(mockHeroes[0]);
      expect(mocks.dialog.open).toHaveBeenCalled();
      expect(mocks.heroService.deleteHero).toHaveBeenCalledWith(1);
      
      component.openSnackBar('test.message', 'test.action');
      expect(mocks.translateService.instant).toHaveBeenCalledWith('test.message');
      expect(mocks.translateService.instant).toHaveBeenCalledWith('test.action');
      expect(mocks.snackBar.open).toHaveBeenCalled();
    });
  });

  describe('Utilities', () => {
    it('should handle images, validation, and hero loading', () => {
      component.onImageError();
      expect(component.imageError()).toBe('error');
      
      component.imageError.set('error');
      component.onImageLoad();
      expect(component.imageError()).toBeNull();
      
      const result = component.getImageSrc(mockHeroes[0]);
      expect(typeof result).toBe('string');
      
      const mockEvent = { target: { src: '' } };
      component.onTableImageError(mockEvent, mockHeroes[0]);
      expect(typeof mockEvent.target.src).toBe('string');
      
      const nameControl = component.heroForm.get('name');
      nameControl?.markAsTouched();
      nameControl?.setValue('');
      const errorMessage = component.getErrorMessage('name');
      expect(typeof errorMessage).toBe('string');
      expectTranslateCall('form.errors.required');
      
      nameControl?.setValue('Valid Name');
      expect(component.getErrorMessage('name')).toBe('');
      
      component.heroForm.patchValue({
        imageUrl: 'https://example.com/image.jpg',
        name: 'Test Hero'
      });
      component.onImageUrlBlur();
      expect(component.imageError()).toBe('loading');
      
      mocks.heroService.heroes.and.returnValue(mockHeroes);
      component.loadHeroForEdit('1');
      expect(component.isEditing()).toBe(true);
      expect(component.selectedHero()).toBe(mockHeroes[0]);
      
      mocks.heroService.heroes.and.returnValue([]);
      component.loadHeroForEdit('999');
      expect(mocks.router.navigate).toHaveBeenCalledWith(['/heroes']);
    });
  });

  describe('Routing Logic', () => {
    it('should handle different URL routes correctly', () => {
      spyOn(component, 'showAddForm');
      spyOn(component, 'loadHeroForEdit');
      
      mocks.activatedRoute.snapshot.url = [{ path: 'heroes' }, { path: 'new' }];
      component.ngOnInit();
      expect(component.showAddForm).toHaveBeenCalled();
      
      component.heroId = '123';
      mocks.activatedRoute.snapshot.url = [{ path: 'heroes' }, { path: 'edit' }, { path: '123' }];
      component.ngOnInit();
      expect(component.loadHeroForEdit).toHaveBeenCalledWith('123');
      
      component.heroId = '';
      mocks.activatedRoute.snapshot.url = [{ path: 'heroes' }, { path: 'edit' }];
      (component.loadHeroForEdit as jasmine.Spy).calls.reset();
      component.ngOnInit();
      expect(component.loadHeroForEdit).not.toHaveBeenCalled();
    });
  });

  describe('Advanced Scenarios', () => {
    it('should handle complex form and image scenarios', () => {
      spyOn(ImageUtil, 'generateDefaultImage').and.returnValue('default-image');
      
      const heroWithImage = { ...mockHeroes[0], imageUrl: 'https://example.com/image.jpg' };
      component.showEditForm(heroWithImage);
      expect(component.imageError()).toBe('loading');
      expect(component.formImageSrc()).toBe('https://example.com/image.jpg');
      
      const heroWithoutImage = { ...mockHeroes[0], imageUrl: '' };
      component.showEditForm(heroWithoutImage);
      expect(ImageUtil.generateDefaultImage).toHaveBeenCalledWith(heroWithoutImage.name, mocks.translateService);
      expect(component.formImageSrc()).toBe('default-image');
      
      const heroWithWhitespace = { ...mockHeroes[0], imageUrl: '   ' };
      component.showEditForm(heroWithWhitespace);
      expect(ImageUtil.generateDefaultImage).toHaveBeenCalled();
      
      (mocks.router as any).url = '/heroes';
      component.showEditForm(mockHeroes[0]);
      expect(mocks.router.navigate).toHaveBeenCalledWith(['/heroes/edit', mockHeroes[0].id]);
      
      (mocks.router as any).url = '/heroes/edit/1';
      mocks.router.navigate.calls.reset();
      component.showEditForm(mockHeroes[0]);
      expect(mocks.router.navigate).not.toHaveBeenCalled();
    });

    it('should handle edge cases and validation branches', () => {
      spyOn(ImageUtil, 'generateDefaultImage').and.returnValue('default-image');
      
      // Test onImageUrlBlur con diferentes escenarios
      component.heroForm.patchValue({ name: 'Test Hero', imageUrl: 'https://valid.com/image.jpg' });
      component.onImageUrlBlur();
      expect(component.imageError()).toBe('loading');
      
      // Test con URL inválida
      component.heroForm.patchValue({ imageUrl: 'invalid-url' });
      component.onImageUrlBlur();
      expect(component.imageError()).toBe('error');
      
      // Test con nombre vacío (usa traducción)
      component.heroForm.patchValue({ name: '', imageUrl: 'invalid-url' });
      component.onImageUrlBlur();
      expect(ImageUtil.generateDefaultImage).toHaveBeenCalledWith('translated text', mocks.translateService);
      
      // Test con imageUrl solo espacios
      component.heroForm.patchValue({ name: 'Test', imageUrl: '   ' });
      component.onImageUrlBlur();
      expect(component.imageError()).toBeNull();
      
      // Test showAddForm cuando ya está en ruta new
      (mocks.router as any).url = '/heroes/new';
      mocks.router.navigate.calls.reset();
      component.showAddForm();
      expect(mocks.router.navigate).not.toHaveBeenCalled();
      
      // Test addPower con control null (simulando que no existe el control)
      const originalPowerInput = component.heroForm.get('powerInput');
      component.heroForm.removeControl('powerInput');
      component.addPower();
      expect(component.powersArray.length).toBe(0);
      
      // Restaurar control
      component.heroForm.addControl('powerInput', originalPowerInput!);
    });

    it('should handle all getErrorMessage validation types', () => {
      const testCases = [
        { field: 'name', value: '', error: 'required' },
        { field: 'name', value: 'a', error: 'minLength' },
        { field: 'name', value: 'a'.repeat(51), error: 'maxLength' },
        { field: 'imageUrl', value: 'invalid-url', error: 'invalidFormat' }
      ];
      
      testCases.forEach(testCase => {
        const control = component.heroForm.get(testCase.field);
        control?.setValue(testCase.value);
        control?.markAsTouched();
        control?.updateValueAndValidity();
        
        const result = component.getErrorMessage(testCase.field);
        expect(result).toBe('translated text');
        expect(mocks.translateService.instant).toHaveBeenCalledWith(
          `form.errors.${testCase.error}`, jasmine.any(Object)
        );
      });
      
      // Test campo no tocado
      const control = component.heroForm.get('name');
      control?.setValue('');
      control?.markAsUntouched();
      control?.updateValueAndValidity();
      
      const result = component.getErrorMessage('name');
      expect(result).toBe('');
      
      // Test campo sin errores
      control?.setValue('Valid Name');
      control?.markAsTouched();
      control?.updateValueAndValidity();
      
      const resultValid = component.getErrorMessage('name');
      expect(resultValid).toBe('');
    });

    it('should handle form submission edge cases', () => {
      spyOn(ImageUtil, 'generateDefaultImage').and.returnValue('default-image');
      
      // Test con imageUrl vacía (usa imagen por defecto)
      component.heroForm.patchValue({
        name: 'Test Hero',
        realName: 'Test Real Name',
        description: 'Valid description',
        universe: HeroUniverse.DC,
        imageUrl: ''
      });
      component.addPower({ value: 'Test Power', chipInput: { clear: () => {} } });
      component.isEditing.set(false);
      
      component.onSubmit();
      expect(ImageUtil.generateDefaultImage).toHaveBeenCalledWith('Test Hero', mocks.translateService);
      expect(mocks.heroService.addHero).toHaveBeenCalledWith(jasmine.objectContaining({
        imageUrl: 'default-image'
      }));
      
      // Test edición sin heroId válido
      component.isEditing.set(true);
      component.selectedHero.set({ ...mockHeroes[0], id: undefined as any });
      setupValidForm();
      
      component.onSubmit();
      expect(mocks.heroService.updateHero).not.toHaveBeenCalled();
    });
  });


  describe('Filtering', () => {
    it('should filter heroes correctly', () => {
      component.filterText.set('');
      expect(component.filteredHeroes()).toEqual(mockHeroes);
      
      component.filterText.set('super');
      expect(component.filteredHeroes()).toEqual([mockHeroes[0]]);
      
      component.filterText.set('clark');
      expect(component.filteredHeroes()).toEqual([mockHeroes[0]]);
      
      component.filterText.set('marvel');
      expect(component.filteredHeroes()).toEqual([mockHeroes[1]]);
      
      component.filterText.set('nonexistent');
      expect(component.filteredHeroes()).toEqual([]);
    });
  });
});