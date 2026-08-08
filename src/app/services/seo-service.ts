import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

export interface SeoData {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  noindex?: boolean;
}

/**
 * ცენტრალიზებული SEO სერვისი — მართავს <title>, meta description/keywords,
 * Open Graph, Twitter Card და canonical ტეგებს ყველა გვერდისთვის.
 * SSR-თან თავსებადია (Angular Universal).
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly siteName = 'MyCar.ge';
  private readonly defaultImage = 'https://mycar.ge/assets/og-default.jpg';
  private readonly baseUrl = 'https://mycar.ge';

  constructor(
    private titleService: Title,
    private meta: Meta,
    @Inject(DOCUMENT) private doc: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  update(data: SeoData): void {
    const fullTitle = data.title.includes(this.siteName)
      ? data.title
      : `${data.title} | ${this.siteName}`;
    const url = data.url ? `${this.baseUrl}${data.url}` : this.doc.location?.href || this.baseUrl;
    const image = data.image || this.defaultImage;

    this.titleService.setTitle(fullTitle);

    this.setTag('description', data.description);
    if (data.keywords) {
      this.setTag('keywords', data.keywords);
    }
    this.setTag('robots', data.noindex ? 'noindex, nofollow' : 'index, follow');

    // Open Graph
    this.setProperty('og:site_name', this.siteName);
    this.setProperty('og:title', fullTitle);
    this.setProperty('og:description', data.description);
    this.setProperty('og:type', data.type || 'website');
    this.setProperty('og:url', url);
    this.setProperty('og:image', image);
    this.setProperty('og:locale', 'ka_GE');

    // Twitter Card
    this.setTag('twitter:card', 'summary_large_image');
    this.setTag('twitter:title', fullTitle);
    this.setTag('twitter:description', data.description);
    this.setTag('twitter:image', image);

    this.setCanonical(url);
  }

  /** JSON-LD structured data ჩასმა/განახლება <head>-ში (Product/Vehicle schema.org) */
  setJsonLd(schema: Record<string, any>): void {
    this.removeJsonLd();
    const script = this.doc.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'structured-data';
    script.text = JSON.stringify(schema);
    this.doc.head.appendChild(script);
  }

  removeJsonLd(): void {
    const existing = this.doc.getElementById('structured-data');
    if (existing) {
      existing.remove();
    }
  }

  private setTag(name: string, content: string): void {
    this.meta.updateTag({ name, content });
  }

  private setProperty(property: string, content: string): void {
    this.meta.updateTag({ property, content });
  }

  private setCanonical(url: string): void {
    let link: HTMLLinkElement | null = this.doc.querySelector('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}