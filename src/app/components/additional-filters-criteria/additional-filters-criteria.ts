import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';

export interface AdditionalFiltersCriteriaValue {
  transmission: string | null;
  cylinders: number | null;
  airbags: number | null;

  steeringWheel: 'მარცხენა' | 'მარჯვენა' | null;
  driveType: 'წინა' | 'უკანა' | '4x4' | null;
  doors: '2/3' | '4/5' | '>5' | null;
  hasTechInspection: boolean | null;
  hasCatalyst: boolean | null;

  color: string[];
  interiorMaterial: string[];
  interiorColor: string[];

  isExchangePossible: boolean;
}

@Component({
  selector: 'app-additional-filters-criteria',
  imports: [TranslatePipe],
  templateUrl: './additional-filters-criteria.html',
  styleUrl: './additional-filters-criteria.scss',
})
export class AdditionalFiltersCriteria {
  @Input() isOpen = false;

  @Output() close = new EventEmitter<void>();
  @Output() apply = new EventEmitter<AdditionalFiltersCriteriaValue>();
  @Output() clearFilters = new EventEmitter<void>();

  // --- Vehicle Information ---
  transmission = signal<string | null>(null);
  cylinders = signal<number | null>(null);
  airbags = signal<number | null>(null);

  transmissionList = ['ავტომატიკა', 'მექანიკა', 'ვარიატორი'];
  cylindersList = [3, 4, 6, 8, 10, 12];
  airbagsList = [2, 4, 6, 8, 9, 10];

  // --- Additional features ---
  steeringWheel = signal<'მარცხენა' | 'მარჯვენა' | null>(null);
  driveType = signal<'წინა' | 'უკანა' | '4x4' | null>(null);
  doors = signal<'2/3' | '4/5' | '>5' | null>(null);
  hasTechInspection = signal<boolean | null>(null);
  hasCatalyst = signal<boolean | null>(null);

  // --- Car Color ---
  carColorList = ['თეთრი', 'შავი', 'ვერცხლისფერი', 'ნაცრისფერი', 'წითელი', 'ლურჯი'];
  otherCarColors = ['ყავისფერი', 'ბეჟი', 'მწვანე', 'ყვითელი', 'ნარინჯისფერი', 'იისფერი'];
  showOtherCarColors = signal(false);
  selectedCarColors = signal<Set<string>>(new Set());

  // --- Interior material / color ---
  interiorMaterialList = ['ნაჭერი', 'ხელოვნური ტყავი', 'ალკანტარა', 'ტყავი', 'კომბინირებული'];
  selectedInteriorMaterial = signal<Set<string>>(new Set());

  interiorColorList = ['შავი', 'თეთრი', 'ნაცრისფერი', 'ყავისფერი', 'ბეჟი', 'წითელი'];
  selectedInteriorColors = signal<Set<string>>(new Set());

  // --- Exchange ---
  isExchangePossible = signal(false);

  private toggleInSet<T>(sig: ReturnType<typeof signal<Set<T>>>, value: T): void {
    sig.update(current => {
      const next = new Set(current);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  }

  toggleCarColor(color: string): void {
    if (color === 'all') {
      this.selectedCarColors.set(new Set([...this.carColorList, ...this.otherCarColors]));
      return;
    }
    this.toggleInSet(this.selectedCarColors, color);
  }

  toggleInteriorMaterial(value: string): void {
    this.toggleInSet(this.selectedInteriorMaterial, value);
  }

  toggleInteriorColor(color: string): void {
    if (color === 'all') {
      this.selectedInteriorColors.set(new Set(this.interiorColorList));
      return;
    }
    this.toggleInSet(this.selectedInteriorColors, color);
  }

  private selectSingle<T>(sig: ReturnType<typeof signal<T | null>>, value: T): void {
    sig.update(current => (current === value ? null : value));
  }

  selectTransmission(value: string): void {
    this.selectSingle(this.transmission, value);
  }

  selectSteeringWheel(value: 'მარცხენა' | 'მარჯვენა'): void {
    this.selectSingle(this.steeringWheel, value);
  }

  selectDriveType(value: 'წინა' | 'უკანა' | '4x4'): void {
    this.selectSingle(this.driveType, value);
  }

  selectDoors(value: '2/3' | '4/5' | '>5'): void {
    this.selectSingle(this.doors, value);
  }

  selectCylinders(value: number): void {
    this.selectSingle(this.cylinders, value);
  }

  selectAirbags(value: number): void {
    this.selectSingle(this.airbags, value);
  }

  selectTechInspection(value: boolean): void {
    this.hasTechInspection.update(current => (current === value ? null : value));
  }

  selectCatalyst(value: boolean): void {
    this.hasCatalyst.update(current => (current === value ? null : value));
  }

  toggleExchange(): void {
    this.isExchangePossible.update(v => !v);
  }

  toggleShowOtherCarColors(): void {
    this.showOtherCarColors.update(v => !v);
  }

  onClose(): void {
    this.close.emit();
  }

  onClearFilters(): void {
    this.transmission.set(null);
    this.cylinders.set(null);
    this.airbags.set(null);
    this.steeringWheel.set(null);
    this.driveType.set(null);
    this.doors.set(null);
    this.hasTechInspection.set(null);
    this.hasCatalyst.set(null);
    this.selectedCarColors.set(new Set());
    this.selectedInteriorMaterial.set(new Set());
    this.selectedInteriorColors.set(new Set());
    this.isExchangePossible.set(false);
    this.clearFilters.emit();
  }

  onChoose(): void {
    const criteria: AdditionalFiltersCriteriaValue = {
      transmission: this.transmission(),
      cylinders: this.cylinders(),
      airbags: this.airbags(),
      steeringWheel: this.steeringWheel(),
      driveType: this.driveType(),
      doors: this.doors(),
      hasTechInspection: this.hasTechInspection(),
      hasCatalyst: this.hasCatalyst(),
      color: Array.from(this.selectedCarColors()),
      interiorMaterial: Array.from(this.selectedInteriorMaterial()),
      interiorColor: Array.from(this.selectedInteriorColors()),
      isExchangePossible: this.isExchangePossible(),
    };
    this.apply.emit(criteria);
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('additional-filters__backdrop')) {
      this.onClose();
    }
  }
}