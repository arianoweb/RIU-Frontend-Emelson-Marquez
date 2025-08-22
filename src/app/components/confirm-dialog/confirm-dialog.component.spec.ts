import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<ConfirmDialogComponent>>;
  let mockData: ConfirmDialogData;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockTranslateService = jasmine.createSpyObj('TranslateService', ['instant', 'get']);
    mockTranslateService.instant.and.returnValue('translated text');
    
    mockData = {
      title: 'Test Title',
      message: 'Test Message',
      confirmText: 'Confirm',
      cancelText: 'Cancel'
    };

    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockData },
        { provide: TranslateService, useValue: mockTranslateService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should inject dialog data correctly', () => {
    expect(component.data).toBe(mockData);
    expect(component.data.title).toBe('Test Title');
    expect(component.data.message).toBe('Test Message');
  });

  it('should display dialog data in template', () => {
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('Test Title');
    expect(compiled.textContent).toContain('Test Message');
  });

  describe('onConfirm', () => {
    it('should close dialog with true when onConfirm is called', () => {
      component.onConfirm();
      expect(mockDialogRef.close).toHaveBeenCalledWith(true);
    });

    it('should call onConfirm when confirm button is clicked', () => {
      spyOn(component, 'onConfirm');
      fixture.detectChanges();
      
      const confirmButton = fixture.nativeElement.querySelector('.confirm-button');
      confirmButton?.click();
      
      expect(component.onConfirm).toHaveBeenCalled();
    });
  });

  describe('onCancel', () => {
    it('should close dialog with false when onCancel is called', () => {
      component.onCancel();
      expect(mockDialogRef.close).toHaveBeenCalledWith(false);
    });

    it('should call onCancel when cancel button is clicked', () => {
      spyOn(component, 'onCancel');
      fixture.detectChanges();
      
      const cancelButton = fixture.nativeElement.querySelector('.cancel-button');
      cancelButton?.click();
      
      expect(component.onCancel).toHaveBeenCalled();
    });
  });

  describe('dialog data variations', () => {
    it('should handle dialog data without optional texts', () => {
      expect(component.data.title).toBe('Test Title');
      expect(component.data.message).toBe('Test Message');
      expect(component.data.confirmText).toBe('Confirm');
      expect(component.data.cancelText).toBe('Cancel');
    });

    it('should work with minimal dialog data', () => {
      expect(component.data).toBeDefined();
      expect(typeof component.data.title).toBe('string');
      expect(typeof component.data.message).toBe('string');
    });
  });

  it('should have correct host styles', () => {
    const hostElement = fixture.debugElement.nativeElement;
    const computedStyle = window.getComputedStyle(hostElement);
    
    expect(computedStyle.display).toBe('block');
    expect(computedStyle.borderRadius).toBe('8px');
  });
});