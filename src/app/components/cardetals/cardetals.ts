import { Component, inject, OnInit, signal } from '@angular/core';
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
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(this.langService.translate('home.error'));
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/cars']);
  }
  
}