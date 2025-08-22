import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PaginationService } from './pagination.service';

import { HttpRequest } from '../utils/http-simulator.util';
import { HeroUniverse } from '../enums/hero.enum';

export interface Hero {
  id: number;
  name: string;
  realName: string;
  description: string;
  powers: string[];
  imageUrl: string;
  universe: HeroUniverse;
}

export interface HeroesData {
  heroes: Hero[];
}

@Injectable({
  providedIn: 'root'
})
export class HeroService {
  // Inyección de dependencias
  private http = inject(HttpClient);
  private paginationService = inject(PaginationService);

  // Signals para manejar el estado
  private _heroes = signal<Hero[]>([]);


  // Señales públicas (readonly)
  readonly heroes = this._heroes.asReadonly();

  readonly paginatedHeroes = this.paginationService.createPaginatedSignal(() => this.heroes());

  constructor() {
    HttpRequest.configure(this.http);
    this.loadHeroesFromJSON();
  }

  private loadHeroesFromJSON(): void {
    this.http.get<HeroesData>('assets/data/heroes.json').subscribe({
      next: (data) => {
        this._heroes.set(data.heroes);
      },
      error: (error) => {
        console.error('Error loading heroes data:', error);
        this._heroes.set([]);
      }
    });
  }

  getAllHeroes(): Hero[] {
    return this.heroes();
  }

  getHeroById(id: number): Hero | null {
    return this.heroes().find(h => h.id === id) || null;
  }

  addHero(heroData: Omit<Hero, 'id'>): void {
    HttpRequest.fromPost('/api/heroes', heroData, () => {
      const currentHeroes = this.heroes();
      const newId = this.getNextId();
      const newHero: Hero = { ...heroData, id: newId };
      
      this._heroes.set([...currentHeroes, newHero]);
    });
  }

  updateHero(id: number, heroData: Partial<Omit<Hero, 'id'>>): void {
    HttpRequest.fromPut(`/api/heroes/${id}`, heroData, () => {
      const currentHeroes = this.heroes();
      const heroIndex = currentHeroes.findIndex(h => h.id === id);
      
      if (heroIndex === -1) {
        console.warn('Hero not found');
        return;
      }

      const updatedHero = { ...currentHeroes[heroIndex], ...heroData };
      const updatedHeroes = [...currentHeroes];
      updatedHeroes[heroIndex] = updatedHero;
      
      this._heroes.set(updatedHeroes);
    });
  }

  deleteHero(id: number): void {
    HttpRequest.fromDelete(`/api/heroes/${id}`, () => {
      const currentHeroes = this.heroes();
      const heroIndex = currentHeroes.findIndex(h => h.id === id);
      
      if (heroIndex === -1) {
        console.warn('Hero not found');
        return;
      }

      const filteredHeroes = currentHeroes.filter(h => h.id !== id);
      this._heroes.set(filteredHeroes);
    });
  }

  heroExists(id: number): boolean {
    return this.heroes().some(h => h.id === id);
  }


  private getNextId(): number {
    const currentHeroes = this.heroes();
    if (currentHeroes.length === 0) return 1;
    
    const maxId = Math.max(...currentHeroes.map(h => h.id));
    return maxId + 1;
  }
}
