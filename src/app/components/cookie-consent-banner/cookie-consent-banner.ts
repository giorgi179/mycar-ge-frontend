import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { CookieConsentService } from '../../services/cookie-consent-service';

@Component({
  selector: 'app-cookie-consent-banner',
  imports: [TranslatePipe, RouterLink],
  templateUrl: './cookie-consent-banner.html',
  styleUrl: './cookie-consent-banner.scss',
})
export class CookieConsentBanner {
  consent = inject(CookieConsentService);

  acceptAll(): void {
    this.consent.acceptAll();
  }

  rejectNonEssential(): void {
    this.consent.rejectNonEssential();
  }
}