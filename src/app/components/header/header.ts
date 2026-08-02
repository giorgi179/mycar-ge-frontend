import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { LanguageSelector } from "../language-selector/language-selector";
import { AuthService } from '../../services/auth-service';
import { TranslatePipe } from "../../pipes/translate.pipe";
import { SearchService } from '../../services/search-service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, LanguageSelector, TranslatePipe],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {

  auth = inject(AuthService);
  router = inject(Router);
  searchService = inject(SearchService);

  isMenuOpen = false;
  showAuthPrompt = signal(false);
  private searchDebounce: ReturnType<typeof setTimeout> | null = null;

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (this.searchDebounce) {
      clearTimeout(this.searchDebounce);
    }
    this.searchDebounce = setTimeout(() => {
      this.searchService.setSearchTerm(value);
    }, 350);
  }

  onAddListingClick(event: Event): void {
    event.preventDefault();
    if (!this.auth.isLoggedIn()) {
      this.showAuthPrompt.update(v => !v);
    } else {
      this.closeMenu();
      this.router.navigate(['/add-car']);
    }
  }

  closeAuthPrompt(): void {
    this.showAuthPrompt.set(false);
  }

}