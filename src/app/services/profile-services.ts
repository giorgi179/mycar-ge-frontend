import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';
import { CarModels } from './components';
import { environment } from '../../environments/environment';


export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  userUrl: string | null;
  isVerified: boolean;
}

const API_BASE = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class ProfileServices {
  private profileSubject = new BehaviorSubject<UserProfile | null>(null);
  profile$ = this.profileSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ---- Auth helpers ----
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.profileSubject.next(null);
  }

  private decodeUserIdFromToken(): number | null {
    const token = this.getAccessToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const idClaim =
        payload[
          'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
        ] ?? payload['nameid'] ?? payload['sub'];
      return idClaim ? Number(idClaim) : null;
    } catch {
      return null;
    }
  }

  getMyProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${API_BASE}/User/get-current-user`).pipe(
      tap((profile) => this.profileSubject.next(profile)),
      catchError(this.handleError)
    );
  }

  updateProfile(data: {
    firstName: string;
    lastName: string;
    userPhoto?: File | null;
  }): Observable<UserProfile> {
    const formData = new FormData();
    formData.append('firstName', data.firstName);
    formData.append('lastName', data.lastName);
    if (data.userPhoto) {
      formData.append('userPhoto', data.userPhoto);
    }
    return this.http
      .put<UserProfile>(`${API_BASE}/User/update-user`, formData)
      .pipe(
        tap((profile) => this.profileSubject.next(profile)),
        catchError(this.handleError)
      );
  }

  deleteAccount(email: string): Observable<{ message: string }> {
    return this.http
      .delete<{ message: string }>(`${API_BASE}/User/delete-user`, {
        body: email,
      })
      .pipe(catchError(this.handleError));
  }

  // ---- Cars ----
  getMyCars(): Observable<CarModels[]> {
    return this.http
      .get<CarModels[]>(`${API_BASE}/Car/get-my-cars`)
      .pipe(catchError(this.handleError));
  }

  deleteCar(id: number): Observable<string> {
    return this.http
      .delete(`${API_BASE}/Car/car-${id}-detele`, { responseType: 'text' })
      .pipe(catchError(this.handleError));
  }

  addCar(payload: FormData): Observable<{ message: string; carId: number }> {
    return this.http
      .post<{ message: string; carId: number }>(
        `${API_BASE}/Car/add-car`,
        payload
      )
      .pipe(catchError(this.handleError));
  }

  private handleError(err: HttpErrorResponse) {
    const message =
      typeof err.error === 'string'
        ? err.error
        : err.error?.message || 'დაფიქსირდა შეცდომა. სცადეთ თავიდან.';
    return throwError(() => new Error(message));
  }
}