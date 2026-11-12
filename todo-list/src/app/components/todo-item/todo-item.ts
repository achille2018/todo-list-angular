import { Component, computed, input, output } from '@angular/core';
import { InlineEdit } from '../../directives/inline-edit';
import { nextPriority, PRIORITY_LABELS, Todo, TodoPriority } from '../../models/todo';
import { RelativeTimePipe } from '../../pipes/relative-time-pipe';

@Component({
  selector: 'app-todo-item',
  imports: [InlineEdit, RelativeTimePipe],
  templateUrl: './todo-item.html',
  styleUrl: './todo-item.css',
})
export class TodoItem {
  readonly todo = input.required<Todo>();

  readonly toggle = output<void>();
  readonly rename = output<string>();
  readonly changePriority = output<TodoPriority>();
  readonly remove = output<void>();

  protected readonly priority = computed(() => this.todo().priority ?? 'medium');
  protected readonly priorityLabel = computed(() => PRIORITY_LABELS[this.priority()]);

  /** Un clic sur le badge fait passer à la priorité suivante */
  protected cyclePriority(): void {
    this.changePriority.emit(nextPriority(this.priority()));
  }
}
