import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LogsService } from '../../modules/logs/logs.service';
import { sanitize, sanitizeHeaders } from '../../modules/logs/sanitize.util';

interface RequestWithMeta extends Request {
  requestId?: string;
  user?: { userId?: string; sub?: string; id?: string };
  guestSid?: string;
  _startTime?: number;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly logs: LogsService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<RequestWithMeta>();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const errorBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: typeof message === 'object' ? (message as { message?: unknown }).message : message,
    };

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} — ${status}`,
        exception instanceof Error ? exception.stack : String(exception)
      );
    } else {
      this.logger.warn(`${request.method} ${request.url} — ${status}`);
    }

    const userId = request.user?.userId ?? request.user?.sub ?? request.user?.id;
    const guestSid = request.guestSid ?? (request.cookies as Record<string, string> | undefined)?.['guest_sid'];
    const [path, query] = (request.originalUrl ?? request.url ?? '').split('?');
    const duration = request._startTime ? Date.now() - request._startTime : 0;

    this.logs.record({
      requestId: request.requestId ?? 'unknown',
      method: request.method,
      path,
      query,
      statusCode: status,
      durationMs: duration,
      userId: userId ? String(userId) : undefined,
      guestSid,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      requestBody: sanitize(request.body) as Record<string, unknown>,
      requestHeaders: sanitizeHeaders(request.headers as Record<string, unknown>),
      responseBody: errorBody,
      errorMessage: exception instanceof Error ? exception.message : String(exception),
      errorStack: exception instanceof Error ? exception.stack : undefined,
    });

    response.status(status).json(errorBody);
  }
}
