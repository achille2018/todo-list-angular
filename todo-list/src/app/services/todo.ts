import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Todo, TodoFilter } from '../models/todo';

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/todos';

  /** GET /todos — le filtre est envoyé en paramètre HTTP (?completed=true|false) */
  getAll(filter: TodoFilter = 'all'): Observable<Todo[]> {
    let params = new HttpParams();
    if (filter === 'active') params = params.set('completed', 'false');
    if (filter === 'done') params = params.set('completed', 'true');
    return this.http.get<Todo[]>(this.apiUrl, { params });
  }

  /** POST /todos */
  add(title: string): Observable<Todo> {
    return this.http.post<Todo>(this.apiUrl, { title, completed: false });
  }

  /** PATCH /todos/:id */
  update(id: number, changes: Partial<Todo>): Observable<Todo> {
    return this.http.patch<Todo>(`${this.apiUrl}/${id}`, changes);
  }

  /** DELETE /todos/:id */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
