import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth-service';

// Every [Authorize]-protected endpoint on the backend (add-car,
// get-my-cars, ...) needs a Bearer token on the request. Nothing in
// the app was attaching one, so those calls were silently failing
// with 401. This fixes that globally, once, for every HttpClient call.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getAccessToken();

  if (!token) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });

  return next(authReq);
};