import type { ErrorRequestHandler } from 'express';
import { HttpError } from '../errors/http-error.js';

/**
 * Point unique de gestion des erreurs : toutes les réponses d'erreur ont le même format
 * { "error": { "status": number, "message": string, "details"?: unknown } }
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({
      error: { status: err.status, message: err.message, details: err.details },
    });
    return;
  }

  // JSON mal formé dans le corps de la requête (levé par express.json())
  if (err?.type === 'entity.parse.failed') {
    res.status(400).json({ error: { status: 400, message: 'Corps JSON invalide' } });
    return;
  }

  console.error(err);
  res.status(500).json({ error: { status: 500, message: 'Erreur interne du serveur' } });
};
