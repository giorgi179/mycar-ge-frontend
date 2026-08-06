import { Component, ViewEncapsulation, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { AddCarServices } from '../../services/add-car-services';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { CarAddRequest, CarModels } from '../../services/components';
import { environment } from '../../../environments/environment';

function yearValidator(control: AbstractControl): ValidationErrors | null {
  const v = (control.value ?? '').toString().trim();
  if (!v) return null;
  const year = Number(v);
  const currentYear = new Date().getFullYear();
  if (!/^\d{4}$/.test(v) || year < 1950 || year > currentYear + 1) {
    return { yearInvalid: true };
  }
  return null;
}

function positiveNumberValidator(control: AbstractControl): ValidationErrors | null {
  const v = (control.value ?? '').toString().trim();
  if (!v) return null;
  const n = Number(v);
  if (Number.isNaN(n) || n <= 0) {
    return { numberInvalid: true };
  }
  return null;
}

function georgianPhoneValidator(control: AbstractControl): ValidationErrors | null {
  const v = (control.value ?? '').toString().trim();
  if (!v) return null;
  const digitsOnly = v.replace(/\D/g, '');
  if (!/^5\d{8}$/.test(digitsOnly)) {
    return { phoneInvalid: true };
  }
  return null;
}

function vinValidator(control: AbstractControl): ValidationErrors | null {
  const v = (control.value ?? '').toString().trim();
  if (!v) return null;
  if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(v)) {
    return { vinInvalid: true };
  }
  return null;
}

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

  // error() ინახავს არა ტექსტს, არამედ თარგმანის key-ს (+ საჭიროების
  // შემთხვევაში interpolation პარამეტრებს). Template თავად თარგმნის
  // TranslatePipe-ის საშუალებით: {{ error() | translate:errorParams() }}
  private errorKey = signal<string | null>(null);
  private errorParamsSig = signal<Record<string, string | number> | undefined>(undefined);
  error = computed(() => this.errorKey());
  errorParams = computed(() => this.errorParamsSig());

  loading = signal(false);

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
    carAge: ['', [Validators.required, yearValidator]],
    carType: ['', Validators.required],
    fuelType: ['', Validators.required],
    mileage: ['', [Validators.required, positiveNumberValidator]],
    engineVolume: ['', [Validators.required, positiveNumberValidator]],
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
    userPhone: ['', [Validators.required, georgianPhoneValidator]],
    vinCode: ['', vinValidator],
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

  /** კონკრეტული ველის შეცდომის key. Template: {{ fieldErrorKey('carAge') | translate }} */
  fieldErrorKey(name: string): string | null {
    const control = this.form.get(name);
    if (!control || !control.touched || control.valid) return null;

    const errors = control.errors;
    if (!errors) return null;

    if (errors['required']) return 'addCar.errors.required';
    if (errors['yearInvalid']) return 'addCar.errors.yearInvalid';
    if (errors['numberInvalid']) return 'addCar.errors.numberInvalid';
    if (errors['phoneInvalid']) return 'addCar.errors.phoneInvalid';
    if (errors['vinInvalid']) return 'addCar.errors.vinInvalid';
    if (errors['min']) return 'addCar.errors.priceMin';

    return 'addCar.errors.required';
  }

  private setError(key: string, params?: Record<string, string | number>): void {
    this.errorKey.set(key);
    this.errorParamsSig.set(params);
  }

  private clearError(): void {
    this.errorKey.set(null);
    this.errorParamsSig.set(undefined);
  }

  nextStep(): void {
    const names = this.stepFieldNames[this.step()] ?? [];
    names.forEach(n => this.form.get(n)?.markAsTouched());

    if (!this.isStepValid(this.step())) {
      this.setError('addCar.errors.stepIncomplete');
      return;
    }

    this.clearError();
    if (this.step() < this.totalSteps) {
      this.step.update(s => s + 1);
    }
  }

  prevStep(): void {
    this.clearError();
    if (this.step() > 1) {
      this.step.update(s => s - 1);
    }
  }

  goToStep(n: number): void {
    this.step.set(Math.min(Math.max(n, 1), this.totalSteps));
  }

  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const incoming = Array.from(input.files);
    const currentCount = this.selectedImages().length;

    // უკვე ლიმიტზეა — საერთოდ არაფერი არ დაემატება
    if (currentCount >= this.maxImages) {
      this.setError('addCar.errors.maxImages', { max: this.maxImages });
      input.value = '';
      return;
    }

    // მთლიანი მოთხოვნილი რაოდენობა (already selected + newly picked) ლიმიტს სცდება —
    // მთლიანად უარვყოფთ არჩევანს, ნაწილობრივ აღარ ვჭრით ჩუმად.
    if (currentCount + incoming.length > this.maxImages) {
      this.setError('addCar.errors.maxImages', { max: this.maxImages });
      input.value = '';
      return;
    }

    const validExt = ['.jpg', '.jpeg', '.png', '.webp'];
    const maxBytes = 5 * 1024 * 1024;

    const rejectedType: string[] = [];
    const rejectedSize: string[] = [];
    const valid: File[] = [];

    for (const file of incoming) {
      const ext = '.' + (file.name.split('.').pop() ?? '').toLowerCase();
      if (!validExt.includes(ext)) {
        rejectedType.push(file.name);
        continue;
      }
      if (file.size > maxBytes) {
        rejectedSize.push(file.name);
        continue;
      }
      valid.push(file);
    }

    if (rejectedType.length) {
      this.setError('addCar.errors.invalidImageType');
      input.value = '';
      return;
    }
    if (rejectedSize.length) {
      this.setError('addCar.errors.imageTooLarge');
      input.value = '';
      return;
    }

    this.clearError();

    const combined = [...this.selectedImages(), ...valid];
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
      this.setError('addCar.errors.formInvalid');
      for (let s = 1; s <= this.totalSteps; s++) {
        if (!this.isStepValid(s)) {
          this.step.set(s);
          break;
        }
      }
      return;
    }

    if (this.selectedImages().length < this.minImages || this.selectedImages().length > this.maxImages) {
      this.setError('addCar.errors.imageCountRange', { min: this.minImages, max: this.maxImages });
      this.step.set(3);
      return;
    }

    this.clearError();
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
        const { key, params } = this.extractServerErrorKey(err);
        this.setError(key, params);
      }
    });
  }

  /** სერვერის შეცდომას გადააქცევს თარგმანის key-დ. */
  private extractServerErrorKey(err: unknown): { key: string; params?: Record<string, string | number> } {
    const httpErr = err as { status?: number; error?: unknown };

    if (httpErr?.status === 401) {
      return { key: 'addCar.errors.unauthorized' };
    }
    if (httpErr?.status === 0) {
      return { key: 'addCar.errors.networkError' };
    }

    const body = httpErr?.error as
      | string
      | { message?: string; title?: string; errors?: Record<string, string[]> }
      | undefined;

    const rawMessage: string | undefined =
      (typeof body === 'string' && body.trim() ? body : undefined) ||
      (typeof body === 'object' ? body?.message : undefined) ||
      (typeof body === 'object' ? body?.title : undefined) ||
      (typeof body === 'object' && body?.errors
        ? Object.values(body.errors)[0]?.[0]
        : undefined);

    if (rawMessage) {
      if (/საჭიროა.*ფოტოს ატვირთვა/.test(rawMessage)) {
        return { key: 'addCar.errors.imageCountRange', params: { min: this.minImages, max: this.maxImages } };
      }
      if (/Image max 5MB/i.test(rawMessage)) {
        return { key: 'addCar.errors.imageTooLarge' };
      }
      if (/Invalid format/i.test(rawMessage)) {
        return { key: 'addCar.errors.invalidImageType' };
      }
      if (/User not found/i.test(rawMessage)) {
        return { key: 'addCar.errors.userNotFound' };
      }
    }

    return { key: 'addCar.errors.generic' };
  }

  savedListingsOpen = signal(false);
  savedListings = signal<CarModels[]>([]);
  savedListingsLoading = signal(false);
  savedListingsErrorKey = signal<string | null>(null);
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
    this.savedListingsErrorKey.set(null);
    this.api.getMyCars().subscribe({
      next: (cars) => {
        this.savedListingsLoading.set(false);
        this.savedListingsLoaded = true;
        this.savedListings.set(cars ?? []);
      },
      error: () => {
        this.savedListingsLoading.set(false);
        this.savedListingsErrorKey.set('addCar.errors.savedListingsFailed');
      }
    });
  }
}