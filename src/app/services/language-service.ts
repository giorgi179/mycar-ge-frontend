import { Injectable, signal, inject, PLATFORM_ID, REQUEST } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { firstValueFrom } from 'rxjs';

export type LangCode = 'ka' | 'en';

interface TranslationDict {
  [key: string]: any;
}

const LANG_STORAGE_KEY = 'app_lang';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  private translations = signal<Record<LangCode, TranslationDict>>({
    ka: {},
    en: {}
  });

  currentLang = signal<LangCode>('ka');
  isLoaded = signal<boolean>(false);

  private loadedLangs = new Set<LangCode>();

  constructor() {
    const initialLang = this.getInitialLang();
    this.currentLang.set(initialLang);
  }

  private getInitialLang(): LangCode {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem(LANG_STORAGE_KEY) as LangCode | null;
      if (saved === 'ka' || saved === 'en') {
        return saved;
      }
    }
    return 'ka';
  }

  async init(): Promise<void> {
    await this.loadLang(this.currentLang());
    this.isLoaded.set(true);
  }

  private loadLang(lang: LangCode): Promise<void> {
    if (this.loadedLangs.has(lang)) return Promise.resolve();

    const baseUrl = isPlatformBrowser(this.platformId)
      ? ''
      : 'https://mycar-ge-frontend.onrender.com'; // production origin

    return firstValueFrom(
      this.http.get<TranslationDict>(`${baseUrl}/assets/i18n/${lang}.json`)
    ).then(data => {
      this.translations.update(current => ({ ...current, [lang]: data }));
      this.loadedLangs.add(lang);
    }).catch(err => {
      console.error(`ვერ ჩაიტვირთა თარგმანების ფაილი: ${lang}`, err);
      this.translations.update(current => ({ ...current, [lang]: {} }));
    });
  }

  async setLang(lang: LangCode): Promise<void> {
    await this.loadLang(lang);
    this.currentLang.set(lang);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    }
  }

  translate(key: string): string {
    const dict = this.translations()[this.currentLang()];
    const value = this.getNestedValue(dict, key);
    if (value === undefined) {
      const fallbackDict = this.translations()['ka'];
      const fallbackValue = this.getNestedValue(fallbackDict, key);
      return fallbackValue !== undefined ? fallbackValue : key;
    }
    return value;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => {
      return acc && acc[part] !== undefined ? acc[part] : undefined;
    }, obj);
  }
}