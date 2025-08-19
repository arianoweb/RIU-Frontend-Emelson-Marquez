import { Injectable, signal, computed } from '@angular/core';

// Interfaz para configuración de paginación
export interface PaginationConfig {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PaginationService {

  private _config = signal<PaginationConfig>({ page: 1, pageSize: 5 });
  
  readonly config = this._config.asReadonly();

  paginate<T>(data: T[]): PaginatedResult<T> {
    const config = this.config();
    const total = data.length;
    const totalPages = Math.ceil(total / config.pageSize);
    const startIndex = (config.page - 1) * config.pageSize;
    const endIndex = startIndex + config.pageSize;
    
    return {
      data: data.slice(startIndex, endIndex),
      total,
      currentPage: config.page,
      pageSize: config.pageSize,
      totalPages,
      hasNextPage: config.page < totalPages,
      hasPreviousPage: config.page > 1
    };
  }

  createPaginatedSignal<T>(dataSignal: () => T[]) {
    return computed(() => this.paginate(dataSignal()));
  }

  setConfig(page: number, pageSize: number): void {
    if (page < 1) page = 1;
    if (pageSize < 1) pageSize = 5;
    
    this._config.set({ page, pageSize });
  }

  nextPage(totalPages: number): void {
    const current = this.config();
    
    if (current.page < totalPages) {
      this._config.set({ ...current, page: current.page + 1 });
    }
  }

  previousPage(): void {
    const current = this.config();
    
    if (current.page > 1) {
      this._config.set({ ...current, page: current.page - 1 });
    }
  }

  goToPage(page: number, totalPages: number): void {
    if (page >= 1 && page <= totalPages) {
      const current = this.config();
      this._config.set({ ...current, page });
    }
  }

  setPageSize(pageSize: number): void {
    if (pageSize < 1) pageSize = 5;
    
    this._config.set({ page: 1, pageSize });
  }

  resetToFirstPage(): void {
    const current = this.config();
    this._config.set({ ...current, page: 1 });
  }

  getCurrentPage(): number {
    return this.config().page;
  }

  getPageSize(): number {
    return this.config().pageSize;
  }
}
