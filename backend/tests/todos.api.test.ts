import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Express } from 'express';
import { createApp } from '../src/app.js';
import { JsonFileTodoRepository } from '../src/modules/todos/index.js';

const initialTodos = [
  { id: 1, title: 'Tâche active', completed: false, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
  { id: 2, title: 'Tâche terminée', completed: true, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
];

describe('API /api/todos', () => {
  let dir: string;
  let dataFile: string;
  let app: Express;

  beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), 'todos-'));
    dataFile = path.join(dir, 'todos.json');
    await writeFile(dataFile, JSON.stringify(initialTodos));
    app = createApp({
      todoRepository: new JsonFileTodoRepository(dataFile),
      corsOrigin: 'http://localhost:4200',
      logRequests: false,
    });
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  describe('GET /api/todos', () => {
    it('renvoie toutes les tâches', async () => {
      const res = await request(app).get('/api/todos').expect(200);
      expect(res.body).toHaveLength(2);
    });

    it('filtre les tâches terminées avec ?completed=true', async () => {
      const res = await request(app).get('/api/todos?completed=true').expect(200);
      expect(res.body.map((t: { id: number }) => t.id)).toEqual([2]);
    });

    it('filtre les tâches en cours avec ?completed=false', async () => {
      const res = await request(app).get('/api/todos?completed=false').expect(200);
      expect(res.body.map((t: { id: number }) => t.id)).toEqual([1]);
    });

    it('refuse un filtre invalide (400)', async () => {
      await request(app).get('/api/todos?completed=peut-etre').expect(400);
    });
  });

  describe('GET /api/todos/:id', () => {
    it('renvoie une tâche', async () => {
      const res = await request(app).get('/api/todos/1').expect(200);
      expect(res.body.title).toBe('Tâche active');
    });

    it('renvoie 404 si la tâche n’existe pas', async () => {
      const res = await request(app).get('/api/todos/999').expect(404);
      expect(res.body.error.message).toContain('999');
    });

    it('renvoie 400 si l’identifiant est invalide', async () => {
      await request(app).get('/api/todos/abc').expect(400);
    });
  });

  describe('POST /api/todos', () => {
    it('crée une tâche (201) et l’enregistre dans le fichier', async () => {
      const res = await request(app).post('/api/todos').send({ title: '  Nouvelle tâche  ' }).expect(201);

      expect(res.body).toMatchObject({ id: 3, title: 'Nouvelle tâche', completed: false });
      expect(res.headers.location).toBe('/api/todos/3');

      const saved = JSON.parse(await readFile(dataFile, 'utf-8'));
      expect(saved).toHaveLength(3);
    });

    it('refuse un titre vide (400)', async () => {
      const res = await request(app).post('/api/todos').send({ title: '   ' }).expect(400);
      expect(res.body.error.details[0].field).toBe('title');
    });

    it('refuse un champ inconnu (400)', async () => {
      await request(app).post('/api/todos').send({ title: 'ok', admin: true }).expect(400);
    });

    it('refuse un JSON mal formé (400)', async () => {
      await request(app)
        .post('/api/todos')
        .set('Content-Type', 'application/json')
        .send('{"title":')
        .expect(400);
    });
  });

  describe('PATCH /api/todos/:id', () => {
    it('modifie le titre', async () => {
      const res = await request(app).patch('/api/todos/1').send({ title: 'Renommée' }).expect(200);
      expect(res.body.title).toBe('Renommée');
      expect(res.body.updatedAt).not.toBe(initialTodos[0]!.updatedAt);
    });

    it('marque une tâche comme terminée', async () => {
      const res = await request(app).patch('/api/todos/1').send({ completed: true }).expect(200);
      expect(res.body.completed).toBe(true);
    });

    it('refuse un corps vide (400)', async () => {
      await request(app).patch('/api/todos/1').send({}).expect(400);
    });

    it('renvoie 404 si la tâche n’existe pas', async () => {
      await request(app).patch('/api/todos/999').send({ completed: true }).expect(404);
    });
  });

  describe('DELETE /api/todos/:id', () => {
    it('supprime une tâche (204)', async () => {
      await request(app).delete('/api/todos/1').expect(204);
      const res = await request(app).get('/api/todos').expect(200);
      expect(res.body.map((t: { id: number }) => t.id)).toEqual([2]);
    });

    it('renvoie 404 si la tâche n’existe pas', async () => {
      await request(app).delete('/api/todos/999').expect(404);
    });
  });

  it('autorise l’application Angular (CORS)', async () => {
    const res = await request(app).get('/api/todos').set('Origin', 'http://localhost:4200');
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:4200');
  });

  it('renvoie 404 pour une route inconnue', async () => {
    await request(app).get('/api/inconnue').expect(404);
  });

  it('GET /api/health répond ok', async () => {
    const res = await request(app).get('/api/health').expect(200);
    expect(res.body.status).toBe('ok');
  });
});
