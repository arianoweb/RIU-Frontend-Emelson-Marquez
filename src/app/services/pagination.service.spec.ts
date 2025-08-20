import { TestBed } from '@angular/core/testing';
import { PaginationService, PaginationConfig, PaginatedResult } from './pagination.service';
import { signal } from '@angular/core';

describe('PaginationService', () => {
  let service: PaginationService;

  const mockData = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' },
    { id: 4, name: 'Item 4' },
    { id: 5, name: 'Item 5' },
    { id: 6, name: 'Item 6' },
    { id: 7, name: 'Item 7' },
    { id: 8, name: 'Item 8' }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PaginationService]
    });

    service = TestBed.inject(PaginationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have default configuration', () => {
    const config = service.config();
    
    expect(config.page).toBe(1);
    expect(config.pageSize).toBe(5);
  });

  it('should paginate data correctly', () => {
    const result = service.paginate(mockData);
    
    expect(result.data.length).toBe(5);
    expect(result.data).toEqual(mockData.slice(0, 5));
    expect(result.total).toBe(8);
    expect(result.currentPage).toBe(1);
    expect(result.pageSize).toBe(5);
    expect(result.totalPages).toBe(2);
    expect(result.hasNextPage).toBeTruthy();
    expect(result.hasPreviousPage).toBeFalsy();
  });

  it('should paginate empty data', () => {
    const result = service.paginate([]);
    
    expect(result.data).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.currentPage).toBe(1);
    expect(result.pageSize).toBe(5);
    expect(result.totalPages).toBe(0);
    expect(result.hasNextPage).toBeFalsy();
    expect(result.hasPreviousPage).toBeFalsy();
  });

  it('should paginate second page correctly', () => {
    service.setConfig(2, 5);
    const result = service.paginate(mockData);
    
    expect(result.data.length).toBe(3);
    expect(result.data).toEqual(mockData.slice(5, 8));
    expect(result.currentPage).toBe(2);
    expect(result.hasNextPage).toBeFalsy();
    expect(result.hasPreviousPage).toBeTruthy();
  });

  it('should create paginated signal', () => {
    const dataSignal = signal(mockData);
    const paginatedSignal = service.createPaginatedSignal(() => dataSignal());
    
    const result = paginatedSignal();
    
    expect(result.data.length).toBe(5);
    expect(result.total).toBe(8);
    expect(result.currentPage).toBe(1);
  });

  it('should set config correctly', () => {
    service.setConfig(3, 10);
    const config = service.config();
    
    expect(config.page).toBe(3);
    expect(config.pageSize).toBe(10);
  });

  it('should handle invalid page number in setConfig', () => {
    service.setConfig(0, 10);
    const config = service.config();
    
    expect(config.page).toBe(1);
    expect(config.pageSize).toBe(10);
  });

  it('should handle invalid page size in setConfig', () => {
    service.setConfig(2, 0);
    const config = service.config();
    
    expect(config.page).toBe(2);
    expect(config.pageSize).toBe(5);
  });

  it('should handle negative values in setConfig', () => {
    service.setConfig(-1, -5);
    const config = service.config();
    
    expect(config.page).toBe(1);
    expect(config.pageSize).toBe(5);
  });

  it('should go to next page', () => {
    service.nextPage(3);
    const config = service.config();
    
    expect(config.page).toBe(2);
  });

  it('should not go beyond last page', () => {
    service.setConfig(3, 5);
    service.nextPage(3);
    const config = service.config();
    
    expect(config.page).toBe(3);
  });

  it('should go to previous page', () => {
    service.setConfig(2, 5);
    service.previousPage();
    const config = service.config();
    
    expect(config.page).toBe(1);
  });

  it('should not go below first page', () => {
    service.previousPage();
    const config = service.config();
    
    expect(config.page).toBe(1);
  });

  it('should go to specific page', () => {
    service.goToPage(3, 5);
    const config = service.config();
    
    expect(config.page).toBe(3);
  });

  it('should not go to invalid page number', () => {
    service.goToPage(0, 5);
    const config = service.config();
    
    expect(config.page).toBe(1);
  });

  it('should not go beyond total pages', () => {
    service.goToPage(10, 5);
    const config = service.config();
    
    expect(config.page).toBe(1);
  });

  it('should set page size', () => {
    service.setPageSize(10);
    const config = service.config();
    
    expect(config.page).toBe(1);
    expect(config.pageSize).toBe(10);
  });

  it('should handle invalid page size', () => {
    service.setPageSize(0);
    const config = service.config();
    
    expect(config.pageSize).toBe(5);
  });

  it('should handle negative page size', () => {
    service.setPageSize(-10);
    const config = service.config();
    
    expect(config.pageSize).toBe(5);
  });

  it('should reset to first page', () => {
    service.setConfig(5, 10);
    service.resetToFirstPage();
    const config = service.config();
    
    expect(config.page).toBe(1);
    expect(config.pageSize).toBe(10);
  });

  it('should get current page', () => {
    service.setConfig(3, 5);
    
    expect(service.getCurrentPage()).toBe(3);
  });

  it('should get page size', () => {
    service.setConfig(2, 10);
    
    expect(service.getPageSize()).toBe(10);
  });

  it('should calculate total pages correctly for exact division', () => {
    const exactData = mockData.slice(0, 6);
    service.setConfig(1, 3);
    const result = service.paginate(exactData);
    
    expect(result.totalPages).toBe(2);
  });

  it('should calculate total pages correctly for non-exact division', () => {
    service.setConfig(1, 3);
    const result = service.paginate(mockData);
    
    expect(result.totalPages).toBe(3);
  });

  it('should update paginated signal when data changes', () => {
    const dataSignal = signal(mockData.slice(0, 3));
    const paginatedSignal = service.createPaginatedSignal(() => dataSignal());
    
    let result = paginatedSignal();
    expect(result.total).toBe(3);
    expect(result.data.length).toBe(3);
    
    dataSignal.set(mockData);
    result = paginatedSignal();
    expect(result.total).toBe(8);
    expect(result.data.length).toBe(5);
  });

  it('should handle edge case with single item', () => {
    const singleItem = [{ id: 1, name: 'Single Item' }];
    const result = service.paginate(singleItem);
    
    expect(result.data.length).toBe(1);
    expect(result.total).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.hasNextPage).toBeFalsy();
    expect(result.hasPreviousPage).toBeFalsy();
  });
});
