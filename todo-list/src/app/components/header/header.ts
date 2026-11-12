import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  protected readonly student = { firstName: 'Achille', lastName: 'SAGANG TANWOUO' };
}
