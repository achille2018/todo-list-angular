import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InlineEdit } from './inline-edit';

/** Petit composant de test qui utilise la directive */
@Component({
  imports: [InlineEdit],
  template: `
    <div>
      <span [appInlineEdit]="title" (edited)="onEdited($event)">{{ title }}</span>
    </div>
    <button id="outside">Ailleurs</button>
  `,
})
class TestHost {
  title = 'Ancien titre';
  edited: string[] = [];

  onEdited(value: string): void {
    this.edited.push(value);
  }
}

describe('InlineEdit', () => {
  let fixture: ComponentFixture<TestHost>;
  let host: TestHost;
  let span: HTMLSpanElement;

  /** Retourne le champ créé par la directive (ou null) */
  function editor(): HTMLInputElement | null {
    return fixture.nativeElement.querySelector('.inline-edit-input');
  }

  function startEdit(): HTMLInputElement {
    span.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    return editor()!;
  }

  function pressKey(input: HTMLInputElement, key: string): void {
    input.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
  }

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    span = fixture.nativeElement.querySelector('span');
  });

  it('passe en mode édition au double-clic', () => {
    const input = startEdit();

    expect(input).not.toBeNull();
    expect(input.value).toBe('Ancien titre');
    expect(span.style.display).toBe('none');
  });

  it('valide la modification avec Entrée', () => {
    const input = startEdit();
    input.value = 'Nouveau titre';
    pressKey(input, 'Enter');

    expect(host.edited).toEqual(['Nouveau titre']);
    expect(editor()).toBeNull();
    expect(span.style.display).toBe('');
  });

  it('annule avec Échap et rétablit l’état précédent', () => {
    const input = startEdit();
    input.value = 'Texte abandonné';
    pressKey(input, 'Escape');

    expect(host.edited).toEqual([]);
    expect(editor()).toBeNull();
    expect(span.textContent).toBe('Ancien titre');
    expect(span.style.display).toBe('');
  });

  it('annule avec un clic à l’extérieur', () => {
    const input = startEdit();
    input.value = 'Texte abandonné';
    fixture.nativeElement.querySelector('#outside').click();

    expect(host.edited).toEqual([]);
    expect(editor()).toBeNull();
  });

  it('n’émet rien si le texte est vide ou inchangé', () => {
    let input = startEdit();
    input.value = '   ';
    pressKey(input, 'Enter');

    input = startEdit();
    pressKey(input, 'Enter'); // valeur inchangée

    expect(host.edited).toEqual([]);
  });

  it('retire ses écouteurs et son champ à la destruction', () => {
    startEdit();
    const removeSpy = vi.spyOn(document, 'removeEventListener');

    fixture.destroy();

    expect(removeSpy).toHaveBeenCalledWith('click', expect.any(Function), undefined);
    expect(document.querySelector('.inline-edit-input')).toBeNull();
    removeSpy.mockRestore();
  });
});
