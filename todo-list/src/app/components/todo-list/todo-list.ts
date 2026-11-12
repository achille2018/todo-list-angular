import { Component, computed, input, output } from '@angular/core';
import { Todo, TodoFilter, TodoPriority } from '../../models/todo';
import { TodoItem } from '../todo-item/todo-item';

const EMPTY_MESSAGES: Record<TodoFilter, { title: string; text: string }> = {
  all: { title: 'Aucune tâche', text: 'Ajoutez votre première tâche ci-dessus.' },
  active: { title: 'Rien en cours', text: 'Tout est fait… profitez-en !' },
  done: { title: 'Rien de terminé', text: 'Cochez une tâche pour la voir ici.' },
};

@Component({
  selector: 'app-todo-list',
  imports: [TodoItem],
  templateUrl: './todo-list.html',
  styleUrl: './todo-list.css',
})
export class TodoList {
  readonly todos = input<Todo[]>([]);
  readonly filter = input<TodoFilter>('all');
  readonly loading = input(false);

  readonly toggle = output<Todo>();
  readonly rename = output<{ todo: Todo; title: string }>();
  readonly changePriority = output<{ todo: Todo; priority: TodoPriority }>();
  readonly remove = output<Todo>();

  protected readonly empty = computed(() => EMPTY_MESSAGES[this.filter()]);
  protected readonly skeletons = [0, 1, 2];
}
