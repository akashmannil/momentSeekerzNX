import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT guard that never throws. If a valid Bearer token is present req.user is
 * populated, otherwise the request proceeds as a guest. Use for endpoints
 * that serve both authenticated and anonymous callers (e.g. cart).
 */
@Injectable()
export class JwtOptionalAuthGuard extends AuthGuard('jwt') {
  override handleRequest<TUser = unknown>(_err: unknown, user: TUser): TUser {
    return user ?? (null as unknown as TUser);
  }

  override canActivate(context: ExecutionContext) {
    return super.canActivate(context) as Promise<boolean> | boolean;
  }
}
