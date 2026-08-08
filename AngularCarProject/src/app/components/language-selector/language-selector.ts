import { Component, inject, signal, HostListener, ElementRef } from '@angular/core';

import { TranslatePipe } from '../../pipes/translate.pipe';
import { LangCode, LanguageService } from '../../services/language-service';

interface LangOption {
  code: LangCode;
  label: string;
  enabled: boolean;
}

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './language-selector.html',
  styleUrl: './language-selector.scss'
})
export class LanguageSelector {
  langService = inject(LanguageService);
  private elRef = inject(ElementRef);

  isOpen = signal<boolean>(false);

  options: LangOption[] = [
    { code: 'ka', label: 'Georgian', enabled: true },
    { code: 'en', label: 'English', enabled: true }
  ];

  toggleDropdown(): void {
    this.isOpen.update(v => !v);
  }

  async selectLang(code: LangCode): Promise<void> {
    await this.langService.setLang(code);
    this.isOpen.set(false);
  }

  currentLabel(): string {
    const current = this.options.find(o => o.code === this.langService.currentLang());
    return current ? current.label : 'Language';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}