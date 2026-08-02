import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import { CarModels, CarSearchParams } from './components';
import { LanguageService } from './language-service';



@Injectable({
    providedIn: 'root'
})
export class HomeService {
    private http = inject(HttpClient);
    private langService = inject(LanguageService);
    // private translationApi = inject(TranslationApiService);
    private api = environment.apiUrl;

    getAllCar(): Observable<CarModels[]> {
        

        return this.http.get<CarModels[]>(`${this.api}/Car/get-all-car`)
    }

    searchCars(searchTerm: string): Observable<CarModels[]> {
        let httpParams = new HttpParams().set('searchTerm', searchTerm);
        

        return this.http.get<CarModels[]>(`${this.api}/Car/get-car-search`, { params: httpParams })
            ;
    }

    // private translateCars(cars: CarModels[]): Observable<CarModels[]> {
    //     const carModels = cars.map(c => c.carModel);
    //     const cities = cars.map(c => c.city);
    //     const carTypes = cars.map(c => c.carType);
    //     const fuelTypes = cars.map(c => c.fuelType);

    //     return forkJoin({
    //         translatedModels: this.translationApi.translateBatch(carModels, 'en'),
    //         translatedCities: this.translationApi.translateBatch(cities, 'en'),
    //         translatedCarTypes: this.translationApi.translateBatch(carTypes, 'en'),
    //         translatedFuelTypes: this.translationApi.translateBatch(fuelTypes, 'en')
    //     }).pipe(
    //         map(({ translatedModels, translatedCities, translatedCarTypes, translatedFuelTypes }) => {
    //             return cars.map((car, i) => ({
    //                 ...car,
    //                 carModel: translatedModels[i],
    //                 city: translatedCities[i],
    //                 carType: translatedCarTypes[i],
    //                 fuelType: translatedFuelTypes[i]
    //             }));
    //         })
    //     );
    // }
}