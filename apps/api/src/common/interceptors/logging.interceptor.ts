import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { LogsService } from '../../modules/logs/logs.service';
import { sanitize, sanitizeHeaders } from '../../modules/logs/sanitize.util';

interface RequestWithMeta extends Request {
  requestId?: string;
  user?: { userId?: string; sub?: string; id?: string };
  guestSid?: string;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  constructor(private readonly logs: LogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<RequestWithMeta>();
    const response = http.getResponse<Response>();

    const requestId = request.requestId ?? randomUUID();
    request.requestId = requestId;
    response.setHeader('X-Request-Id', requestId);

    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: (body) => this.persist(request, response, start, requestId, body, undefined),
        error: () => {
          // AllExceptionsFilter handles failed requests
        },
      })
    );
  }

  private persist(
    request: RequestWithMeta,
    response: Response,
    start: number,
    requestId: string,
    body: unknown,
    error: Error | undefined
  ) {
    const duration = Date.now() - start;
    const status = response.statusCode;
    this.logger.log(`${request.method} ${request.originalUrl ?? request.url} ${status} — ${duration}ms`);

    const isFailure = status >= 400 || !!error;
    const userId = request.user?.userId ?? request.user?.sub ?? request.user?.id;
    const guestSid = request.guestSid ?? (request.cookies as Record<string, string> | undefined)?.['guest_sid'];

    const responseSize = (() => {
      try {
        return body == null ? 0 : Buffer.byteLength(typeof body === 'string' ? body : JSON.stringify(body));
      } catch {
        return undefined;
      }
    })();

    const [path, query] = (request.originalUrl ?? request.url ?? '').split('?');

    this.logs.record({
      requestId,
      method: request.method,
      path,
      query,
      statusCode: status,
      durationMs: duration,
      userId: userId ? String(userId) : undefined,
      guestSid,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      responseSize,
      ...(isFailure
        ? {
            requestBody: sanitize(request.body) as Record<string, unknown>,
            requestHeaders: sanitizeHeaders(request.headers as Record<string, unknown>),
            responseBody: sanitize(body),
            errorMessage: error?.message,
            errorStack: error?.stack,
          }
        : {}),
    });
  }
}
