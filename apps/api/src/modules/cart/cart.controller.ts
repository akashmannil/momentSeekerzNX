import {
  Controller, Get, Post, Patch, Delete, Body, Param, Req, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { AddCartItemDto, UpdateCartItemDto } from '@sm/shared';
import { CartService, CartIdentity } from './cart.service';
import { JwtOptionalAuthGuard } from '../auth/guards/jwt-optional.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

type ReqWithIdentity = Request & { guestSid?: string; user?: { userId: string } };

function identityOf(req: ReqWithIdentity): CartIdentity {
  return req.user?.userId ? { userId: req.user.userId } : { guestSid: req.guestSid };
}

@ApiTags('cart')
@Controller({ path: 'cart', version: '1' })
@UseGuards(JwtOptionalAuthGuard)
@Throttle({ default: { limit: 60, ttl: 60000 } })
export class CartController {
  constructor(private readonly cart: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get current cart (user or guest)' })
  get(@Req() req: ReqWithIdentity) {
    return this.cart.getSnapshot(identityOf(req));
  }

  @Post('items')
  @ApiOperation({ summary: 'Add a service to cart' })
  add(@Req() req: ReqWithIdentity, @Body() dto: AddCartItemDto) {
    return this.cart.addItem(identityOf(req), dto.serviceId, dto.quantity);
  }

  @Patch('items/:serviceId')
  @ApiOperation({ summary: 'Update quantity for a line item' })
  update(@Req() req: ReqWithIdentity, @Param('serviceId') serviceId: string, @Body() dto: UpdateCartItemDto) {
    return this.cart.updateQuantity(identityOf(req), serviceId, dto.quantity);
  }

  @Delete('items/:serviceId')
  @ApiOperation({ summary: 'Remove a line item' })
  remove(@Req() req: ReqWithIdentity, @Param('serviceId') serviceId: string) {
    return this.cart.removeItem(identityOf(req), serviceId);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Clear cart' })
  clear(@Req() req: ReqWithIdentity) {
    return this.cart.clear(identityOf(req));
  }

  @Post('merge')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Merge guest cart into authenticated user cart (called after login)' })
  merge(@Req() req: ReqWithIdentity) {
    if (!req.user?.userId || !req.guestSid) return this.cart.getSnapshot(identityOf(req));
    return this.cart.merge(req.user.userId, req.guestSid);
  }
}
