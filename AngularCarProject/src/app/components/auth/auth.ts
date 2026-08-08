import { Component } from '@angular/core';
import { Login } from "../login/login";


@Component({
  selector: 'app-auth',
  imports: [Login],
  templateUrl: './auth.html',
  styleUrl: './auth.scss',
})
export class Auth {

}
