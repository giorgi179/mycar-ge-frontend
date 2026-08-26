import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-contact',
  imports: [TranslatePipe, FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  private http = inject(HttpClient);

  name = '';
  email = '';
  phone = '';
  subject = '';
  message = '';

  status = signal<'idle' | 'sending' | 'success' | 'error'>('idle');
  errorMessage = signal('');

  submit(): void {
    if (!this.name.trim() || !this.email.trim() || !this.subject.trim() || this.message.trim().length < 10) {
      this.status.set('error');
      this.errorMessage.set('');
      return;
    }

    this.status.set('sending');

    this.http
      .post<{ message: string }>(`${environment.apiUrl}/Contact/send`, {
        name: this.name,
        email: this.email,
        phone: this.phone || null,
        subject: this.subject,
        message: this.message,
      })
      .subscribe({
        next: () => {
          this.status.set('success');
          this.name = '';
          this.email = '';
          this.phone = '';
          this.subject = '';
          this.message = '';
        },
        error: (err) => {
          this.status.set('error');
          this.errorMessage.set(err?.error?.message ?? '');
        },
      });
  }
}