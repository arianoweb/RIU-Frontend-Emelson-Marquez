import { TestBed } from '@angular/core/testing';
import { PaginationService, PaginationConfig, PaginatedResult } from './pagination.service';

describe('PaginationService', () => {
  let service: PaginationService;
  let mockData: string[];

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaginationService);
    mockData = ['item1', 'item2', 'item3', 'item4', 'item5', 'item6', 'item7', 'item8'];
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with default config', () => {
    const config = service.config();
    expect(config.page).toBe(1);
    expect(config.pageSize).toBe(5);
  });

  describe('paginate', () => {
    it('should paginate data correctly', () => {
      const result = service.paginate(mockData);
      
      expect(result.data).toEqual(['item1', 'item2', 'item3', 'item4', 'item5']);
      expect(result.total).toBe(8);
      expect(result.currentPage).toBe(1);
      expect(result.pageSize).toBe(5);
      expect(result.totalPages).toBe(2);
      expect(result.hasNextPage).toBe(true);
      expect(result.hasPreviousPage).toBe(false);
    });

    it('should handle empty data', () => {
      const result = service.paginate([]);
      
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
      expect(result.hasNextPage).toBe(false);
      expect(result.hasPreviousPage).toBe(false);
    });

    it('should handle last page correctly', () => {
      service.setConfig(2, 5);
      const result = service.paginate(mockData);
      
      expect(result.data).toEqual(['item6', 'item7', 'item8']);
      expect(result.currentPage).toBe(2);
      expect(result.hasNextPage).toBe(false);
      expect(result.hasPreviousPage).toBe(true);
    });
  });

  describe('setConfig', () => {
    it('should set page and pageSize correctly', () => {
      service.setConfig(3, 10);
      const config = service.config();
      
      expect(config.page).toBe(3);
      expect(config.pageSize).toBe(10);
    });

    it('should handle invalid page values', () => {
      service.setConfig(0, 10);
      expect(service.config().page).toBe(1);
      
      service.setConfig(-1, 10);
      expect(service.config().page).toBe(1);
    });

    it('should handle invalid pageSize values', () => {
      service.setConfig(1, 0);
      expect(service.config().pageSize).toBe(5);
      
      service.setConfig(1, -1);
      expect(service.config().pageSize).toBe(5);
    });
  });

  describe('nextPage', () => {
    it('should go to next page when available', () => {
      service.nextPage(3);
      expect(service.config().page).toBe(2);
    });

    it('should not exceed total pages', () => {
      service.setConfig(3, 5);
      service.nextPage(3);
      expect(service.config().page).toBe(3);
    });
  });

  describe('previousPage', () => {
    it('should go to previous page when available', () => {
      service.setConfig(2, 5);
      service.previousPage();
      expect(service.config().page).toBe(1);
    });

    it('should not go below page 1', () => {
      service.previousPage();
      expect(service.config().page).toBe(1);
    });
  });

  describe('goToPage', () => {
    it('should go to specific page when valid', () => {
      service.goToPage(3, 5);
      expect(service.config().page).toBe(3);
    });

    it('should not go to invalid pages', () => {
      service.goToPage(0, 5);
      expect(service.config().page).toBe(1);
      
      service.goToPage(6, 5);
      expect(service.config().page).toBe(1);
    });
  });

  describe('setPageSize', () => {
    it('should set page size and reset to page 1', () => {
      service.setConfig(3, 5);
      service.setPageSize(10);
      
      expect(service.config().page).toBe(1);
      expect(service.config().pageSize).toBe(10);
    });

    it('should handle invalid page size', () => {
      service.setPageSize(0);
      expect(service.config().pageSize).toBe(5);
    });
  });

  describe('resetToFirstPage', () => {
    it('should reset to page 1', () => {
      service.setConfig(5, 10);
      service.resetToFirstPage();
      
      expect(service.config().page).toBe(1);
      expect(service.config().pageSize).toBe(10);
    });
  });

  describe('getCurrentPage and getPageSize', () => {
    it('should return current page', () => {
      service.setConfig(3, 10);
      expect(service.getCurrentPage()).toBe(3);
    });

    it('should return page size', () => {
      service.setConfig(3, 10);
      expect(service.getPageSize()).toBe(10);
    });
  });

  describe('createPaginatedSignal', () => {
    it('should create a computed signal that paginates data', () => {
      const dataSignal = () => mockData;
      const paginatedSignal = service.createPaginatedSignal(dataSignal);
      
      const result = paginatedSignal();
      expect(result.data).toEqual(['item1', 'item2', 'item3', 'item4', 'item5']);
      expect(result.total).toBe(8);
    });
  });
});