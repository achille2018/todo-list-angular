import { Component, input, output } from '@angular/core';
import { InlineEdit } from '../../directives/inline-edit';
import { Todo, TodoPriority } from '../../models/todo';

@Component({
  selector: 'app-todo-item',
  imports: [InlineEdit],
  templateUrl: './todo-item.html',
  styleUrl: './todo-item.css',
})
export class TodoItem {
  readonly todo = input.required<Todo>();

  readonly toggle = output<void>();
  readonly rename = output<string>();
  readonly changePriority = output<TodoPriority>();
  readonly remove = output<void>();

  protected onPriorityChange(select: HTMLSelectElement): void {
    this.changePriority.emit(select.value as TodoPriority);
  }

  /** Demande une confirmation avant de supprimer */
  protected onDelete(): void {
    if (confirm('Supprimer cette tâche ?')) {
      this.remove.emit();
    }
  }
}
