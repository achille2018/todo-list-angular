import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  /** Membres du groupe affichés dans l'en-tête */
  protected readonly students = [
    { firstName: 'Achille', lastName: 'SAGANG TANWOUO' },
    { firstName: 'Jules', lastName: 'FILLOUX' },
  ];
}
