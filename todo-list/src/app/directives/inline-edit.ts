import {
  Directive,
  ElementRef,
  inject,
  input,
  OnDestroy,
  OnInit,
  output,
  Renderer2,
} from '@angular/core';

/**
 * Édition inline d'un texte.
 *  - Double-clic sur l'élément hôte : passe en mode édition (un <input> remplace le texte).
 *  - Entrée : valide et émet la nouvelle valeur via (edited).
 *  - Échap ou clic à l'extérieur : annule, l'état précédent est rétabli.
 * Tous les écouteurs sont créés avec Renderer2.listen() et retirés à la destruction.
 *
 * Utilisation : <span [appInlineEdit]="todo.title" (edited)="rename($event)">{{ todo.title }}</span>
 */
@Directive({
  selector: '[appInlineEdit]',
})
export class InlineEdit implements OnInit, OnDestroy {
  /** Valeur actuelle du texte à éditer */
  readonly value = input.required<string>({ alias: 'appInlineEdit' });
  /** Émis uniquement quand la modification est validée avec Entrée */
  readonly edited = output<string>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);

  private editor: HTMLInputElement | null = null;
  /** Écouteurs présents pendant toute la vie de la directive */
  private hostListeners: (() => void)[] = [];
  /** Écouteurs présents uniquement pendant l'édition */
  private editListeners: (() => void)[] = [];

  ngOnInit(): void {
    this.hostListeners.push(
      this.renderer.listen(this.host.nativeElement, 'dblclick', () => this.startEdit()),
    );
  }

  ngOnDestroy(): void {
    this.stopEdit();
    this.hostListeners.forEach((unlisten) => unlisten());
    this.hostListeners = [];
  }

  private startEdit(): void {
    if (this.editor) return;

    const hostEl = this.host.nativeElement;
    const editor: HTMLInputElement = this.renderer.createElement('input');
    this.renderer.addClass(editor, 'inline-edit-input');
    this.renderer.setProperty(editor, 'value', this.value());
    this.renderer.insertBefore(hostEl.parentNode, editor, hostEl.nextSibling);
    this.renderer.setStyle(hostEl, 'display', 'none');
    this.editor = editor;

    editor.focus();
    editor.select();

    this.editListeners.push(
      this.renderer.listen(editor, 'keydown', (event: KeyboardEvent) => {
        if (event.key === 'Enter') this.confirm();
        else if (event.key === 'Escape') this.cancel();
      }),
      this.renderer.listen('document', 'click', (event: MouseEvent) => {
        if (event.target !== editor) this.cancel();
      }),
    );
  }

  private confirm(): void {
    const newValue = this.editor?.value.trim() ?? '';
    this.stopEdit();
    if (newValue && newValue !== this.value()) {
      this.edited.emit(newValue);
    }
  }

  /** Le texte de l'hôte n'a jamais été modifié : retirer l'input suffit à rétablir l'état précédent */
  private cancel(): void {
    this.stopEdit();
  }

  private stopEdit(): void {
    this.editListeners.forEach((unlisten) => unlisten());
    this.editListeners = [];

    if (this.editor) {
      this.editor.remove();
      this.editor = null;
    }
    this.renderer.removeStyle(this.host.nativeElement, 'display');
  }
}
