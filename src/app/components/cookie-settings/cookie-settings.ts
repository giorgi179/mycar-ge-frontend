import { Component, inject, signal, effect } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { CookieConsentService } from '../../services/cookie-consent-service';

@Component({
  selector: 'app-cookie-settings',
  imports: [TranslatePipe],
  templateUrl: './cookie-settings.html',
  styleUrl: './cookie-settings.scss',
})
export class CookieSettings {
  consent = inject(CookieConsentService);

  analytics = signal(false);
  marketing = signal(false);
  savedJustNow = signal(false);

  constructor() {
    effect(() => {
      const prefs = this.consent.preferences();
      if (prefs) {
        this.analytics.set(prefs.analytics);
        this.marketing.set(prefs.marketing);
      }
    });
  }

  toggleAnalytics(): void {
    this.analytics.update(v => !v);
  }

  toggleMarketing(): void {
    this.marketing.update(v => !v);
  }

  acceptAll(): void {
    this.consent.acceptAll();
    this.analytics.set(true);
    this.marketing.set(true);
    this.flashSaved();
  }

  rejectAll(): void {
    this.consent.rejectNonEssential();
    this.analytics.set(false);
    this.marketing.set(false);
    this.flashSaved();
  }

  savePreferences(): void {
    this.consent.savePreferences(this.analytics(), this.marketing());
    this.flashSaved();
  }

  private flashSaved(): void {
    this.savedJustNow.set(true);
    setTimeout(() => this.savedJustNow.set(false), 2500);
  }
}