import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingService } from '../../services/loading.service';
import { GlobalLoadingComponent } from './global-loading.component';

describe('GlobalLoadingComponent', () => {
  let component: GlobalLoadingComponent;
  let fixture: ComponentFixture<GlobalLoadingComponent>;
  let mockLoadingService: jasmine.SpyObj<LoadingService>;

  beforeEach(async () => {
    mockLoadingService = jasmine.createSpyObj('LoadingService', ['show', 'hide'], {
      isLoading: jasmine.createSpy('isLoading').and.returnValue(false)
    });

    await TestBed.configureTestingModule({
      imports: [GlobalLoadingComponent],
      providers: [
        { provide: LoadingService, useValue: mockLoadingService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GlobalLoadingComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should inject LoadingService correctly', () => {
    expect(component.loadingService).toBe(mockLoadingService);
  });

  it('should not show loading overlay when isLoading is false', () => {
    mockLoadingService.isLoading.and.returnValue(false);
    fixture.detectChanges();
    
    const loadingOverlay = fixture.nativeElement.querySelector('.loading-overlay');
    expect(loadingOverlay).toBeNull();
  });

  it('should show loading overlay when isLoading is true', () => {
    mockLoadingService.isLoading.and.returnValue(true);
    fixture.detectChanges();
    
    const loadingOverlay = fixture.nativeElement.querySelector('.loading-overlay');
    expect(loadingOverlay).toBeTruthy();
  });

  it('should show spinner when loading overlay is visible', () => {
    mockLoadingService.isLoading.and.returnValue(true);
    fixture.detectChanges();
    
    const spinner = fixture.nativeElement.querySelector('mat-spinner');
    expect(spinner).toBeTruthy();
    expect(spinner.getAttribute('diameter')).toBe('80');
  });

  it('should hide loading overlay when isLoading changes from true to false', () => {
    mockLoadingService.isLoading.and.returnValue(true);
    fixture.detectChanges();
    
    let loadingOverlay = fixture.nativeElement.querySelector('.loading-overlay');
    expect(loadingOverlay).toBeTruthy();
    
    mockLoadingService.isLoading.and.returnValue(false);
    fixture.detectChanges();
    
    loadingOverlay = fixture.nativeElement.querySelector('.loading-overlay');
    expect(loadingOverlay).toBeNull();
  });
});
