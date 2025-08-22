import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { GlobalLoadingComponent } from './components/global-loading/global-loading.component';
import { TranslationService } from './services/translation.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, GlobalLoadingComponent],
  template: `
    <router-outlet></router-outlet>
    <app-global-loading></app-global-loading>
  `,
  styles: []
})
export class AppComponent {
  title = 'superheroes-app';
  private translationService = inject(TranslationService);
}
