import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TodoFilter } from '../../models/todo';

@Component({
  selector: 'app-todo-filter',
  imports: [RouterLink],
  templateUrl: './todo-filter.html',
  styleUrl: './todo-filter.css',
})
export class TodoFilterBar {
  readonly current = input<TodoFilter>('all');

  protected readonly filters: { value: TodoFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'In Progress' },
    { value: 'done', label: 'Done' },
  ];
}
