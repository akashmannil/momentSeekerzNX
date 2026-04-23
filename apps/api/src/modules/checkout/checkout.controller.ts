import {
  Controller, Post, Body, Req, UseGuards, Headers, HttpCode, HttpStatus, RawBodyRequest, BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { CheckoutServicesDto, CheckoutSubscriptionDto } from '@sm/shared';
import { CheckoutService } from './checkout.service';
import { JwtOptionalAuthGuard } from '../auth/guards/jwt-optional.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

type ReqWithIdentity = Request & { guestSid?: string; user?: { userId: string; email: string } };

@ApiTags('checkout')
@Controller({ path: 'checkout', version: '1' })
export class CheckoutController {
  constructor(private readonly checkout: CheckoutService) {}

  @Post('services')
  @UseGuards(JwtOptionalAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Create a Stripe Checkout session for à la carte services' })
  services(@Req() req: ReqWithIdentity, @Body() dto: CheckoutServicesDto) {
    const origin = this.safeOrigin(req);
    const email = dto.customerEmail ?? req.user?.email;
    if (!email) throw new BadRequestException('Email is required for guest checkout');
    return this.checkout.createServicesSession({
      identity: req.user?.userId ? { userId: req.user.userId } : { guestSid: req.guestSid },
      customerEmail: email,
      customerName: dto.customerName,
      items: dto.items,
      origin,
    });
  }

  @Post('subscription')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Start a subscription checkout (requires auth)' })
  subscription(@Req() req: ReqWithIdentity, @Body() dto: CheckoutSubscriptionDto) {
    const origin = this.safeOrigin(req);
    const email = dto.customerEmail ?? req.user!.email;
    return this.checkout.createSubscriptionSession({
      userId: req.user!.userId,
      tier: dto.tier,
      customerEmail: email,
      origin,
    });
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stripe webhook — raw body required' })
  webhook(@Req() req: RawBodyRequest<Request>, @Headers('stripe-signature') sig: string) {
    if (!sig || !req.rawBody) throw new BadRequestException('Missing signature');
    return this.checkout.handleWebhook(req.rawBody, sig);
  }

  private safeOrigin(req: Request): string {
    const allowed = (process.env['ALLOWED_ORIGINS'] ?? 'http://localhost:4200').split(',');
    const origin = req.headers.origin as string | undefined;
    if (origin && allowed.includes(origin)) return origin;
    return allowed[0];
  }
}
