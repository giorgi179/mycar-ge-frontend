import { Component } from '@angular/core';
import { TranslatePipe } from "../../pipes/translate.pipe";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-eror-page',
  imports: [TranslatePipe,RouterLink],
  templateUrl: './eror-page.html',
  styleUrl: './eror-page.scss',
})
export class ErorPage {}
