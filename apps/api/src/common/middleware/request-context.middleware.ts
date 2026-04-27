import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: Request & { requestId?: string; _startTime?: number }, _res: Response, next: NextFunction) {
    req.requestId = randomUUID();
    req._startTime = Date.now();
    next();
  }
}
