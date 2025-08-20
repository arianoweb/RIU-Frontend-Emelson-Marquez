import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { HeroService, Hero, HeroesData } from './hero.service';
import { PaginationService } from './pagination.service';
import { TranslationService } from './translation.service';
import { HttpRequest } from '../utils/http-simulator.util';
import { HeroUniverse } from '../enums/hero.enum';

describe('HeroService', () => {
  let service: HeroService;
  let httpTestingController: HttpTestingController;
  let mockPaginationService: jasmine.SpyObj<PaginationService>;
  let mockTranslationService: jasmine.SpyObj<TranslationService>;

  const mockHeroesData: HeroesData = {
    heroes: [
      {
        id: 1,
        name: "Superman",
        realName: "Clark Kent",
        description: "El Hombre de Acero",
        powers: ["Super fuerza", "Vuelo"],
        imageUrl: "https://example.com/superman.jpg",
        universe: HeroUniverse.DC
      },
      {
        id: 2,
        name: "Spider-Man",
        realName: "Peter Parker",
        description: "Un joven con poderes arácnidos",
        powers: ["Sentido arácnido", "Trepar paredes"],
        imageUrl: "https://example.com/spiderman.jpg",
        universe: HeroUniverse.Marvel
      }
    ]
  };

  const mockPaginatedSignal = jasmine.createSpy('createPaginatedSignal').and.returnValue(() => ({
    data: mockHeroesData.heroes,
    total: 2,
    currentPage: 1,
    pageSize: 5,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false
  }));

  beforeEach(() => {
    mockPaginationService = jasmine.createSpyObj('PaginationService', ['createPaginatedSignal']);
    mockPaginationService.createPaginatedSignal = mockPaginatedSignal;

    mockTranslationService = jasmine.createSpyObj('TranslationService', ['get']);
    mockTranslationService.get.and.returnValue('Error message');

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PaginationService, useValue: mockPaginationService },
        { provide: TranslationService, useValue: mockTranslationService }
      ]
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    
    spyOn(HttpRequest, 'configure');
    spyOn(HttpRequest, 'fromPost');
    spyOn(HttpRequest, 'fromPut');
    spyOn(HttpRequest, 'fromDelete');
    
    service = TestBed.inject(HeroService);
  });

  afterEach(() => {
    const pendingRequests = httpTestingController.match(() => true);
    pendingRequests.forEach(req => req.flush(mockHeroesData));
    httpTestingController.verify();
  });

  it('should be created', () => {
    const req = httpTestingController.expectOne('assets/data/heroes.json');
    req.flush(mockHeroesData);
    
    expect(service).toBeTruthy();
  });

  it('should load heroes from JSON on initialization', () => {
    const req = httpTestingController.expectOne('assets/data/heroes.json');
    expect(req.request.method).toBe('GET');
    
    req.flush(mockHeroesData);
    
    expect(service.heroes()).toEqual(mockHeroesData.heroes);
    expect(service.error()).toBeNull();
  });

  it('should handle error when loading heroes from JSON', () => {
    const req = httpTestingController.expectOne('assets/data/heroes.json');
    
    req.error(new ProgressEvent('error'));
    
    expect(mockTranslationService.get).toHaveBeenCalledWith('heroes.error');
    expect(service.error()).toBe('Error message');
    expect(service.heroes()).toEqual([]);
  });

  it('should get all heroes', () => {
    const req = httpTestingController.expectOne('assets/data/heroes.json');
    req.flush(mockHeroesData);

    const result = service.getAllHeroes();
    
    expect(result).toEqual(mockHeroesData.heroes);
  });

  it('should get hero by id', () => {
    const req = httpTestingController.expectOne('assets/data/heroes.json');
    req.flush(mockHeroesData);

    const hero = service.getHeroById(1);
    
    expect(hero).toEqual(mockHeroesData.heroes[0]);
  });

  it('should return null when hero not found by id', () => {
    const req = httpTestingController.expectOne('assets/data/heroes.json');
    req.flush(mockHeroesData);

    const hero = service.getHeroById(999);
    
    expect(hero).toBeNull();
  });

  it('should add a new hero', () => {
    const req = httpTestingController.expectOne('assets/data/heroes.json');
    req.flush(mockHeroesData);

    const newHeroData = {
      name: "Batman",
      realName: "Bruce Wayne",
      description: "El Caballero de la Noche",
      powers: ["Artes marciales", "Inteligencia"],
      imageUrl: "https://example.com/batman.jpg",
      universe: HeroUniverse.DC
    };

    service.addHero(newHeroData);

    expect(HttpRequest.fromPost).toHaveBeenCalledWith(
      '/api/heroes',
      newHeroData,
      jasmine.any(Function)
    );

    const callback = (HttpRequest.fromPost as jasmine.Spy).calls.mostRecent().args[2];
    callback();

    const heroes = service.heroes();
    expect(heroes.length).toBe(3);
    expect(heroes[2]).toEqual({ ...newHeroData, id: 3 });
  });

  it('should update an existing hero', () => {
    const req = httpTestingController.expectOne('assets/data/heroes.json');
    req.flush(mockHeroesData);

    const updateData = { name: "Superman Updated" };

    service.updateHero(1, updateData);

    expect(HttpRequest.fromPut).toHaveBeenCalledWith(
      '/api/heroes/1',
      updateData,
      jasmine.any(Function)
    );

    const callback = (HttpRequest.fromPut as jasmine.Spy).calls.mostRecent().args[2];
    callback();

    const heroes = service.heroes();
    expect(heroes[0].name).toBe("Superman Updated");
  });

  it('should warn when trying to update non-existent hero', () => {
    const req = httpTestingController.expectOne('assets/data/heroes.json');
    req.flush(mockHeroesData);

    spyOn(console, 'warn');
    const updateData = { name: "Non-existent Hero" };

    service.updateHero(999, updateData);

    const callback = (HttpRequest.fromPut as jasmine.Spy).calls.mostRecent().args[2];
    callback();

    expect(console.warn).toHaveBeenCalledWith('Error message');
    expect(mockTranslationService.get).toHaveBeenCalledWith('heroes.notFound');
  });

  it('should delete an existing hero', () => {
    const req = httpTestingController.expectOne('assets/data/heroes.json');
    req.flush(mockHeroesData);

    service.deleteHero(1);

    expect(HttpRequest.fromDelete).toHaveBeenCalledWith(
      '/api/heroes/1',
      jasmine.any(Function)
    );

    const callback = (HttpRequest.fromDelete as jasmine.Spy).calls.mostRecent().args[1];
    callback();

    const heroes = service.heroes();
    expect(heroes.length).toBe(1);
    expect(heroes.find(h => h.id === 1)).toBeUndefined();
  });

  it('should warn when trying to delete non-existent hero', () => {
    const req = httpTestingController.expectOne('assets/data/heroes.json');
    req.flush(mockHeroesData);

    spyOn(console, 'warn');

    service.deleteHero(999);

    const callback = (HttpRequest.fromDelete as jasmine.Spy).calls.mostRecent().args[1];
    callback();

    expect(console.warn).toHaveBeenCalledWith('Error message');
    expect(mockTranslationService.get).toHaveBeenCalledWith('heroes.notFound');
  });

  it('should check if hero exists', () => {
    const req = httpTestingController.expectOne('assets/data/heroes.json');
    req.flush(mockHeroesData);

    expect(service.heroExists(1)).toBeTruthy();
    expect(service.heroExists(999)).toBeFalsy();
  });

  it('should generate next id correctly', () => {
    const req = httpTestingController.expectOne('assets/data/heroes.json');
    req.flush(mockHeroesData);

    const newHeroData = {
      name: "Test Hero",
      realName: "Test Name",
      description: "Test Description",
      powers: ["Test Power"],
      imageUrl: "https://example.com/test.jpg",
      universe: HeroUniverse.Other
    };

    service.addHero(newHeroData);

    const callback = (HttpRequest.fromPost as jasmine.Spy).calls.mostRecent().args[2];
    callback();

    const heroes = service.heroes();
    expect(heroes[heroes.length - 1].id).toBe(3);
  });

  it('should generate id 1 when no heroes exist', () => {
    const req = httpTestingController.expectOne('assets/data/heroes.json');
    req.flush({ heroes: [] });

    const newHeroData = {
      name: "First Hero",
      realName: "First Name",
      description: "First Description",
      powers: ["First Power"],
      imageUrl: "https://example.com/first.jpg",
      universe: HeroUniverse.Marvel
    };

    service.addHero(newHeroData);

    const callback = (HttpRequest.fromPost as jasmine.Spy).calls.mostRecent().args[2];
    callback();

    const heroes = service.heroes();
    expect(heroes[0].id).toBe(1);
  });

  it('should create paginated signal', () => {
    const req = httpTestingController.expectOne('assets/data/heroes.json');
    req.flush(mockHeroesData);

    expect(service.paginatedHeroes).toBeDefined();
    expect(mockPaginationService.createPaginatedSignal).toHaveBeenCalled();
  });
});
