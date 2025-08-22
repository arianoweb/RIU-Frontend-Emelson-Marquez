import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-global-loading',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    @if (loadingService.isLoading()) {
      <div class="loading-overlay">
        <mat-spinner diameter="80"></mat-spinner>
      </div>
    }
  `,
  styles: [`
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      //z-index: 1000;
      backdrop-filter: blur(2px);
    }

    mat-spinner {
      --mdc-circular-progress-active-indicator-color: var(--text-primary);
      ::ng-deep .mdc-circular-progress__determinate-circle,
      ::ng-deep .mdc-circular-progress__indeterminate-circle-graphic {
        stroke: var(--text-primary) !important;
      }
    }
  `]
})
export class GlobalLoadingComponent {
  loadingService = inject(LoadingService);
}
