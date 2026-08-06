import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CarAddRequest, CarModels } from './components';


@Injectable({
  providedIn: 'root'
})
export class AddCarServices {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  getManufacturers(): Observable<{ name: string }[]> {
    return this.http.get<{ name: string }[]>(`${this.api}/Car/get-manufacturers`);
  }

  getUserCars(userId: number): Observable<CarModels[]> {
    return this.http.get<CarModels[]>(`${this.api}/api/Car/user/${userId}`);
  }

  addCar(request: CarAddRequest): Observable<any> {
    const formData = new FormData();

    formData.append('City', request.city);
    formData.append('CarAge', request.carAge);
    formData.append('CarModel', request.carModel);
    formData.append('CarPrice', request.carPrice.toString());
    formData.append('CarType', request.carType);
    formData.append('FuelType', request.fuelType);

    formData.append('Manufacturer', request.manufacturer);
    formData.append('Mileage', request.mileage);
    formData.append('EngineVolume', request.engineVolume);
    formData.append('Cylinders', request.cylinders.toString());
    formData.append('Transmission', request.transmission);
    formData.append('DriveType', request.driveType);
    formData.append('Doors', request.doors);
    formData.append('Airbags', request.airbags.toString());
    formData.append('SteeringWheel', request.steeringWheel);
    formData.append('Color', request.color);
    formData.append('InteriorColor', request.interiorColor);
    formData.append('InteriorMaterial', request.interiorMaterial);

    formData.append('IsExchangePossible', String(request.isExchangePossible));
    formData.append('HasTechInspection', String(request.hasTechInspection));
    formData.append('HasCatalyst', String(request.hasCatalyst));

    formData.append('Description', request.description);
    formData.append('UserPhone', request.userPhone);
    formData.append('VinCode', request.vinCode);

    request.images.forEach(file => {
      formData.append('Images', file, file.name);
    });

    return this.http.post(`${this.api}/api/Car/add-car`, formData);
  }
}