import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { TranslatePipe } from "../../pipes/translate.pipe";

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, TranslatePipe,RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private api = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  showPassword = false;
  showRePassword = false;
  showReRandomCode = false;

  registerError = '';
  verifyError = '';

  registerForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    reEnterPassword: ['', Validators.required],
    userPhoto: [null as File | null]
  });

  verifyForm = this.fb.group({
    verificationCode: ['', Validators.required]
  });

  back(){
    this.showReRandomCode = false
    localStorage.removeItem('pendingVerificationEmail');
  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.registerForm.patchValue({ userPhoto: input.files[0] });
    }
  }

  onSubmit(): void {
    this.registerError = '';

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const formValue = this.registerForm.value;

    if (formValue.password !== formValue.reEnterPassword) {
      this.registerError = 'auth.errors.passwordMismatch';
      return;
    }

    this.api.register({
      firstName: formValue.firstName!,
      lastName: formValue.lastName!,
      email: formValue.email!,
      password: formValue.password!,
      reEnterPassword: formValue.reEnterPassword!,
      userPhoto: formValue.userPhoto ?? null
    }).subscribe({
      next: () => {
        this.showReRandomCode = true;
        localStorage.setItem('pendingVerificationEmail', formValue.email!);
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err.status === 400 && typeof err.error === 'string' && err.error.toLowerCase().includes('email already exists')) {
          this.registerError = 'auth.errors.emailExists';
        } else if (err.status === 400 && typeof err.error === 'string' && err.error.toLowerCase().includes('image files')) {
          this.registerError = 'auth.errors.invalidFileType';
        } else if (err.status === 400 && typeof err.error === 'string' && err.error.toLowerCase().includes('5mb')) {
          this.registerError = 'auth.errors.fileTooLarge';
        } else {
          this.registerError = 'auth.errors.registerFailed';
        }
        this.cdr.detectChanges();
      }
    });
  }

  onVerify(): void {
    this.verifyError = '';

    if (this.verifyForm.invalid) {
      this.verifyForm.markAllAsTouched();
      return;
    }

    const code = this.verifyForm.get('verificationCode')?.value;
    const email = localStorage.getItem('pendingVerificationEmail');

    if (!email) {
      this.verifyError = 'auth.errors.emailNotFound';
      return;
    }

    this.api.veryfi({ email, verificationCode: code! }).subscribe({
      next: () => {
        localStorage.removeItem('pendingVerificationEmail');
        this.router.navigate(['/auth']);
      },
      error: (err) => {
        if (err.status === 400 && typeof err.error === 'string' && err.error.toLowerCase().includes('expired')) {
          this.verifyError = 'auth.errors.codeExpired';
        } else if (err.status === 400 && typeof err.error === 'string' && err.error.toLowerCase().includes('invalid')) {
          this.verifyError = 'auth.errors.codeInvalid';
        } else if (err.status === 404) {
          this.verifyError = 'auth.errors.emailNotFound';
        } else {
          this.verifyError = 'auth.errors.verifyFailed';
        }
        this.cdr.detectChanges();
      }
    });
  }
  
}