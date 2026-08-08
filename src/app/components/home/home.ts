import { Component, inject, OnInit, signal, computed, AfterViewInit, ElementRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HomeService, ManufacturerCount, HomeStats } from '../../services/home-service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language-service';
import { AuthService } from '../../services/auth-service';
import { CarListItem, FilterCriteria } from '../home-filtre/home-filtre';
import { ViewChild } from '@angular/core';
import { HomeFiltre } from '../home-filtre/home-filtre';
import { environment } from '../../../environments/environment.development';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [TranslatePipe, HomeFiltre, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, AfterViewInit {

  private api = inject(HomeService);
  private langService = inject(LanguageService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);
  auth = inject(AuthService);
  imageBaseUrl = environment.imageUrl;
  carList = signal<CarListItem[]>([]);
  error = signal<string | null>(null);
  loading = signal<boolean>(true);
  displayLimit = signal<number>(6);

  skeletonArray = Array.from({ length: 6 }, (_, i) => i);

  popularBrands = signal<ManufacturerCount[]>([]);
  stats = signal<HomeStats | null>(null);

  showAuthPrompt = signal(false);

  logoFailed = signal<Set<string>>(new Set());
  @ViewChild('homeFiltre') homeFiltreRef?: HomeFiltre;

  private readonly logoUrlMap: Record<string, string> = {
    'mercedes-benz': 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Mercedes-Logo.svg',
    'mercedes': 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Mercedes-Logo.svg',
    'volkswagen': 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Volkswagen_logo_2019.svg',
    'toyota': 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Toyota_carlogo.svg',
    'bmw': 'https://upload.wikimedia.org/wikipedia/commons/4/44/BMW.svg',
    'hyundai': 'https://upload.wikimedia.org/wikipedia/commons/4/44/Hyundai_Motor_Company_logo.svg',
    'ford': 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Ford_logo_flat.svg',
    'audi': 'https://upload.wikimedia.org/wikipedia/commons/9/92/Audi-Logo_2016.svg',
    'honda': 'https://upload.wikimedia.org/wikipedia/commons/3/38/Honda.svg',
    'nissan': 'https://upload.wikimedia.org/wikipedia/commons/8/89/Nissan_2020_logo.svg',
    'kia': 'https://upload.wikimedia.org/wikipedia/commons/4/44/Kia-logo-2021.svg',
    'mazda': 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Mazda_logo_with_emblem.png',
    'chevrolet': 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Chevrolet-logo.png',
    'lexus': 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Lexus_division_emblem.png',
    'porsche': 'https://upload.wikimedia.org/wikipedia/commons/6/68/Porsche-Logo.svg',
    'land rover': 'https://upload.wikimedia.org/wikipedia/commons/1/17/Land_Rover_logo_black.svg',
    'range rover': 'https://upload.wikimedia.org/wikipedia/commons/1/17/Land_Rover_logo_black.svg',
    'jeep': 'https://upload.wikimedia.org/wikipedia/commons/2/26/Jeep_wordmark.svg',
    'subaru': 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Subaru_logo_%282019%29.svg',
    'mitsubishi': 'https://upload.wikimedia.org/wikipedia/commons/0/03/Mitsubishi_logo.svg',
    'volvo': 'https://upload.wikimedia.org/wikipedia/commons/0/0c/Volvo_logo.svg',
    'peugeot': 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Peugeot_2021_Logo.svg',
    'renault': 'https://upload.wikimedia.org/wikipedia/commons/4/49/Renault_2021_Text.svg',
    'skoda': 'https://upload.wikimedia.org/wikipedia/commons/6/68/Skoda_Auto_logo_%282022%29.svg',
    'opel': 'https://upload.wikimedia.org/wikipedia/commons/3/34/Opel_logo_2017.svg',
    'fiat': 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Fiat_Logo.svg',
    'mini': 'https://upload.wikimedia.org/wikipedia/commons/8/8b/MINI_logo.svg',
    'jaguar': 'https://upload.wikimedia.org/wikipedia/commons/6/60/Jaguar_2012_logo.svg',
    'tesla': 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Tesla_T_symbol.svg',
    'chrysler': 'https://upload.wikimedia.org/wikipedia/commons/0/09/Chrysler_Logo.svg',
    'dodge': 'https://upload.wikimedia.org/wikipedia/commons/2/28/Dodge_logo.svg',
    'cadillac': 'https://upload.wikimedia.org/wikipedia/commons/2/28/Cadillac_logo.svg',
    'gmc': 'https://upload.wikimedia.org/wikipedia/commons/7/70/GMC_logo.svg',
    'lincoln': 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Lincoln_Motor_Company_logo.svg',
    'buick': 'https://upload.wikimedia.org/wikipedia/commons/9/94/Buick_logo.svg',
    'infiniti': 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Infiniti_logo.svg',
    'acura': 'https://upload.wikimedia.org/wikipedia/commons/3/3d/Acura_logo.svg',
    'genesis': 'https://upload.wikimedia.org/wikipedia/commons/1/1b/Genesis_logo.svg',
    'suzuki': 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Suzuki_logo_2.svg',
    'seat': 'https://upload.wikimedia.org/wikipedia/commons/7/7f/SEAT_logo.svg',
    'alfa romeo': 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Alfa_Romeo_2015.svg',
    'maserati': 'https://upload.wikimedia.org/wikipedia/commons/c/c6/Maserati_logo.svg',
    'bentley': 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Bentley_logo_2.svg',
    'ferrari': 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Ferrari-Logo.svg',
    'lamborghini': 'https://upload.wikimedia.org/wikipedia/commons/c/c6/Lamborghini_Logo.svg',
    'aston martin': 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Aston_Martin_Logo.svg',
    'citroen': 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Citroen_2016_logo.svg',
  };

  private observer?: IntersectionObserver;

  ngOnInit(): void {
    this.loadCars();
    this.loadBrands();
    this.loadStats();
  }

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal--visible');
            this.observer?.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 }
    );
    this.observeReveals();
  }

  private observeReveals(): void {
    setTimeout(() => {
      const nodes = this.elementRef.nativeElement.querySelectorAll('.reveal:not(.reveal--visible)');
      nodes.forEach((node: Element) => this.observer?.observe(node));
    }, 0);
  }

  private loadCars(): void {
    this.error.set(null);
    this.loading.set(true);
    this.api.getAllCar().subscribe({
      next: (data) => {
        const list = data as unknown as CarListItem[];
        this.carList.set(list);
        this.loading.set(false);
        this.observeReveals();
      },
      error: (err) => {
        this.error.set(this.langService.translate('home.error'));
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  private loadBrands(): void {
    this.api.getManufacturers().subscribe({
      next: (data) => {
        this.popularBrands.set(data);
        this.observeReveals();
      },
      error: (err) => console.error(err)
    });
  }

  private loadStats(): void {
    this.api.getStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.observeReveals();
      },
      error: (err) => console.error(err)
    });
  }

  limitedCars = computed(() => {
    return this.carList().slice(0, this.displayLimit());
  });

  onFilterChange(criteria: FilterCriteria): void {
    this.router.navigate(['/cars'], {
      queryParams: { filter: JSON.stringify(criteria) }
    });
  }
  getImageUrl(path: string): string {
    return path || '';
  }
  onCarImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/placeholder-car.png';
  }
  goToAllCars(): void {
    this.router.navigate(['/cars']);
  }

  goToCarDetails(id: number): void {
    this.router.navigate(['/car', id]);
  }

  onClearFilters(): void {
    this.homeFiltreRef?.onClearFilters();
  }
  filterByBrand(brand: string): void {
    this.router.navigate(['/cars'], {
      queryParams: { filter: JSON.stringify({ manufacturer: brand }) }
    });
  }

  goToAddCar(): void {
    if (!this.auth.isLoggedIn()) {
      this.showAuthPrompt.update(v => !v);
    } else {
      this.router.navigate(['/add-car']);
    }
  }

  closeAuthPrompt(): void {
    this.showAuthPrompt.set(false);
  }

  getInitial(name: string): string {
    return name.charAt(0).toUpperCase();
  }

  getLogoUrl(name: string): string | null {
    const key = name.toLowerCase().trim();
    // No algorithmic fallback here on purpose: a guessed clearbit.com URL
    // for a brand missing from the map would just be another network call
    // that fails and trips onLogoError anyway. Returning null lets the
    // template skip straight to the initial-badge fallback for unmapped
    // brands, avoiding a wasted request.
    return this.logoUrlMap[key] ?? null;
  }

  onLogoError(name: string): void {
    // Adds this brand to the failed set so the template swaps to the
    // text-initial fallback. update() so we don't mutate the existing Set
    // reference directly (keeps signal change-detection correct).
    this.logoFailed.update(set => {
      const next = new Set(set);
      next.add(name);
      return next;
    });
  }
}