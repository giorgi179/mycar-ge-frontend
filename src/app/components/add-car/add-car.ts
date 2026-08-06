import { Component, ViewEncapsulation, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AddCarServices } from '../../services/add-car-services';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { CarAddRequest } from '../../services/components';


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

  step = signal(1);
  totalSteps = 4;

  railSteps = [
    { step: 1, label: 'addCar.railPrimaryFeatures' },
    { step: 2, label: 'addCar.railLocationCustoms' },
    { step: 3, label: 'addCar.railPhotoVideo' },
    { step: 4, label: 'addCar.railPrice' },
    { step: 5, label: 'addCar.railContact' },
  ];

  saleType = signal<'sale' | 'rent'>('sale');
  vinLookup = '';

  loading = signal(false);
  error = signal<string | null>(null);

  selectedImages = signal<File[]>([]);
  imagePreviews = signal<string[]>([]);

  manufacturerList = ['Toyota', 'BMW', 'Mercedes-Benz', 'Ford', 'Hyundai', 'Kia', 'Honda', 'Nissan', 'Volkswagen', 'Lexus'];
  fuelTypeList = ['ბენზინი', 'დიზელი', 'ჰიბრიდი', 'ელექტრო', 'გაზი'];
  carCategoryList = ['სედანი', 'ჯიპი', 'უნივერსალი', 'კუპე', 'ჰეტჩბექი', 'მინივენი', 'პიკაპი', 'კაბრიოლეტი'];
  transmissionList = ['ავტომატიკა', 'მექანიკა', 'ვარიატორი'];
  cylindersList = [3, 4, 6, 8, 10, 12];
  airbagsList = [2, 4, 6, 8, 9, 10];
  carColorList = ['თეთრი', 'შავი', 'ვერცხლისფერი', 'ნაცრისფერი', 'წითელი', 'ლურჯი', 'ყავისფერი', 'ბეჟი', 'მწვანე', 'ყვითელი'];
  interiorMaterialList = ['ნაჭერი', 'ხელოვნური ტყავი', 'ალკანტარა', 'ტყავი', 'კომბინირებული'];

  // Every control name below maps 1:1 onto a CarAddRequest / backend
  // Swagger field so nothing gets silently dropped on submit.
  form = this.fb.group({
    // Step 1 - Primary features
    manufacturer: ['', Validators.required],
    carModel: ['', Validators.required],
    carAge: ['', Validators.required],
    carType: ['', Validators.required],       // trim/body-type text -> CarType
    fuelType: ['', Validators.required],
    mileage: ['', Validators.required],
    engineVolume: ['', Validators.required],
    cylinders: [null as number | null, Validators.required],

    // Step 2 - Technical details
    transmission: ['', Validators.required],
    driveType: ['', Validators.required],
    doors: ['', Validators.required],
    airbags: [null as number | null, Validators.required],
    steeringWheel: ['', Validators.required],
    hasTechInspection: [false],
    hasCatalyst: [false],

    // Step 3 - Appearance
    color: ['', Validators.required],
    interiorColor: ['', Validators.required],
    interiorMaterial: ['', Validators.required],

    // Step 4 - Listing info
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

  totalFieldCount = Object.values(this.stepFieldNames).reduce((sum, arr) => sum + arr.length, 0);

  filledCount = computed(() => {
    const names = this.stepFieldNames[this.step()] ?? [];
    const v = this.form.getRawValue() as Record<string, unknown>;
    return names.filter(n => {
      const val = v[n];
      return val !== '' && val !== null && val !== undefined;
    }).length;
  });

  overallFilledCount = computed(() => {
    const v = this.form.getRawValue() as Record<string, unknown>;
    const allNames = Object.values(this.stepFieldNames).flat();
    return allNames.filter(n => {
      const val = v[n];
      return val !== '' && val !== null && val !== undefined;
    }).length;
  });

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
    const combined = [...this.selectedImages(), ...incoming].slice(0, 6);
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

    // allow re-selecting the same file(s) later
    input.value = '';
  }

  removeImage(index: number): void {
    this.selectedImages.update(imgs => imgs.filter((_, i) => i !== index));
    this.imagePreviews.update(previews => previews.filter((_, i) => i !== index));
  }

  submit(): void {
    // touch every control so validation messages / styles show up
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.error.set('გთხოვთ შეავსოთ ყველა სავალდებულო ველი.');
      // jump user back to the first step that's actually incomplete
      for (let s = 1; s <= this.totalSteps; s++) {
        if (!this.isStepValid(s)) {
          this.step.set(s);
          break;
        }
      }
      return;
    }

    if (this.selectedImages().length !== 6) {
      this.error.set('საჭიროა ზუსტად 6 ფოტოს ატვირთვა.');
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
        this.error.set(err?.error?.message || err?.error || 'დაფიქსირდა შეცდომა მანქანის დამატებისას.');
        console.error(err);
      }
    });
  }
}