import { z } from 'zod';

const title = z
  .string({ error: 'Le titre doit être une chaîne de caractères' })
  .trim()
  .min(1, 'Le titre est obligatoire')
  .max(200, 'Le titre ne doit pas dépasser 200 caractères');

/** Paramètre :id de l'URL */
export const todoIdParamsSchema = z.object({
  id: z.coerce.number().int().positive("L'identifiant doit être un entier positif"),
});

/** Query string de GET /todos : ?completed=true|false */
export const listTodosQuerySchema = z.object({
  completed: z
    .enum(['true', 'false'], { error: 'completed doit valoir true ou false' })
    .transform((value) => value === 'true')
    .optional(),
});

/** Corps de POST /todos */
export const createTodoSchema = z.strictObject({
  title,
  completed: z.boolean().default(false),
});

/** Corps de PATCH /todos/:id : au moins un champ */
export const updateTodoSchema = z
  .strictObject({
    title: title.optional(),
    completed: z.boolean().optional(),
  })
  .refine((data) => data.title !== undefined || data.completed !== undefined, {
    error: 'Au moins un champ (title ou completed) doit être fourni',
  });

export type CreateTodoDto = z.infer<typeof createTodoSchema>;
export type UpdateTodoDto = z.infer<typeof updateTodoSchema>;
