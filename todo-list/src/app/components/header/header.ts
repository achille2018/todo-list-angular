import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  /** À compléter avec les noms et prénoms des membres du groupe */
  protected readonly students = [
    { firstName: 'Achille', lastName: 'SAGANG TANWOUO' },
  ];
}
