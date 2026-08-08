import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileServices, UserProfile } from '../../services/profile-services';
import { CarModels } from '../../services/components';
import { environment } from '../../../environments/environment';
import { AddCar } from "../add-car/add-car";
import { TranslatePipe } from '../../pipes/translate.pipe';

type TabId = 'overview' | 'cars' | 'add' | 'settings';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AddCar, TranslatePipe],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  imageBaseUrl = (environment as { imageUrl?: string }).imageUrl ?? '';
  carPendingEdit = signal<CarModels | null>(null);
  activeTab = signal<TabId>('overview');

  profile = signal<UserProfile | null>(null);
  cars = signal<CarModels[]>([]);

  loadingProfile = signal(true);
  loadingCars = signal(true);
  errorMsg = signal<string | null>(null);

  totalCars = computed(() => this.cars().length);
  totalValue = computed(() =>
    this.cars().reduce((sum, c) => sum + (c.carPrice || 0), 0)
  );
  newestCar = computed(() => this.cars()[0] ?? null);

  // declare without initializing here
  editForm!: ReturnType<FormBuilder['group']>;
  addCarForm!: ReturnType<FormBuilder['group']>;

  photoFile: File | null = null;
  photoPreview = signal<string | null>(null);
  savingProfile = signal(false);

  addCarImages: File[] = [];
  addCarImagePreviews = signal<string[]>([]);
  submittingCar = signal(false);
  addCarSuccess = signal<string | null>(null);
  addCarError = signal<string | null>(null);

  carPendingDelete = signal<CarModels | null>(null);

  constructor(
    private profileServices: ProfileServices,
    private fb: FormBuilder,
    private router: Router
  ) {
    // build forms here, now that fb is definitely assigned
    this.editForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
    });

    this.addCarForm = this.fb.group({
      city: ['', Validators.required],
      carAge: ['', Validators.required],
      carModel: ['', Validators.required],
      carPrice: [null as number | null, [Validators.required, Validators.min(1)]],
      carType: ['', Validators.required],
      fuelType: ['', Validators.required],

      manufacturer: ['', Validators.required],
      mileage: ['', Validators.required],
      engineVolume: [''],
      cylinders: [null as number | null],
      transmission: [''],
      driveType: [''],
      doors: [''],
      airbags: [null as number | null],
      steeringWheel: [''],
      color: [''],
      interiorColor: [''],
      interiorMaterial: [''],

      isExchangePossible: [false],
      hasTechInspection: [false],
      hasCatalyst: [false],

      description: [''],
      userPhone: ['', Validators.required],
      vinCode: [''],
    });
  }

  ngOnInit(): void {
    this.loadProfile();
    this.loadCars();
  }
  startEdit(car: CarModels) {
    this.carPendingEdit.set(car);
    this.setTab('add');
  }

  onEditComplete() {
    this.carPendingEdit.set(null);
    this.setTab('cars');
    this.loadCars();
  }
  setTab(tab: TabId) {
    this.activeTab.set(tab);
    if (tab === 'add' && !this.carPendingEdit()) {
      // already null, no-op — but if switching tabs away from add without submitting, consider clearing here too
    }
    this.addCarSuccess.set(null);
    this.addCarError.set(null);
  }
  // ---------------- Profile ----------------
  loadProfile() {
    this.loadingProfile.set(true);
    this.profileServices.getMyProfile().subscribe({
      next: (p) => {
        this.profile.set(p);
        this.editForm.patchValue({ firstName: p.firstName, lastName: p.lastName });
        this.loadingProfile.set(false);
      },
      error: (err) => {
        this.errorMsg.set(err.message);
        this.loadingProfile.set(false);
      },
    });
  }

  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const validExt = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validExt.includes(file.type)) {
      this.errorMsg.set('დაუშვებელი ფორმატი');
      return;
    }

    this.photoFile = file;
    const reader = new FileReader();
    reader.onload = () => this.photoPreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }
  saveProfile() {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    this.savingProfile.set(true);
    const { firstName, lastName } = this.editForm.getRawValue();
    this.profileServices
      .updateProfile({
        firstName: firstName!,
        lastName: lastName!,
        userPhoto: this.photoFile,
      })
      .subscribe({
        next: (p) => {
          this.profile.set(p);
          this.savingProfile.set(false);
          this.photoFile = null;
        },
        error: (err) => {
          this.errorMsg.set(err.message);
          this.savingProfile.set(false);
        },
      });
  }

  // ---------------- Cars ----------------
  loadCars() {
    this.loadingCars.set(true);
    this.profileServices.getMyCars().subscribe({
      next: (cars) => {
        this.cars.set(cars);
        this.loadingCars.set(false);
      },
      error: (err) => {
        this.errorMsg.set(err.message);
        this.loadingCars.set(false);
      },
    });
  }

  confirmDelete(car: CarModels) {
    this.carPendingDelete.set(car);
  }

  cancelDelete() {
    this.carPendingDelete.set(null);
  }

  deleteCar(id: number) {
    this.profileServices.deleteCar(id).subscribe({
      next: () => {
        this.cars.update((list) => list.filter((c) => c.id !== id));
        this.carPendingDelete.set(null);
      },
      error: (err) => {
        this.errorMsg.set(err.message);
        this.carPendingDelete.set(null);
      },
    });
  }

  // ---------------- Add car ----------------
  onCarImagesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (this.addCarImages.length + files.length > 6) {
      this.addCarError.set('მაქსიმუმ 6 ფოტოს ატვირთვაა შესაძლებელი.');
      return;
    }
    this.addCarImages.push(...files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () =>
        this.addCarImagePreviews.update((list) => [...list, reader.result as string]);
      reader.readAsDataURL(file);
    });
  }

  removeCarImage(index: number) {
    this.addCarImages.splice(index, 1);
    this.addCarImagePreviews.update((list) => list.filter((_, i) => i !== index));
  }

  submitCar() {
    this.addCarSuccess.set(null);
    this.addCarError.set(null);

    if (this.addCarForm.invalid) {
      this.addCarForm.markAllAsTouched();
      this.addCarError.set('გთხოვთ შეავსოთ სავალდებულო ველები.');
      return;
    }
    if (this.addCarImages.length < 1) {
      this.addCarError.set('საჭიროა მინიმუმ 1 ფოტოს ატვირთვა.');
      return;
    }

    const raw = this.addCarForm.getRawValue();
    const formData = new FormData();
    Object.entries(raw).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key.charAt(0).toUpperCase() + key.slice(1), String(value));
      }
    });
    this.addCarImages.forEach((file) => formData.append('Images', file));

    this.submittingCar.set(true);
    this.profileServices.addCar(formData).subscribe({
      next: (res) => {
        this.addCarSuccess.set('მანქანა წარმატებით დაემატა.');
        this.submittingCar.set(false);
        this.addCarForm.reset();
        this.addCarImages = [];
        this.addCarImagePreviews.set([]);
        this.loadCars();
        setTimeout(() => this.setTab('cars'), 1200);
      },
      error: (err) => {
        this.addCarError.set(err.message);
        this.submittingCar.set(false);
      },
    });
  }

  logout() {
    this.profileServices.logout();
    this.router.navigate(['/auth']);
  }

  trackByCarId(_: number, car: CarModels) {
    return car.id;
  }
}