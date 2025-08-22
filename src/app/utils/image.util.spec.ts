import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { ImageUtil } from './image.util';

describe('ImageUtil', () => {
  let mockTranslateService: jasmine.SpyObj<TranslateService>;

  beforeEach(() => {
    mockTranslateService = jasmine.createSpyObj('TranslateService', ['instant']);
    mockTranslateService.instant.and.returnValue('Nuevo Héroe');

    // Clear cache before each test
    (ImageUtil as any).cache.clear();
  });

  describe('generateDefaultImage', () => {
    it('should generate canvas image with hero name', () => {
      const heroName = 'Superman';
      
      const result = ImageUtil.generateDefaultImage(heroName, mockTranslateService);
      
      expect(result).toContain('data:image/png;base64');
      expect(typeof result).toBe('string');
    });

    it('should use translated text when hero name is empty', () => {
      const result = ImageUtil.generateDefaultImage('', mockTranslateService);
      
      expect(mockTranslateService.instant).toHaveBeenCalledWith('heroes.newHero');
      expect(result).toContain('data:image/png;base64');
    });

    it('should use translated text when hero name is null', () => {
      const result = ImageUtil.generateDefaultImage(null as any, mockTranslateService);
      
      expect(mockTranslateService.instant).toHaveBeenCalledWith('heroes.newHero');
      expect(result).toContain('data:image/png;base64');
    });

    it('should cache generated images', () => {
      const heroName = 'Batman';
      
      const result1 = ImageUtil.generateDefaultImage(heroName, mockTranslateService);
      const result2 = ImageUtil.generateDefaultImage(heroName, mockTranslateService);
      
      expect(result1).toBe(result2);
      expect(result1).toContain('data:image/png;base64');
    });

    it('should generate different images for different names', () => {
      const result1 = ImageUtil.generateDefaultImage('Superman', mockTranslateService);
      const result2 = ImageUtil.generateDefaultImage('Batman', mockTranslateService);
      
      expect(result1).not.toBe(result2);
      expect(result1).toContain('data:image/png;base64');
      expect(result2).toContain('data:image/png;base64');
    });
  });

  describe('validateImageUrl', () => {
    let mockOnSuccess: jasmine.Spy;
    let mockOnError: jasmine.Spy;
    let mockOnLoading: jasmine.Spy;

    beforeEach(() => {
      mockOnSuccess = jasmine.createSpy('onSuccess');
      mockOnError = jasmine.createSpy('onError');
      mockOnLoading = jasmine.createSpy('onLoading');
      jasmine.clock().install();
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('should call onLoading when provided', () => {
      ImageUtil.validateImageUrl(
        'https://example.com/image.jpg',
        'Superman',
        mockTranslateService,
        mockOnSuccess,
        mockOnError,
        mockOnLoading
      );

      expect(mockOnLoading).toHaveBeenCalled();
    });

    it('should not call onLoading when not provided', () => {
      ImageUtil.validateImageUrl(
        'https://example.com/image.jpg',
        'Superman',
        mockTranslateService,
        mockOnSuccess,
        mockOnError
      );

      expect(mockOnLoading).not.toHaveBeenCalled();
    });

    it('should call onError when timeout occurs', () => {
      ImageUtil.validateImageUrl(
        'https://example.com/slow-image.jpg',
        'Superman',
        mockTranslateService,
        mockOnSuccess,
        mockOnError
      );

      // Simulate timeout
      jasmine.clock().tick(5001);

      expect(mockOnError).toHaveBeenCalled();
      expect(mockOnError).toHaveBeenCalledWith(jasmine.stringContaining('data:image/png;base64'));
    });

    it('should create a new Image instance', () => {
      spyOn(window, 'Image').and.callThrough();
      
      ImageUtil.validateImageUrl(
        'https://example.com/image.jpg',
        'Superman',
        mockTranslateService,
        mockOnSuccess,
        mockOnError
      );

      expect(window.Image).toHaveBeenCalled();
    });

    it('should generate default image for onError callback', () => {
      spyOn(ImageUtil, 'generateDefaultImage').and.returnValue('mock-default-image');
      
      ImageUtil.validateImageUrl(
        'https://example.com/image.jpg',
        'Superman',
        mockTranslateService,
        mockOnSuccess,
        mockOnError
      );

      // Trigger timeout
      jasmine.clock().tick(5001);

      expect(ImageUtil.generateDefaultImage).toHaveBeenCalledWith('Superman', mockTranslateService);
      expect(mockOnError).toHaveBeenCalledWith('mock-default-image');
    });
  });

  describe('clearCacheIfNeeded', () => {
    it('should clear cache when size exceeds threshold', () => {
      // Fill cache with more than default threshold (10)
      for (let i = 0; i < 12; i++) {
        ImageUtil.generateDefaultImage(`Hero${i}`, mockTranslateService);
      }

      expect((ImageUtil as any).cache.size).toBe(12);

      ImageUtil.clearCacheIfNeeded();

      expect((ImageUtil as any).cache.size).toBe(0);
    });

    it('should not clear cache when size is below threshold', () => {
      // Fill cache with less than default threshold
      for (let i = 0; i < 5; i++) {
        ImageUtil.generateDefaultImage(`Hero${i}`, mockTranslateService);
      }

      expect((ImageUtil as any).cache.size).toBe(5);

      ImageUtil.clearCacheIfNeeded();

      expect((ImageUtil as any).cache.size).toBe(5);
    });

    it('should use custom threshold', () => {
      // Fill cache with 3 items
      for (let i = 0; i < 3; i++) {
        ImageUtil.generateDefaultImage(`Hero${i}`, mockTranslateService);
      }

      expect((ImageUtil as any).cache.size).toBe(3);

      ImageUtil.clearCacheIfNeeded(2);

      expect((ImageUtil as any).cache.size).toBe(0);
    });

    it('should not clear cache when exactly at threshold', () => {
      // Fill cache with exactly threshold items
      for (let i = 0; i < 10; i++) {
        ImageUtil.generateDefaultImage(`Hero${i}`, mockTranslateService);
      }

      expect((ImageUtil as any).cache.size).toBe(10);

      ImageUtil.clearCacheIfNeeded(10);

      expect((ImageUtil as any).cache.size).toBe(10);
    });
  });

  describe('getImageSrcForHero', () => {
    it('should return hero imageUrl when valid', () => {
      const hero = {
        name: 'Superman',
        imageUrl: 'https://example.com/superman.jpg'
      };

      const result = ImageUtil.getImageSrcForHero(hero, mockTranslateService);

      expect(result).toBe(hero.imageUrl);
    });

    it('should return default image when imageUrl is empty', () => {
      const hero = {
        name: 'Superman',
        imageUrl: ''
      };

      const result = ImageUtil.getImageSrcForHero(hero, mockTranslateService);

      expect(result).toContain('data:image/png;base64');
    });

    it('should return default image when imageUrl is whitespace', () => {
      const hero = {
        name: 'Superman',
        imageUrl: '   '
      };

      const result = ImageUtil.getImageSrcForHero(hero, mockTranslateService);

      expect(result).toContain('data:image/png;base64');
    });

    it('should return default image when imageUrl is undefined', () => {
      const hero = {
        name: 'Superman'
      };

      const result = ImageUtil.getImageSrcForHero(hero, mockTranslateService);

      expect(result).toContain('data:image/png;base64');
    });

    it('should use hero name for default image generation', () => {
      const hero = {
        name: 'Wonder Woman',
        imageUrl: ''
      };

      spyOn(ImageUtil, 'generateDefaultImage').and.returnValue('default-image-data');

      ImageUtil.getImageSrcForHero(hero, mockTranslateService);

      expect(ImageUtil.generateDefaultImage).toHaveBeenCalledWith('Wonder Woman', mockTranslateService);
    });
  });

  describe('cache management', () => {
    it('should maintain separate cache entries for different names', () => {
      const result1 = ImageUtil.generateDefaultImage('Hero1', mockTranslateService);
      const result2 = ImageUtil.generateDefaultImage('Hero2', mockTranslateService);
      const result3 = ImageUtil.generateDefaultImage('Hero1', mockTranslateService);

      expect(result1).toBe(result3);
      expect(result1).not.toBe(result2);
      expect((ImageUtil as any).cache.size).toBe(2);
    });

    it('should handle cache operations correctly', () => {
      expect((ImageUtil as any).cache.size).toBe(0);

      ImageUtil.generateDefaultImage('Test Hero', mockTranslateService);
      expect((ImageUtil as any).cache.size).toBe(1);

      ImageUtil.clearCacheIfNeeded(0);
      expect((ImageUtil as any).cache.size).toBe(0);
    });
  });
});
