import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validate = (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = schema.parse({ body: req.body, params: req.params, query: req.query });
    req.body = (parsed as any).body ?? req.body;
    req.params = (parsed as any).params ?? req.params;
    // query remains as is
    next();
  } catch (e: unknown) {
    if (e instanceof ZodError) {
      return res.status(400).json({ error: e.errors.map((er: any) => er.message).join(', ') });
    }
    return res.status(400).json({ error: 'Invalid request' });
  }
};
