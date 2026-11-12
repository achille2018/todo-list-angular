import { Component, output, signal } from '@angular/core';
import { PRIORITIES, PRIORITY_LABELS, TodoPriority } from '../../models/todo';

@Component({
  selector: 'app-todo-form',
  imports: [],
  templateUrl: './todo-form.html',
  styleUrl: './todo-form.css',
})
export class TodoForm {
  readonly add = output<{ title: string; priority: TodoPriority }>();

  protected readonly priorities = PRIORITIES;
  protected readonly labels = PRIORITY_LABELS;
  protected readonly priority = signal<TodoPriority>('medium');
  /** Déclenche une petite secousse si on valide un champ vide */
  protected readonly shake = signal(false);

  /** Appelé sur la touche Entrée (ou le bouton Ajouter) */
  protected submit(input: HTMLInputElement): void {
    const title = input.value.trim();
    if (!title) {
      this.shake.set(true);
      setTimeout(() => this.shake.set(false), 450);
      input.focus();
      return;
    }
    this.add.emit({ title, priority: this.priority() });
    input.value = '';
    input.focus();
  }
}
