import type { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { ValidationError } from '../utils/errors.js';

type RequestLocation = 'body' | 'query' | 'params';

interface ValidateOptions {
  body?: z.ZodSchema;
  query?: z.ZodSchema;
  params?: z.ZodSchema;
}

export function validate(schemas: ValidateOptions) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const errors: Record<string, string[]> = {};

    const locations: RequestLocation[] = ['body', 'query', 'params'];

    for (const location of locations) {
      const schema = schemas[location];
      if (!schema) continue;

      try {
        const parsed = await schema.parseAsync(req[location]);
        req[location] = parsed;
      } catch (error) {
        if (error instanceof ZodError) {
          for (const issue of error.issues) {
            const path = `${location}.${issue.path.join('.')}`;
            if (!errors[path]) {
              errors[path] = [];
            }
            errors[path].push(issue.message);
          }
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors);
    }

    next();
  };
}

export function validateBody<T extends z.ZodSchema>(schema: T) {
  return validate({ body: schema });
}

export function validateQuery<T extends z.ZodSchema>(schema: T) {
  return validate({ query: schema });
}

export function validateParams<T extends z.ZodSchema>(schema: T) {
  return validate({ params: schema });
}
