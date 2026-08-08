import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private api = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  showPassword = false;
  loginError: string | null = null;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  onSubmit(): void {
    this.loginError = null;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const raw = this.loginForm.getRawValue();
    const formValue = {
      email: raw.email ?? '',
      password: raw.password ?? ''
    };

    this.api.loginUser(formValue).subscribe({
      next: (token) => {
        this.api.setToken(token);
        this.router.navigate(['/']);
      },
      error: (err) => {
        if (err.error === 'User is not verified.') {
          this.loginError = 'auth.errors.userNotVerified';
        } else if (err.status === 401 || err.status === 400) {
          this.loginError = 'auth.errors.invalidCredentials';
        } else {
          this.loginError = 'auth.errors.loginFailed';
        }
        console.error(err);
      }
    });
  }
}