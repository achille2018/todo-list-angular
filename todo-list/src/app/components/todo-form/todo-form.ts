import { Component, output } from '@angular/core';

@Component({
  selector: 'app-todo-form',
  imports: [],
  templateUrl: './todo-form.html',
  styleUrl: './todo-form.css',
})
export class TodoForm {
  readonly add = output<string>();

  /** Appelé sur la touche Entrée */
  protected submit(input: HTMLInputElement): void {
    const title = input.value.trim();
    if (!title) return;
    this.add.emit(title);
    input.value = '';
  }
}
