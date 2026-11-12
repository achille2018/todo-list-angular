import type { RequestHandler } from 'express';
import { HttpError } from '../errors/http-error.js';

export const notFound: RequestHandler = (req, _res, next) => {
  next(HttpError.notFound(`Route introuvable : ${req.method} ${req.originalUrl}`));
};
