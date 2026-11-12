import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodoItem } from './todo-item';

describe('TodoItem', () => {
  let component: TodoItem;
  let fixture: ComponentFixture<TodoItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoItem],
    }).compileComponents();

    fixture = TestBed.createComponent(TodoItem);
    fixture.componentRef.setInput('todo', { id: 1, title: 'Test', completed: false, priority: 'high' });
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
