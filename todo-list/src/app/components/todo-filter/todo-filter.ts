import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TodoCounts, TodoFilter, TodoSort } from '../../models/todo';

@Component({
  selector: 'app-todo-filter',
  imports: [RouterLink],
  templateUrl: './todo-filter.html',
  styleUrl: './todo-filter.css',
})
export class TodoFilterBar {
  readonly current = input<TodoFilter>('all');
  readonly counts = input<TodoCounts>({ all: 0, active: 0, done: 0, urgent: 0 });
  readonly sort = input<TodoSort>('priority');
  readonly sortChange = output<TodoSort>();

  protected readonly filters: { value: TodoFilter; label: string; count: keyof TodoCounts }[] = [
    { value: 'all', label: 'All', count: 'all' },
    { value: 'active', label: 'In Progress', count: 'active' },
    { value: 'done', label: 'Done', count: 'done' },
  ];

  /** Position de la pastille qui glisse sous le filtre actif */
  protected readonly activeIndex = computed(() =>
    Math.max(0, this.filters.findIndex((f) => f.value === this.current())),
  );
}
