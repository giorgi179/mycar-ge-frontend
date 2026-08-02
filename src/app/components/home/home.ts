import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { HomeService } from '../../services/home-service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language-service';
import { CarListItem, FilterCriteria, HomeFiltre } from '../home-filtre/home-filtre';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [TranslatePipe, HomeFiltre],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {

  private api = inject(HomeService);
  private langService = inject(LanguageService);
  private router = inject(Router);

  carList = signal<CarListItem[]>([]);
  error = signal<string | null>(null);
  displayLimit = signal<number>(6);

  ngOnInit(): void {
    this.loadCars();
  }

  private loadCars(): void {
    this.error.set(null);
    this.api.getAllCar().subscribe({
      next: (data) => {
        const list = data as unknown as CarListItem[];
        this.carList.set(list);
      },
      error: (err) => {
        this.error.set(this.langService.translate('home.error'));
        console.error(err);
      }
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

  goToAllCars(): void {
    this.router.navigate(['/cars']);
  }

  goToCarDetails(id: number): void {
    this.router.navigate(['/car', id]);
  }

  onClearFilters(): void {
    // Home-ზე clear უბრალოდ არაფერს აკეთებს
  }
}