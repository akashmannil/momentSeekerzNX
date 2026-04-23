import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomBytes, timingSafeEqual } from 'crypto';

const CSRF_COOKIE = 'csrf_token';
const CSRF_HEADER = 'x-csrf-token';
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Double-submit cookie CSRF protection.
 *  - Issues a non-HttpOnly csrf_token cookie so the SPA can read it.
 *  - Every state-changing request must echo the same value in X-CSRF-Token.
 *  - Webhook routes (Stripe) are exempt since they carry their own signature.
 *
 * Server-bound auth tokens live in the Authorization header (not cookies),
 * so CSRF is only strictly needed for the guest_sid cookie path \u2014 but we
 * enforce it uniformly to keep the pattern simple and auditable.
 */
@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    // Issue/refresh token cookie.
    const cookieHeader = req.headers.cookie ?? '';
    const existing = cookieHeader.match(new RegExp(`(?:^|;\\s*)${CSRF_COOKIE}=([a-f0-9]{64})`));
    let token = existing?.[1];
    if (!token) {
      token = randomBytes(32).toString('hex');
      const isProd = process.env['NODE_ENV'] === 'production';
      const attrs = [
        `${CSRF_COOKIE}=${token}`,
        'Path=/',
        'SameSite=Lax',
        `Max-Age=${60 * 60 * 24}`,
        ...(isProd ? ['Secure'] : []),
      ];
      res.setHeader('Set-Cookie', [...(res.getHeader('Set-Cookie') as string[] | undefined ?? []), attrs.join('; ')]);
    }

    if (SAFE_METHODS.has(req.method)) return next();

    // Exempt Stripe webhook \u2014 signature-verified separately.
    if (req.path.endsWith('/checkout/webhook')) return next();

    const headerToken = req.headers[CSRF_HEADER];
    const headerVal = Array.isArray(headerToken) ? headerToken[0] : headerToken;
    if (!headerVal || !token || headerVal.length !== token.length) {
      throw new ForbiddenException('CSRF token missing or invalid');
    }
    const a = Buffer.from(headerVal, 'utf8');
    const b = Buffer.from(token, 'utf8');
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new ForbiddenException('CSRF token mismatch');
    }
    next();
  }
}
