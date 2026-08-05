import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import { CarModels } from './components';

import { CarListItem } from '../components/home-filtre/home-filtre';

export interface ManufacturerCount {
    name: string;
    count: number;
}

export interface HomeStats {
    totalCars: number;
    totalCities: number;
    totalBrands: number;
}

@Injectable({
    providedIn: 'root'
})
export class HomeService {
    private http = inject(HttpClient);

    private api = environment.apiUrl;

    getAllCar(): Observable<CarListItem[]> {
        return this.http.get<CarListItem[]>(
            `${this.api}/Car/get-all-car`
        );
    }

    searchCars(searchTerm: string): Observable<CarModels[]> {
        let httpParams = new HttpParams().set('searchTerm', searchTerm);
        return this.http.get<CarModels[]>(`${this.api}/Car/get-car-search`, { params: httpParams });
    }

    getCarById(id: number): Observable<CarModels> {
        return this.http.get<CarModels>(
            `${this.api}/Car/get-car-id/${id}`
        );
    }

    getManufacturers(): Observable<ManufacturerCount[]> {
        return this.http.get<ManufacturerCount[]>(
            `${this.api}/Car/get-manufacturers`
        );
    }

    getStats(): Observable<HomeStats> {
        return this.http.get<HomeStats>(
            `${this.api}/Car/get-stats`
        );
    }
}