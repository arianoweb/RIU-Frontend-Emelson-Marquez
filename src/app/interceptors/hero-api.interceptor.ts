import { HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { of, delay, finalize } from 'rxjs';
import { inject } from '@angular/core';
import { LoadingService } from '../services/loading.service';

export const heroApiInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next) => {
  const loadingService = inject(LoadingService);
  
  if (req.url.includes('/api/heroes')) {
    loadingService.show();
    
    const response = new HttpResponse({
      status: 200,
      statusText: 'OK',
      body: { success: true },
      headers: req.headers
    });
    
    return of(response).pipe(
      delay(800),
      finalize(() => loadingService.hide())
    );
  }
  
  return next(req);
};
