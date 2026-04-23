import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'crypto';

const GUEST_COOKIE = 'guest_sid';
const GUEST_TTL_DAYS = 30;

/**
 * Issues an HttpOnly, Secure, SameSite=Lax cookie the first time an unauthenticated
 * client touches the API. The cookie value is an opaque 32-byte random id and is
 * the ONLY client-side identifier for guest carts \u2014 never expose it in responses
 * or URLs, never put anything sensitive in it.
 *
 * A JWT-authenticated request uses req.user; guestSid is still populated so the
 * cart service can merge on login.
 */
@Injectable()
export class GuestSessionMiddleware implements NestMiddleware {
  use(req: Request & { guestSid?: string }, res: Response, next: NextFunction): void {
    const cookieHeader = req.headers.cookie ?? '';
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${GUEST_COOKIE}=([a-f0-9]{64})`));
    let sid = match?.[1];

    if (!sid) {
      sid = randomBytes(32).toString('hex');
      const isProd = process.env['NODE_ENV'] === 'production';
      const attrs = [
        `${GUEST_COOKIE}=${sid}`,
        'Path=/',
        'HttpOnly',
        'SameSite=Lax',
        `Max-Age=${60 * 60 * 24 * GUEST_TTL_DAYS}`,
        ...(isProd ? ['Secure'] : []),
      ];
      res.setHeader('Set-Cookie', [...(res.getHeader('Set-Cookie') as string[] | undefined ?? []), attrs.join('; ')]);
    }

    req.guestSid = sid;
    next();
  }
}
