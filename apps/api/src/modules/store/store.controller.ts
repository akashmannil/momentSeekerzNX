import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, Request, UseGuards,
  HttpCode, HttpStatus, Headers, RawBodyRequest,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { StoreService } from './store.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  CreateProductDto, UpdateProductDto,
  CreateOrderDto, OrderStatus,
} from '@sm/shared';

@ApiTags('store')
@Controller({ path: 'store', version: '1' })
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  // ── Public product endpoints ─────────────────────────────────────────────────

  @Get('products')
  @ApiOperation({ summary: 'List published print products' })
  findAllProducts(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('featured') featured?: boolean
  ) {
    return this.storeService.findAllProducts(page, limit, featured);
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Get a product by ID' })
  findProduct(@Param('id') id: string) {
    return this.storeService.findProductById(id);
  }

  // ── Checkout ─────────────────────────────────────────────────────────────────

  @Post('checkout')
  @ApiOperation({ summary: 'Create a Stripe checkout session' })
  checkout(@Body() dto: CreateOrderDto, @Request() req: any) {
    const origin = req.headers.origin || 'http://localhost:4200';
    return this.storeService.createCheckoutSession(dto, origin);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stripe webhook — raw body required' })
  webhook(
    @Request() req: RawBodyRequest<any>,
    @Headers('stripe-signature') sig: string
  ) {
    return this.storeService.handleStripeWebhook(req.rawBody, sig);
  }

  // ── Admin endpoints ──────────────────────────────────────────────────────────

  @Post('products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a product (admin)' })
  createProduct(@Body() dto: CreateProductDto) {
    return this.storeService.createProduct(dto);
  }

  @Patch('products/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product (admin)' })
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.storeService.updateProduct(id, dto);
  }

  @Delete('products/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteProduct(@Param('id') id: string) {
    return this.storeService.deleteProduct(id);
  }

  @Get('orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List orders (admin)' })
  findAllOrders(@Query('status') status?: OrderStatus, @Query('page') page = 1, @Query('limit') limit = 20) {
    return this.storeService.findAllOrders(status, page, limit);
  }

  @Get('orders/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order detail (admin)' })
  findOrder(@Param('id') id: string) {
    return this.storeService.findOrderById(id);
  }

  @Patch('orders/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update order status (admin)' })
  updateOrderStatus(
    @Param('id') id: string,
    @Body() body: { status: OrderStatus; trackingNumber?: string }
  ) {
    return this.storeService.updateOrderStatus(id, body.status, body.trackingNumber);
  }
}
