import { Component } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-terms-of-service',
  imports: [TranslatePipe],
  templateUrl: './terms-of-service.html',
  styleUrl: './terms-of-service.scss',
})
export class TermsOfService {}