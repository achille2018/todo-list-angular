import { Component, input } from '@angular/core';
import { TodoFilter } from '../../models/todo';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  readonly count = input(0);
  readonly filter = input<TodoFilter>('all');

  protected readonly labels: Record<TodoFilter, string> = {
    all: 'au total',
    active: 'en cours',
    done: 'terminée(s)',
  };
}
