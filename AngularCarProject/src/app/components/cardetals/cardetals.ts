import { Component, computed, inject, OnInit, OnDestroy, signal, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HomeService } from '../../services/home-service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language-service';
import { CarModels } from '../../services/components';
import { environment } from '../../../environments/environment.development';
import { SeoService } from '../../services/seo-service';


@Component({
  selector: 'app-cardetals',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './cardetals.html',
  styleUrl: './cardetals.scss',
})
export class Cardetals implements OnInit, OnDestroy {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(HomeService);
  private langService = inject(LanguageService);
  private seo = inject(SeoService);

  imageBaseUrl = environment.imageUrl;
  car = signal<CarModels | null>(null);
  error = signal<string | null>(null);
  loading = signal<boolean>(true);

  // გალერეის სთეითი
  activeIndex = signal<number>(0);
  activeImage = signal<string>('');

  // lightbox-ის სთეითი
  lightboxOpen = signal<boolean>(false);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.error.set(this.langService.translate('home.error'));
      this.loading.set(false);
      return;
    }
    this.loadCar(Number(idParam));
  }

  private loadCar(id: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.getCarById(id).subscribe({
      next: (data) => {
        this.car.set(data);
        this.activeIndex.set(0);
        this.activeImage.set(data.carImg);
        this.loading.set(false);
        this.updateSeoForCar(data);
      },
      error: (err) => {
        this.error.set(this.langService.translate('home.error'));
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  /** ავსებს title/meta/OG-ს და Vehicle JSON-LD schema-ს კონკრეტული მანქანის მონაცემებით */
  private updateSeoForCar(car: CarModels): void {
    const manufacturer = car.carDetals?.manufacturer ? `${car.carDetals.manufacturer} ` : '';
    const title = `${manufacturer}${car.carModel} ${car.carAge} — ${car.carPrice}₾`;
    const description = `${manufacturer}${car.carModel}, ${car.carAge} წელი, ${car.fuelType}, ${car.carDetals?.mileage ?? ''} გარბენი, ${car.city}. ${car.carDetals?.description?.slice(0, 100) ?? ''}`.trim();
    const image = car.carImg?.startsWith('http') ? car.carImg : `${this.imageBaseUrl}${car.carImg}`;

    this.seo.update({
      title,
      description,
      keywords: `${manufacturer}${car.carModel}, ${car.carModel} ${car.carAge}, ${car.carType}, ${car.fuelType}, მანქანა ${car.city}, ${manufacturer}ყიდვა`,
      image,
      url: `/car/${car.id}`,
      type: 'product'
    });

    this.seo.setJsonLd({
      '@context': 'https://schema.org',
      '@type': 'Vehicle',
      name: `${manufacturer}${car.carModel} ${car.carAge}`,
      brand: car.carDetals?.manufacturer,
      model: car.carModel,
      vehicleModelDate: car.carAge,
      mileageFromOdometer: car.carDetals?.mileage,
      fuelType: car.fuelType,
      vehicleTransmission: car.carDetals?.transmission,
      color: car.carDetals?.color,
      image: (car.images?.length ? car.images.map(i => i.imageUrl.startsWith('http') ? i.imageUrl : `${this.imageBaseUrl}${i.imageUrl}`) : [image]),
      description: car.carDetals?.description,
      offers: {
        '@type': 'Offer',
        price: car.carPrice,
        priceCurrency: 'GEL',
        availability: 'https://schema.org/InStock',
        url: `https://mycar.ge/car/${car.id}`
      }
    });
  }

  ngOnDestroy(): void {
    this.seo.removeJsonLd();
  }

  setActiveImage(index: number, url: string): void {
    this.activeIndex.set(index);
    this.activeImage.set(url);
  }

  nextImage(): void {
    const c = this.car();
    if (!c) return;
    const total = 1 + (c.images?.length ?? 0);
    const next = (this.activeIndex() + 1) % total;
    const url = next === 0 ? c.carImg : c.images[next - 1].imageUrl;
    this.setActiveImage(next, url);
  }

  prevImage(): void {
    const c = this.car();
    if (!c) return;
    const total = 1 + (c.images?.length ?? 0);
    const prev = (this.activeIndex() - 1 + total) % total;
    const url = prev === 0 ? c.carImg : c.images[prev - 1].imageUrl;
    this.setActiveImage(prev, url);
  }

  openLightbox(): void {
    this.lightboxOpen.set(true);
  }

  closeLightbox(): void {
    this.lightboxOpen.set(false);
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (!this.lightboxOpen()) return;
    if (event.key === 'Escape') this.closeLightbox();
    if (event.key === 'ArrowRight') this.nextImage();
    if (event.key === 'ArrowLeft') this.prevImage();
  }

  goBack(): void {
    this.router.navigate(['/cars']);
  }

}