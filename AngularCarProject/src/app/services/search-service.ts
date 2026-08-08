import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  searchTerm = signal<string>('');

  setSearchTerm(value: string): void {
    this.searchTerm.set(value);
  }


  clearSearch(): void {
    this.searchTerm.set('');
  }

}