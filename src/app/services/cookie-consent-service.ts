import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface CookiePreferences {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
}

const STORAGE_KEY = 'cookie_consent_v1';

@Injectable({ providedIn: 'root' })
export class CookieConsentService {
  private platformId = inject(PLATFORM_ID);
  preferences = signal<CookiePreferences | null>(null);

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CookiePreferences;
        this.preferences.set({ necessary: true, analytics: !!parsed.analytics, marketing: !!parsed.marketing });
      }
    } catch {
      this.preferences.set(null);
    }
  }

  private persist(prefs: CookiePreferences): void {
    this.preferences.set(prefs);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    }
  }

  hasChoice(): boolean {
    return this.preferences() !== null;
  }

  acceptAll(): void {
    this.persist({ necessary: true, analytics: true, marketing: true });
  }

  rejectNonEssential(): void {
    this.persist({ necessary: true, analytics: false, marketing: false });
  }

  savePreferences(analytics: boolean, marketing: boolean): void {
    this.persist({ necessary: true, analytics, marketing });
  }

  resetChoice(): void {
    this.preferences.set(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}