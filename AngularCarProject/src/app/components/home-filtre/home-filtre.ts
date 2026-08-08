import { Component, input, output, computed, signal, ViewChild } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { AdditionalFiltersCriteria, AdditionalFiltersCriteriaValue } from '../additional-filters-criteria/additional-filters-criteria';

export interface CarDetails {
  id?: number;
  manufacturer: string;
  mileage?: string;
  engineVolume?: string;
  cylinders?: number;
  transmission?: string;
  driveType?: 'წინა' | 'უკანა' | '4x4';
  doors?: '2/3' | '4/5' | '>5';
  airbags?: number;
  steeringWheel?: 'მარცხენა' | 'მარჯვენა';
  color?: string;
  interiorColor?: string;
  interiorMaterial?: string;
  isExchangePossible?: boolean;
  hasTechInspection?: boolean;
  hasCatalyst?: boolean;
  description?: string;
  userPhone?: string;
  vinCode?: string;
  carId?: number;
  car?: unknown | null;
}

export interface CarListItem {

  id: number;

  city: string;

  carAge: string;

  carModel: string;

  carPrice: number;

  carType: string;

  fuelType: string;

  carImg: string;


  images: {
    id: number;
    imageUrl: string;
  }[];


  carDetals: {
    manufacturer: string;
    mileage: string;
    engineVolume: string;

    cylinders: number;

    transmission: string;
    driveType: string;
    doors: string;

    airbags: number;

    steeringWheel: string;

    color: string;

    interiorColor: string;

    interiorMaterial: string;


    isExchangePossible: boolean;

    hasTechInspection: boolean;

    hasCatalyst: boolean;


    description: string;

    userPhone: string;

    vinCode: string;

  } | null;

}

export interface FilterCriteria {
  manufacturer: string | null;
  model: string | null;
  location: string | null;
  year: string | null;
  price: string | null;
  fuel: string | null;
  vinOnly: boolean;
  priceNegotiableHidden: boolean;
  additional: AdditionalFiltersCriteriaValue | null;
}

@Component({
  selector: 'app-home-filtre',
  imports: [TranslatePipe, AdditionalFiltersCriteria],
  templateUrl: './home-filtre.html',
  styleUrl: './home-filtre.scss',
})
export class HomeFiltre {
  cars = input.required<CarListItem[]>();
  totalCount = input<number>(0);

  filterChange = output<FilterCriteria>();
  clearFilters = output<void>();

  selectedManufacturer = signal<string | null>(null);
  selectedModel = signal<string | null>(null);
  selectedLocation = signal<string | null>(null);
  selectedYear = signal<string | null>(null);
  selectedPrice = signal<string | null>(null);
  selectedFuel = signal<string | null>(null);
  vinOnly = signal(false);
  priceNegotiableHidden = signal(false);
  isAdditionalFiltersOpen = signal(false);
  additionalCriteria = signal<AdditionalFiltersCriteriaValue | null>(null);

  openDropdown = signal<string | null>(null);

  manufacturers = computed(() => {
    const set = new Set(this.cars().map(c => c.carDetals?.manufacturer).filter((m): m is string => !!m));
    return Array.from(set).sort();
  });

  models = computed(() => {
    const manufacturer = this.selectedManufacturer();
    const filtered = manufacturer
      ? this.cars().filter(c => c.carDetals?.manufacturer === manufacturer)
      : this.cars();
    const set = new Set(filtered.map(c => c.carModel));
    return Array.from(set).sort();
  });

  locations = computed(() => {
    const set = new Set(this.cars().map(c => c.city));
    return Array.from(set).sort();
  });

  years = computed(() => {
    const set = new Set(this.cars().map(c => c.carAge));
    return Array.from(set).sort((a, b) => Number(b) - Number(a));
  });

  fuelTypes = computed(() => {
    const set = new Set(this.cars().map(c => c.fuelType));
    return Array.from(set).sort();
  });

  @ViewChild(AdditionalFiltersCriteria) additionalFiltersRef?: AdditionalFiltersCriteria;

  toggleDropdown(name: string): void {
    this.openDropdown.update(current => (current === name ? null : name));
  }

  closeDropdown(): void {
    this.openDropdown.set(null);
  }

  selectManufacturer(value: string | null): void {
    this.selectedManufacturer.set(value);
    this.selectedModel.set(null);
    this.closeDropdown();
  }

  selectModel(value: string | null): void {
    this.selectedModel.set(value);
    this.closeDropdown();
  }

  selectLocation(value: string | null): void {
    this.selectedLocation.set(value);
    this.closeDropdown();
  }

  selectYear(value: string | null): void {
    this.selectedYear.set(value);
    this.closeDropdown();
  }

  selectPrice(value: string | null): void {
    this.selectedPrice.set(value);
    this.closeDropdown();
  }

  selectFuel(value: string | null): void {
    this.selectedFuel.set(value);
    this.closeDropdown();
  }

  toggleVinOnly(): void {
    this.vinOnly.update(v => !v);
  }

  togglePriceNegotiableHidden(): void {
    this.priceNegotiableHidden.update(v => !v);
  }

  onAdditionalFiltersApply(criteria: AdditionalFiltersCriteriaValue): void {
    this.additionalCriteria.set(criteria);
  }

  openAdditionalFilters(): void {
    this.isAdditionalFiltersOpen.set(true);
  }

  onAdditionalFiltersClose(): void {
    this.isAdditionalFiltersOpen.set(false);
  }

  onClearFilters(): void {
    this.selectedManufacturer.set(null);
    this.selectedModel.set(null);
    this.selectedLocation.set(null);
    this.selectedYear.set(null);
    this.selectedPrice.set(null);
    this.selectedFuel.set(null);
    this.vinOnly.set(false);
    this.priceNegotiableHidden.set(false);
    this.additionalCriteria.set(null);
    this.additionalFiltersRef?.resetState(); 
    this.clearFilters.emit();
    this.emitChange();
  }


  onSearch(): void {
    this.emitChange();
  }

  private emitChange(): void {
    this.filterChange.emit({
      manufacturer: this.selectedManufacturer(),
      model: this.selectedModel(),
      location: this.selectedLocation(),
      year: this.selectedYear(),
      price: this.selectedPrice(),
      fuel: this.selectedFuel(),
      vinOnly: this.vinOnly(),
      priceNegotiableHidden: this.priceNegotiableHidden(),
      additional: this.additionalCriteria(),
    });
  }

}