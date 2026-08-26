import { Component, signal } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';

interface FaqItem {
  qKey: string;
  aKey: string;
}

@Component({
  selector: 'app-faq',
  imports: [TranslatePipe],
  templateUrl: './faq.html',
  styleUrl: './faq.scss',
})
export class Faq {
  openIndex = signal<number | null>(0);

  items: FaqItem[] = [
    { qKey: 'faq.q1', aKey: 'faq.a1' },
    { qKey: 'faq.q2', aKey: 'faq.a2' },
    { qKey: 'faq.q3', aKey: 'faq.a3' },
    { qKey: 'faq.q4', aKey: 'faq.a4' },
    { qKey: 'faq.q5', aKey: 'faq.a5' },
    { qKey: 'faq.q6', aKey: 'faq.a6' },
  ];

  toggle(index: number): void {
    this.openIndex.set(this.openIndex() === index ? null : index);
  }
}