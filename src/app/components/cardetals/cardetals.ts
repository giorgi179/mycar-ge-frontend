import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HomeService } from '../../services/home-service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language-service';
import { CarModels } from '../../services/components';


@Component({
  selector: 'app-cardetals',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './cardetals.html',
  styleUrl: './cardetals.scss',
})
export class Cardetals implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(HomeService);
  private langService = inject(LanguageService);

  car = signal<CarModels | null>(null);
  error = signal<string | null>(null);
  loading = signal<boolean>(true);

  // გალერეის სთეითი
  activeIndex = signal<number>(0);
  activeImage = signal<string>('');

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
      },
      error: (err) => {
        this.error.set(this.langService.translate('home.error'));
        this.loading.set(false);
        console.error(err);
      }
    });
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

  goBack(): void {
    this.router.navigate(['/cars']);
  }

}