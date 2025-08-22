import { Component, computed, signal, inject, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators, FormArray, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { HeroService, Hero } from '../../services/hero.service';
import { PaginationService } from '../../services/pagination.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { LoadingService } from '../../services/loading.service';
import { HeroUniverse } from '../../enums/hero.enum';
import { ConfirmDialogComponent, ConfirmDialogData } from '../confirm-dialog/confirm-dialog.component';
import { ImageUtil } from '../../utils/image.util';

@Component({
  selector: 'app-hero-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatRadioModule,
    MatChipsModule,
    MatCardModule,
    MatIconModule,
    MatDialogModule,
    MatPaginatorModule,
    MatTableModule,
    MatSnackBarModule,
    MatTooltipModule,
    TranslateModule
  ],
  templateUrl: './hero-list.component.html',
  styleUrls: ['./hero-list.component.scss']
})
export class HeroListComponent implements OnInit {
  @Input() heroId: string = '';
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  private heroService = inject(HeroService);
  private paginationService = inject(PaginationService);
  private translateService = inject(TranslateService);
  private loadingService = inject(LoadingService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  filterText = signal('');
  isFormVisible = signal(false);
  isEditing = signal(false);
  selectedHero = signal<Hero | null>(null);
  imageError = signal<string | null>(null);

  formImageSrc = signal('');




  readonly isLoading = this.loadingService.isLoading;

  get powerInputControl(): AbstractControl | null {
    return this.heroForm.get('powerInput');
  }

  getHeroCountText(): string {
    const count = this.filteredHeroes().length;
    return `${count} ${this.translateService.instant('heroes.heroCount')}`;
  }

  heroForm: FormGroup;

  filteredHeroes = computed(() => {
    const heroes = this.heroService.heroes();
    const filter = this.filterText().toLowerCase();

    if (!filter) return heroes;

    return heroes.filter(hero =>
      hero.name.toLowerCase().includes(filter) ||
      hero.realName.toLowerCase().includes(filter) ||
      hero.universe.toLowerCase().includes(filter)
    );
  });

  paginatedHeroes = computed(() => {
    return this.paginationService.paginate(this.filteredHeroes());
  });

  universes = Object.values(HeroUniverse);
  displayedColumns = ['image', 'name', 'realName', 'universe', 'actions'];

  constructor() {
    this.heroForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      realName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      powers: this.fb.array([]),
      imageUrl: ['', [Validators.pattern(/^https?:\/\/.+/)]],
      universe: ['', [Validators.required]],
      powerInput: ['']
    });
  }

  ngOnInit(): void {
    this.paginationService.setConfig(1, 5);
    const url = this.route.snapshot.url.map(segment => segment.path).join('/');
    if (url.includes('new')) {
      this.showAddForm();
    } else if (url.includes('edit') && this.heroId) {
      this.loadHeroForEdit(this.heroId);
    }
  }

  get powersArray(): FormArray {
    return this.heroForm.get('powers') as FormArray;
  }

  onFilterChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.filterText.set(target.value);
    this.paginationService.resetToFirstPage();
  }

  onPageChange(event: PageEvent): void {
    this.paginationService.setConfig(event.pageIndex + 1, event.pageSize);
  }

  showAddForm(): void {
    this.isEditing.set(false);
    this.selectedHero.set(null);
    this.heroForm.reset();
    this.powersArray.clear();
    this.imageError.set(null);

    const defaultImg = ImageUtil.generateDefaultImage(this.translateService.instant('heroes.newHero'), this.translateService);
    this.formImageSrc.set(defaultImg);
    this.isFormVisible.set(true);
    if (!this.router.url.includes('/new')) {
      this.router.navigate(['/heroes/new']);
    }
    this.scrollToTop();
  }

  openSnackBar(message: string, action: string): void {
    this.snackBar.open(this.translateService.instant(message), this.translateService.instant(action), { duration: 3000 });
  }

  loadHeroForEdit(heroId: string): void {
    const heroes = this.heroService.heroes();
    const hero = heroes.find(h => h.id === Number(heroId));

    if (hero) {
      this.showEditForm(hero);
    } else {
      this.router.navigate(['/heroes']);
      this.openSnackBar('heroes.notFound', 'actions.close');
    }
  }

  showEditForm(hero: Hero): void {
    this.isEditing.set(true);
    this.selectedHero.set(hero);
    this.heroForm.patchValue({
      name: hero.name,
      realName: hero.realName,
      description: hero.description,
      imageUrl: hero.imageUrl,
      universe: hero.universe
    });

    this.powersArray.clear();
    hero.powers.forEach(power => {
      this.powersArray.push(this.fb.control(power));
    });

    this.imageError.set(null);

    if (hero.imageUrl && hero.imageUrl.trim()) {
      this.validateAndSetFormImage(hero.imageUrl, hero.name);
    } else {
      const defaultImg = ImageUtil.generateDefaultImage(hero.name, this.translateService);
      this.formImageSrc.set(defaultImg);
    }

    this.isFormVisible.set(true);

    if (!this.router.url.includes(`/edit/${hero.id}`)) {
      this.router.navigate(['/heroes/edit', hero.id]);
    }

    this.scrollToTop();
  }

  addPower(event?: any): void {
    let powerValue = '';

    if (event && event.value) {
      powerValue = event.value.trim();
      event.chipInput.clear();
    } else {
      powerValue = this.powerInputControl?.value?.trim() || '';
    }

    if (powerValue && !this.powersArray.value.includes(powerValue)) {
      this.powersArray.push(this.fb.control(powerValue));
      this.powerInputControl?.setValue('');
    }
  }

  removePower(index: number): void {
    this.powersArray.removeAt(index);
  }


  onSubmit(): void {
    if (this.heroForm.valid && this.powersArray.length > 0) {
      const formValue = this.heroForm.value;
      const heroData = {
        name: formValue.name,
        realName: formValue.realName,
        description: formValue.description,
        powers: this.powersArray.value,
        imageUrl: formValue.imageUrl || ImageUtil.generateDefaultImage(formValue.name, this.translateService),
        universe: formValue.universe
      };
      if (this.isEditing()) {
        const heroId = this.selectedHero()?.id;
        if (heroId) {
          this.heroService.updateHero(heroId, heroData);
          this.openSnackBar('heroes.updateSuccess', 'actions.close');
        }
      } else {
        this.heroService.addHero(heroData);
        this.openSnackBar('heroes.addSuccess', 'actions.close');
      }
      this.cancelForm();
    } else {
      this.markFormGroupTouched();
      if (this.powersArray.length === 0) {
        this.openSnackBar('heroes.powerRequired', 'actions.close');
      }
    }
  }

  deleteHero(hero: Hero): void {
    const dialogData: ConfirmDialogData = {
      title: this.translateService.instant('heroes.deleteConfirmTitle'),
      message: this.translateService.instant('heroes.deleteConfirmMessage', { heroName: hero.name }),
      confirmText: this.translateService.instant('actions.delete'),
      cancelText: this.translateService.instant('actions.cancel')
    };
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '90vw',
      maxWidth: '400px',
      data: dialogData
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.heroService.deleteHero(hero.id);
        this.openSnackBar('heroes.deleteSuccess', 'actions.close');
      }
    });
  }

  cancelForm(): void {
    this.isFormVisible.set(false);
    this.isEditing.set(false);
    this.selectedHero.set(null);
    this.heroForm.reset();
    this.powersArray.clear();
    this.imageError.set(null);
    this.formImageSrc.set('');

    this.router.navigate(['/heroes']);
    ImageUtil.clearCacheIfNeeded();
  }

  onImageError(): void {
    this.imageError.set('error');
  }

  onImageLoad(): void {
    this.imageError.set(null);
  }

  onTableImageError(event: any, hero: Hero): void {
    event.target.src = ImageUtil.generateDefaultImage(hero.name, this.translateService);
  }

  private validateAndSetFormImage(imageUrl: string, heroName: string): void {
    ImageUtil.validateImageUrl(
      imageUrl,
      heroName,
      this.translateService,
      (validUrl) => {
        this.imageError.set(null);
        this.formImageSrc.set(validUrl);
      },
      (defaultImg) => {
        this.imageError.set('error');
        this.formImageSrc.set(defaultImg);
      },
      () => {
        this.imageError.set('loading');
        this.formImageSrc.set(imageUrl);
      }
    );
  }

  onImageUrlBlur(): void {
    const imageUrl = this.heroForm.get('imageUrl')?.value;
    const heroName = this.heroForm.get('name')?.value;

    if (imageUrl && imageUrl.trim()) {
      const trimmedUrl = imageUrl.trim();
      if (trimmedUrl.match(/^https?:\/\/.+/)) {
        this.validateAndSetFormImage(trimmedUrl, heroName || this.translateService.instant('heroes.newHero'));
      } else {
        this.imageError.set('error');
        const defaultImg = ImageUtil.generateDefaultImage(heroName || this.translateService.instant('heroes.newHero'), this.translateService);
        this.formImageSrc.set(defaultImg);
      }
    } else {
      this.imageError.set(null);
      const defaultImg = ImageUtil.generateDefaultImage(heroName || this.translateService.instant('heroes.newHero'), this.translateService);
      this.formImageSrc.set(defaultImg);
    }
  }

  getImageSrc(hero: Hero): string {
    return ImageUtil.getImageSrcForHero(hero, this.translateService);
  }

  private scrollToTop(): void {
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    }, 0);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.heroForm.controls).forEach(key => {
      this.heroForm.get(key)?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.heroForm.get(fieldName);
    if (control?.errors && control.touched) {
      const fieldTranslation = this.translateService.instant(`form.labels.${fieldName}`) || fieldName;
      if (control.errors['required']) {
        return this.translateService.instant('form.errors.required', { field: fieldTranslation });
      }
      if (control.errors['minlength']) {
        return this.translateService.instant('form.errors.minLength', {
          field: fieldTranslation,
          length: control.errors['minlength'].requiredLength
        });
      }
      if (control.errors['maxlength']) {
        return this.translateService.instant('form.errors.maxLength', {
          field: fieldTranslation,
          length: control.errors['maxlength'].requiredLength
        });
      }
      if (control.errors['pattern']) {
        return this.translateService.instant('form.errors.invalidFormat', { field: fieldTranslation });
      }
    }
    return '';
  }
}