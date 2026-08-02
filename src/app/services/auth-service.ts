import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import { Login, UserRegister, UserToken, Veryfi } from './components';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private api = environment.apiUrl;
    private platformId = inject(PLATFORM_ID);
    private isBrowser = isPlatformBrowser(this.platformId);

    isLoggedIn = signal<boolean>(this.hasToken());

    private hasToken(): boolean {
        if (!this.isBrowser) return false;
        return !!localStorage.getItem('accessToken');
    }

    register(user: UserRegister): Observable<any> {
        const formData = new FormData();
        formData.append('firstName', user.firstName);
        formData.append('lastName', user.lastName);
        formData.append('email', user.email);
        formData.append('password', user.password);
        formData.append('reEnterPassword', user.reEnterPassword);
        if (user.userPhoto) {
            formData.append('userPhoto', user.userPhoto);
        }
        return this.http.post(`${this.api}/User/register-user`, formData);
    }

    veryfi(verifi: Veryfi): Observable<any> {
        return this.http.post(`${this.api}/User/verify-user`, verifi);
    }

    loginUser(user: Login): Observable<UserToken> {
        return this.http.post<UserToken>(`${this.api}/User/login-user`, user);
    }

    getAccessToken(): string | null {
        if (!this.isBrowser) return null;
        return localStorage.getItem('accessToken');
    }

    getRefreshToken(): string | null {
        if (!this.isBrowser) return null;
        return localStorage.getItem('refreshToken');
    }

    setToken(token: UserToken): void {
        if (!this.isBrowser) return;
        localStorage.setItem('accessToken', token.accessToken);
        localStorage.setItem('refreshToken', token.refreshToken);
        this.isLoggedIn.set(true);
    }

    logout(): void {
        if (!this.isBrowser) return;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        this.isLoggedIn.set(false);
    }
}