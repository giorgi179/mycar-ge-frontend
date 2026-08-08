import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { LanguageSelector } from "../language-selector/language-selector";
import { AuthService } from '../../services/auth-service';
import { TranslatePipe } from "../../pipes/translate.pipe";
import { SearchService } from '../../services/search-service';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    LanguageSelector,
    TranslatePipe
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {


  auth = inject(AuthService);

  router = inject(Router);

  searchService = inject(SearchService);



  isMenuOpen = false;

  showAuthPrompt = signal(false);



  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }



  closeMenu(): void {
    this.isMenuOpen = false;
  }





  onSearchInput(event: Event): void {


    const value =
      (event.target as HTMLInputElement).value.trim();



    this.searchService.setSearchTerm(value);



    // თუ წაიშალა ტექსტი
    if (!value) {


      this.searchService.clearSearch();



      this.router.navigate(['/cars'], {

        queryParams: {
          search: null
        },

        queryParamsHandling: 'merge'

      });


    }


  }





  searchCars(): void {


    const term =
      this.searchService.searchTerm().trim();



    if (!term) {

      this.router.navigate(['/cars'], {

        queryParams: {
          search: null
        },

        queryParamsHandling: 'merge'

      });

      return;

    }


    this.router.navigate(['/cars'], {


      queryParams: {

        search: term

      },

      queryParamsHandling: 'merge'


    });

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