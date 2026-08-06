
import { Component, ViewEncapsulation, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { AddCarServices } from '../../services/add-car-services';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { CarAddRequest, CarModels } from '../../services/components';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-add-car',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslatePipe],
  templateUrl: './add-car.html',
  styleUrl: './add-car.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AddCar {
  private fb = inject(FormBuilder);
  private api = inject(AddCarServices);
  private router = inject(Router);

  imageBaseUrl = (environment as { imageUrl?: string }).imageUrl ?? '';

  step = signal(1);
  totalSteps = 4;

  railSteps = [
    { step: 1, label: 'addCar.railPrimaryFeatures' },
    { step: 2, label: 'addCar.railLocationCustoms' },
    { step: 3, label: 'addCar.railPhotoVideo' },
    { step: 4, label: 'addCar.railPrice' },
  ];

  saleType = signal<'sale' | 'rent'>('sale');
  vinLookup = '';

  loading = signal(false);
  error = signal<string | null>(null);

  minImages = 1;
  maxImages = 6;

  selectedImages = signal<File[]>([]);
  imagePreviews = signal<string[]>([]);

  manufacturerList = ['Toyota', 'BMW', 'Mercedes-Benz', 'Ford', 'Hyundai', 'Kia', 'Honda', 'Nissan', 'Volkswagen', 'Lexus'];
  fuelTypeList = ['ბენზინი', 'დიზელი', 'ჰიბრიდი', 'ელექტრო', 'გაზი'];
  transmissionList = ['ავტომატიკა', 'მექანიკა', 'ვარიატორი'];
  cylindersList = [3, 4, 6, 8, 10, 12];
  airbagsList = [2, 4, 6, 8, 9, 10];
  carColorList = ['თეთრი', 'შავი', 'ვერცხლისფერი', 'ნაცრისფერი', 'წითელი', 'ლურჯი', 'ყავისფერი', 'ბეჟი', 'მწვანე', 'ყვითელი'];
  interiorMaterialList = ['ნაჭერი', 'ხელოვნური ტყავი', 'ალკანტარა', 'ტყავი', 'კომბინირებული'];

  form = this.fb.group({
    manufacturer: ['', Validators.required],
    carModel: ['', Validators.required],
    carAge: ['', Validators.required],
    carType: ['', Validators.required],
    fuelType: ['', Validators.required],
    mileage: ['', Validators.required],
    engineVolume: ['', Validators.required],
    cylinders: [null as number | null, Validators.required],

    transmission: ['', Validators.required],
    driveType: ['', Validators.required],
    doors: ['', Validators.required],
    airbags: [null as number | null, Validators.required],
    steeringWheel: ['', Validators.required],
    hasTechInspection: [false],
    hasCatalyst: [false],

    color: ['', Validators.required],
    interiorColor: ['', Validators.required],
    interiorMaterial: ['', Validators.required],

    city: ['', Validators.required],
    carPrice: [null as number | null, [Validators.required, Validators.min(1)]],
    isExchangePossible: [false],
    description: [''],
    userPhone: ['', Validators.required],
    vinCode: [''],
  });

  stepFieldNames: Record<number, string[]> = {
    1: ['manufacturer', 'carModel', 'carAge', 'carType', 'fuelType', 'mileage', 'engineVolume', 'cylinders'],
    2: ['transmission', 'driveType', 'doors', 'airbags', 'steeringWheel'],
    3: ['color', 'interiorColor', 'interiorMaterial'],
    4: ['city', 'carPrice', 'userPhone'],
  };

  private formValue = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  filledCount = computed(() => {
    this.formValue();
    const names = this.stepFieldNames[this.step()] ?? [];
    const v = this.form.getRawValue() as Record<string, unknown>;
    return names.filter(n => {
      const val = v[n];
      return val !== '' && val !== null && val !== undefined;
    }).length;
  });

  previewCar = computed(() => {
    this.formValue();
    const v = this.form.getRawValue();
    return {
      carModel: v.manufacturer && v.carModel ? `${v.manufacturer} ${v.carModel}` : (v.carModel || v.manufacturer || null),
      city: v.city || null,
      carPrice: v.carPrice,
      fuelType: v.fuelType || null,
      carAge: v.carAge || null,
      carType: v.carType || null,
    };
  });

  previewImage = computed(() => this.imagePreviews()[0] ?? null);

  isStepValid(n: number): boolean {
    const names = this.stepFieldNames[n] ?? [];
    return names.every(name => this.form.get(name)?.valid ?? true);
  }

  nextStep(): void {
    const names = this.stepFieldNames[this.step()] ?? [];
    names.forEach(n => this.form.get(n)?.markAsTouched());

    if (!this.isStepValid(this.step())) {
      this.error.set('გთხოვთ შეავსოთ ყველა სავალდებულო ველი ამ საფეხურზე.');
      return;
    }

    this.error.set(null);
    if (this.step() < this.totalSteps) {
      this.step.update(s => s + 1);
    }
  }

  prevStep(): void {
    this.error.set(null);
    if (this.step() > 1) {
      this.step.update(s => s - 1);
    }
  }

  goToStep(n: number): void {
    this.step.set(Math.min(Math.max(n, 1), this.totalSteps));
  }

  lookupVin(): void {
    if (!this.vinLookup.trim()) return;
    // TODO: call VIN decode service and this.form.patchValue(result)
  }

  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const incoming = Array.from(input.files);
    const room = this.maxImages - this.selectedImages().length;

    if (room <= 0) {
      this.error.set(`მაქსიმუმ ${this.maxImages} ფოტოს ატვირთვაა შესაძლებელი.`);
      input.value = '';
      return;
    }

    const accepted = incoming.slice(0, room);
    if (incoming.length > accepted.length) {
      this.error.set(`მაქსიმუმ ${this.maxImages} ფოტოს ატვირთვაა შესაძლებელი — დაემატა მხოლოდ პირველი ${accepted.length}.`);
    } else {
      this.error.set(null);
    }

    const combined = [...this.selectedImages(), ...accepted];
    this.selectedImages.set(combined);

    const previews: string[] = [];
    let loaded = 0;
    combined.forEach((file, i) => {
      const reader = new FileReader();
      reader.onload = () => {
        previews[i] = reader.result as string;
        loaded++;
        if (loaded === combined.length) {
          this.imagePreviews.set([...previews]);
        }
      };
      reader.readAsDataURL(file);
    });

    input.value = '';
  }

  removeImage(index: number): void {
    this.selectedImages.update(imgs => imgs.filter((_, i) => i !== index));
    this.imagePreviews.update(previews => previews.filter((_, i) => i !== index));
  }

  submit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.error.set('გთხოვთ შეავსოთ ყველა სავალდებულო ველი.');
      for (let s = 1; s <= this.totalSteps; s++) {
        if (!this.isStepValid(s)) {
          this.step.set(s);
          break;
        }
      }
      return;
    }

    if (this.selectedImages().length < this.minImages || this.selectedImages().length > this.maxImages) {
      this.error.set(`საჭიროა ${this.minImages}-დან ${this.maxImages}-მდე ფოტოს ატვირთვა.`);
      this.step.set(3);
      return;
    }

    this.error.set(null);
    this.loading.set(true);

    const v = this.form.getRawValue();

    const request: CarAddRequest = {
      city: v.city!,
      carAge: v.carAge!,
      carModel: v.carModel!,
      carPrice: v.carPrice!,
      carType: v.carType!,
      fuelType: v.fuelType!,

      manufacturer: v.manufacturer!,
      mileage: v.mileage!,
      engineVolume: v.engineVolume!,
      cylinders: v.cylinders!,
      transmission: v.transmission!,
      driveType: v.driveType!,
      doors: v.doors!,
      airbags: v.airbags!,
      steeringWheel: v.steeringWheel!,
      color: v.color!,
      interiorColor: v.interiorColor!,
      interiorMaterial: v.interiorMaterial!,

      isExchangePossible: v.isExchangePossible!,
      hasTechInspection: v.hasTechInspection!,
      hasCatalyst: v.hasCatalyst!,

      description: v.description || '',
      userPhone: v.userPhone!,
      vinCode: v.vinCode || '',

      images: this.selectedImages(),
    };

    this.api.addCar(request).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.router.navigate(['/car', res.carId]);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(this.extractErrorMessage(err));
      }
    });
  }

  private extractErrorMessage(err: any): string {
    const body = err?.error;
    if (typeof body === 'string' && body.trim()) return body;
    if (body?.message) return body.message;
    if (body?.title) return body.title;
    if (body?.errors) {
      const first = Object.values(body.errors as Record<string, string[]>)[0];
      if (Array.isArray(first) && first.length) return first[0];
    }
    if (err?.status === 401) return 'გთხოვთ გაიაროთ ავტორიზაცია განცხადების დასამატებლად.';
    if (err?.status === 0) return 'სერვერთან კავშირი ვერ დამყარდა.';
    return 'დაფიქსირდა შეცდომა მანქანის დამატებისას.';
  }

  savedListingsOpen = signal(false);
  savedListings = signal<CarModels[]>([]);
  savedListingsLoading = signal(false);
  savedListingsError = signal<string | null>(null);
  savedListingsLoaded = false;

  toggleSavedListings(): void {
    this.savedListingsOpen.update(o => !o);
    if (this.savedListingsOpen() && !this.savedListingsLoaded) {
      this.loadSavedListings();
    }
  }

  goToSavedListing(id: number): void {
    this.router.navigate(['/car', id]);
  }

  loadSavedListings(): void {
    this.savedListingsLoading.set(true);
    this.savedListingsError.set(null);
    this.api.getMyCars().subscribe({
      next: (cars) => {
        this.savedListingsLoading.set(false);
        this.savedListingsLoaded = true;
        this.savedListings.set(cars ?? []);
      },
      error: () => {
        this.savedListingsLoading.set(false);
        this.savedListingsError.set('შენახული განცხადებების ჩატვირთვა ვერ მოხერხდა.');
      }
    });
  }
}