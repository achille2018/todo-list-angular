import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideRouter } from '@angular/router';
import { TodoFilterBar } from './todo-filter';

describe('TodoFilterBar', () => {
  let component: TodoFilterBar;
  let fixture: ComponentFixture<TodoFilterBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoFilterBar],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(TodoFilterBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
