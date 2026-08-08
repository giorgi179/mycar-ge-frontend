import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from './components/footer/footer';
import { Header } from './components/header/header';
import { Loader } from "./components/loader/loader";


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Footer, Header, Loader],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('AngularCarProject');
  appLoading = signal<boolean>(true);

  hideAppLoader(): void {
    this.appLoading.set(false);
  }
}
