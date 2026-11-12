import { Component, output } from '@angular/core';
import { TodoPriority } from '../../models/todo';

@Component({
  selector: 'app-todo-form',
  imports: [],
  templateUrl: './todo-form.html',
  styleUrl: './todo-form.css',
})
export class TodoForm {
  readonly add = output<{ title: string; priority: TodoPriority }>();

  /** Appelé sur la touche Entrée */
  protected submit(input: HTMLInputElement, select: HTMLSelectElement): void {
    const title = input.value.trim();
    if (!title) return;
    this.add.emit({ title, priority: select.value as TodoPriority });
    input.value = '';
  }
}
