import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { signal } from '@angular/core';

// Signal global para el estado de loading
export const globalLoading = signal<boolean>(false);

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  globalLoading.set(true);

  return next(req).pipe(
    finalize(() => {
      globalLoading.set(false);
    })
  );
};
