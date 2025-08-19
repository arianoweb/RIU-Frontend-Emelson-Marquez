import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="app-container">
      <header class="app-header">
        <h1>🦸‍♂️ Superhéroes App</h1>
        <nav class="app-nav">
          <a routerLink="/heroes" routerLinkActive="active">Lista de Héroes</a>
          <a routerLink="/hero-detail" routerLinkActive="active">Detalle de Héroe</a>
        </nav>
      </header>
      <main class="app-main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .app-header {
      background-color: #1976d2;
      color: white;
      padding: 1rem 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .app-header h1 {
      margin: 0 0 1rem 0;
      font-size: 2rem;
    }
    
    .app-nav {
      display: flex;
      gap: 1rem;
    }
    
    .app-nav a {
      color: white;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: background-color 0.3s;
    }
    
    .app-nav a:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    .app-nav a.active {
      background-color: rgba(255, 255, 255, 0.2);
    }
    
    .app-main {
      flex: 1;
      padding: 2rem;
    }
  `]
})
export class AppComponent {
  title = 'superheroes-app';
}
