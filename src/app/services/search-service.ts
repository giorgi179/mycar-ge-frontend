import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SearchService {
  searchTerm = signal<string>('');

  setSearchTerm(term: string): void {
    this.searchTerm.set(term);
  }
}