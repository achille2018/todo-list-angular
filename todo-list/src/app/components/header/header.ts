import { DOCUMENT } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';

type Theme = 'light' | 'dark';

const THEME_KEY = 'todo-theme';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private readonly document = inject(DOCUMENT);

  /** Membres du groupe affichés dans l'en-tête */
  protected readonly students = [
    { firstName: 'Achille', lastName: 'SAGANG TANWOUO' },
    { firstName: 'Jules', lastName: 'FILLOUX' },
  ];

  protected readonly today = this.formatToday();
  protected readonly theme = signal<Theme>(this.initialTheme());

  constructor() {
    // Applique le thème sur <html data-theme="..."> et le mémorise
    effect(() => {
      const theme = this.theme();
      this.document.documentElement.dataset['theme'] = theme;
      try {
        localStorage.setItem(THEME_KEY, theme);
      } catch {
        // Stockage indisponible (navigation privée…) : le thème reste valable pour la session
      }
    });
  }

  protected toggleTheme(): void {
    this.theme.update((theme) => (theme === 'dark' ? 'light' : 'dark'));
  }

  protected initials(student: { firstName: string; lastName: string }): string {
    return (student.firstName[0] + student.lastName[0]).toUpperCase();
  }

  private initialTheme(): Theme {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      // ignoré
    }
    return this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private formatToday(): string {
    const text = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
}
