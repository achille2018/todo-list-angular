import { Component, computed, input } from '@angular/core';
import { TodoCounts } from '../../models/todo';

const RADIUS = 28;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

@Component({
  selector: 'app-todo-stats',
  imports: [],
  templateUrl: './todo-stats.html',
  styleUrl: './todo-stats.css',
})
export class TodoStats {
  readonly counts = input<TodoCounts>({ all: 0, active: 0, done: 0, urgent: 0 });

  protected readonly radius = RADIUS;
  protected readonly circumference = CIRCUMFERENCE;

  protected readonly percent = computed(() => {
    const { all, done } = this.counts();
    return all === 0 ? 0 : Math.round((done / all) * 100);
  });

  /** Longueur du cercle non remplie : l'anneau se remplit en fonction du pourcentage */
  protected readonly dashOffset = computed(() => CIRCUMFERENCE * (1 - this.percent() / 100));

  protected readonly allDone = computed(() => this.counts().all > 0 && this.counts().active === 0);

  protected readonly message = computed(() => {
    const { all, active } = this.counts();
    if (all === 0) return 'Aucune tâche pour le moment';
    if (active === 0) return 'Bravo, tout est terminé !';
    if (this.percent() >= 50) return 'Plus que quelques-unes, courage !';
    return 'Une tâche après l’autre';
  });

  /** Positions des confettis affichés quand tout est terminé */
  protected readonly confetti = Array.from({ length: 14 }, (_, i) => i);
}
