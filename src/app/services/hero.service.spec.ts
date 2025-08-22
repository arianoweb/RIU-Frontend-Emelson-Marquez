import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { HeroService, Hero, HeroesData } from './hero.service';
import { PaginationService } from './pagination.service';
import { HeroUniverse } from '../enums/hero.enum';

describe('HeroService', () => {
  let service: HeroService;
  let httpTestingController: HttpTestingController;
  let mockPaginationService: jasmine.SpyObj<PaginationService>;

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

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PaginationService, useValue: mockPaginationService }
      ]
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(HeroService);
  });

  afterEach(() => {
    const pendingRequests = httpTestingController.match(() => true);
    pendingRequests.forEach(req => req.flush({ heroes: [] }));
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load heroes from JSON on initialization', () => {
    const req = httpTestingController.expectOne('assets/data/heroes.json');
    expect(req.request.method).toBe('GET');
    
    req.flush(mockHeroesData);
    expect(service.heroes()).toEqual(mockHeroesData.heroes);
  });

  it('should handle error when loading heroes from JSON', () => {
    const req = httpTestingController.expectOne('assets/data/heroes.json');
    
    req.error(new ProgressEvent('error'));
    expect(service.heroes()).toEqual([]);
  });

  describe('getAllHeroes', () => {
    it('should return all heroes', () => {
      const req = httpTestingController.expectOne('assets/data/heroes.json');
      req.flush(mockHeroesData);

      const heroes = service.getAllHeroes();
      expect(heroes).toEqual(mockHeroesData.heroes);
    });
  });

  describe('getHeroById', () => {
    beforeEach(() => {
      const req = httpTestingController.expectOne('assets/data/heroes.json');
      req.flush(mockHeroesData);
    });

    it('should return hero when found', () => {
      const hero = service.getHeroById(1);
      expect(hero).toEqual(mockHeroesData.heroes[0]);
    });

    it('should return null when hero not found', () => {
      const hero = service.getHeroById(999);
      expect(hero).toBeNull();
    });
  });

  describe('addHero', () => {
    beforeEach(() => {
      const req = httpTestingController.expectOne('assets/data/heroes.json');
      req.flush(mockHeroesData);
    });

    it('should add a new hero', () => {
      const newHeroData = {
        name: "Batman",
        realName: "Bruce Wayne",
        description: "The Dark Knight",
        powers: ["Intelligence", "Combat skills"],
        imageUrl: "https://example.com/batman.jpg",
        universe: HeroUniverse.DC
      };

      service.addHero(newHeroData);

      const req = httpTestingController.expectOne('/api/heroes');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newHeroData);
      
      req.flush({ success: true });

      const heroes = service.heroes();
      expect(heroes.length).toBe(3);
      expect(heroes[2].name).toBe('Batman');
      expect(heroes[2].id).toBe(3);
    });
  });

  describe('updateHero', () => {
    beforeEach(() => {
      const req = httpTestingController.expectOne('assets/data/heroes.json');
      req.flush(mockHeroesData);
    });

    it('should update an existing hero', () => {
      const updateData = { name: "Superman Updated" };
      
      service.updateHero(1, updateData);

      const req = httpTestingController.expectOne('/api/heroes/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateData);
      
      req.flush({ success: true });

      const hero = service.getHeroById(1);
      expect(hero?.name).toBe('Superman Updated');
    });

    it('should warn when trying to update non-existent hero', () => {
      spyOn(console, 'warn');
      
      service.updateHero(999, { name: "Not Found" });

      const req = httpTestingController.expectOne('/api/heroes/999');
      req.flush({ success: true });

      expect(console.warn).toHaveBeenCalledWith('Hero not found');
    });
  });

  describe('deleteHero', () => {
    beforeEach(() => {
      const req = httpTestingController.expectOne('assets/data/heroes.json');
      req.flush(mockHeroesData);
    });

    it('should delete an existing hero', () => {
      service.deleteHero(1);

      const req = httpTestingController.expectOne('/api/heroes/1');
      expect(req.request.method).toBe('DELETE');
      
      req.flush({ success: true });

      const heroes = service.heroes();
      expect(heroes.length).toBe(1);
      expect(heroes.find(h => h.id === 1)).toBeUndefined();
    });

    it('should warn when trying to delete non-existent hero', () => {
      spyOn(console, 'warn');
      
      service.deleteHero(999);

      const req = httpTestingController.expectOne('/api/heroes/999');
      req.flush({ success: true });

      expect(console.warn).toHaveBeenCalledWith('Hero not found');
    });
  });

  describe('heroExists', () => {
    beforeEach(() => {
      const req = httpTestingController.expectOne('assets/data/heroes.json');
      req.flush(mockHeroesData);
    });

    it('should return true when hero exists', () => {
      expect(service.heroExists(1)).toBeTruthy();
    });

    it('should return false when hero does not exist', () => {
      expect(service.heroExists(999)).toBeFalsy();
    });
  });

  describe('getNextId', () => {
    it('should return 1 when no heroes exist', () => {
      const req = httpTestingController.expectOne('assets/data/heroes.json');
      req.flush({ heroes: [] });

      const newHeroData = {
        name: "First Hero",
        realName: "First Real",
        description: "First description",
        powers: ["First power"],
        imageUrl: "https://example.com/first.jpg",
        universe: HeroUniverse.DC
      };

      service.addHero(newHeroData);

      const addReq = httpTestingController.expectOne('/api/heroes');
      addReq.flush({ success: true });

      const heroes = service.heroes();
      expect(heroes[0].id).toBe(1);
    });

    it('should generate next id correctly', () => {
      const req = httpTestingController.expectOne('assets/data/heroes.json');
      req.flush(mockHeroesData);

      const newHeroData = {
        name: "Third Hero",
        realName: "Third Real",
        description: "Third description",
        powers: ["Third power"],
        imageUrl: "https://example.com/third.jpg",
        universe: HeroUniverse.DC
      };

      service.addHero(newHeroData);

      const addReq = httpTestingController.expectOne('/api/heroes');
      addReq.flush({ success: true });

      const heroes = service.heroes();
      expect(heroes[2].id).toBe(3);
    });
  });

  describe('paginatedHeroes', () => {
    it('should create paginated signal', () => {
      const req = httpTestingController.expectOne('assets/data/heroes.json');
      req.flush(mockHeroesData);

      expect(mockPaginationService.createPaginatedSignal).toHaveBeenCalled();
      expect(service.paginatedHeroes).toBeDefined();
    });
  });
});