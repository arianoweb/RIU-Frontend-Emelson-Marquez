import { TranslateService } from '@ngx-translate/core';

export class ImageUtil {
  private static cache = new Map<string, string>();

  static generateDefaultImage(heroName: string, translateService: TranslateService): string {
    const name = heroName || translateService.instant('heroes.newHero');
    
    if (this.cache.has(name)) {
      return this.cache.get(name)!;
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.fillStyle = '#141414';
      ctx.fillRect(0, 0, 400, 400);
      
      ctx.fillStyle = '#CCCCCC';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(name, 200, 200);
    }
    
    const dataUrl = canvas.toDataURL();
    this.cache.set(name, dataUrl);
    return dataUrl;
  }

  static validateImageUrl(
    imageUrl: string, 
    heroName: string, 
    translateService: TranslateService,
    onSuccess: (url: string) => void,
    onError: (defaultImg: string) => void,
    onLoading?: () => void
  ): void {
    const img = new Image();
    
    if (onLoading) onLoading();
    
    const timeoutId = setTimeout(() => {
      const defaultImg = this.generateDefaultImage(heroName, translateService);
      onError(defaultImg);
    }, 5000);
    
    img.onload = () => {
      clearTimeout(timeoutId);
      onSuccess(imageUrl);
    };
    
    img.onerror = () => {
      clearTimeout(timeoutId);
      const defaultImg = this.generateDefaultImage(heroName, translateService);
      onError(defaultImg);
    };
    
    img.src = imageUrl;
  }

  static clearCacheIfNeeded(threshold: number = 10): void {
    if (this.cache.size > threshold) {
      this.cache.clear();
    }
  }

  static getImageSrcForHero(hero: { imageUrl?: string; name: string }, translateService: TranslateService): string {
    if (!hero.imageUrl || !hero.imageUrl.trim()) {
      return this.generateDefaultImage(hero.name, translateService);
    }
    return hero.imageUrl;
  }
}
