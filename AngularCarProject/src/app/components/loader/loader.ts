import {
  Component, EventEmitter, Inject, Input, OnChanges, OnDestroy,
  OnInit, Output, PLATFORM_ID, SimpleChanges
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslatePipe } from "../../pipes/translate.pipe";

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './loader.html',
  styleUrls: ['./loader.scss']
})
export class Loader implements OnInit, OnChanges, OnDestroy {
  @Input() progress: number | null = null;
  @Input() brand = 'AUTOHOUSE';
  @Input() tagline: string | null = null;
  @Output() done = new EventEmitter<void>();

  displayProgress = 0;
  gatesOpen = false;
  

  private simInterval?: ReturnType<typeof setInterval>;
  private raf?: number;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return; // სერვერზე საერთოდ არაფერს ვაკეთებთ
    if (this.progress === null) {
      this.simulateProgress();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.isBrowser) return;
    if (changes['progress'] && this.progress !== null) {
      this.animateTo(this.progress);
    }
  }

  private simulateProgress(): void {
    let value = 0;
    this.simInterval = setInterval(() => {
      value += Math.random() * 9 + 3;
      if (value >= 100) {
        value = 100;
        this.animateTo(value);
        if (this.simInterval) clearInterval(this.simInterval);
        return;
      }
      this.animateTo(value);
    }, 260);
  }

  private animateTo(target: number): void {
    if (!this.isBrowser) return;
    const start = this.displayProgress;
    const startTime = performance.now();
    const duration = 400;

    const step = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      this.displayProgress = Math.round(start + (target - start) * eased);
      if (t < 1) {
        this.raf = requestAnimationFrame(step);
      } else if (target >= 100) {
        this.finish();
      }
    };

    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame(step);
  }

  private finish(): void {
    setTimeout(() => {
      this.gatesOpen = true;
      setTimeout(() => this.done.emit(), 900);
    }, 300);
  }

  ngOnDestroy(): void {
    if (this.simInterval) clearInterval(this.simInterval);
    if (this.raf) cancelAnimationFrame(this.raf);
  }
}