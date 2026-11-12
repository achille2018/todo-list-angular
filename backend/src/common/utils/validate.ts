import type { z } from 'zod';
import { HttpError } from '../errors/http-error.js';

/**
 * Valide des données avec un schéma Zod.
 * Renvoie les données typées, ou lève une erreur 400 décrivant chaque champ invalide.
 */
export function validate<T extends z.ZodType>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join('.') || null,
      message: issue.message,
    }));
    throw HttpError.badRequest('Données invalides', details);
  }
  return result.data;
}
