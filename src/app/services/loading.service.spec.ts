import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with loading false', () => {
    expect(service.isLoading()).toBe(false);
  });

  it('should show loading when show() is called', () => {
    service.show();
    expect(service.isLoading()).toBe(true);
  });

  it('should hide loading when hide() is called', () => {
    service.show();
    expect(service.isLoading()).toBe(true);
    
    service.hide();
    expect(service.isLoading()).toBe(false);
  });

  it('should handle multiple show/hide calls correctly', () => {
    service.show();
    service.show();
    expect(service.isLoading()).toBe(true);
    
    service.hide();
    expect(service.isLoading()).toBe(false);
    
    service.hide();
    expect(service.isLoading()).toBe(false);
  });
});
