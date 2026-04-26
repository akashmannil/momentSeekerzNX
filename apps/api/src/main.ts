/**
 * NestJS API entry point.
 * Bootstraps the application with security middleware, Swagger docs,
 * and global validation pipes.
 */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { createHash } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { UsersService } from './modules/users/users.service';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
    rawBody: true,
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const allowedOrigins = configService
    .get<string>('ALLOWED_ORIGINS', 'http://localhost:4200')
    .split(',');

  // ─── Security middleware ─────────────────────────────────────────────────────
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'blob:', '*.amazonaws.com'],
        },
      },
    })
  );

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // ─── Global prefix & versioning ─────────────────────────────────────────────
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI });

  // ─── Global validation ───────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,          // strip unknown properties
      forbidNonWhitelisted: true,
      transform: true,          // auto-transform payload to DTO types
      transformOptions: { enableImplicitConversion: true },
    })
  );

  // ─── Global filters & interceptors ──────────────────────────────────────────
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // ─── Swagger API docs ────────────────────────────────────────────────────────
  if (configService.get('NODE_ENV') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Savage Media API')
      .setDescription('Photography portfolio & store REST API')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication endpoints')
      .addTag('gallery', 'Photo gallery management')
      .addTag('booking', 'Session booking requests')
      .addTag('cart', 'User/guest cart management')
      .addTag('checkout', 'Stripe checkout & webhooks')
      .addTag('upload', 'File upload management')
      .addTag('analytics', 'Admin analytics')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
    logger.log(`Swagger docs available at http://localhost:${port}/api/docs`);
  }

  await app.listen(port);
  logger.log(`API running on http://localhost:${port}/api`);

  // Seed admin user on first boot
  const adminEmail = configService.get<string>('ADMIN_EMAIL');
  const adminPassword = configService.get<string>('ADMIN_PASSWORD');
  if (adminEmail && adminPassword) {
    const usersService = app.get(UsersService);
    const existing = await usersService.findByEmail(adminEmail);
    if (!existing) {
      try {
        // Mirror client-side SHA-256 hashing: store bcrypt(sha256(password))
        const sha256Hash = createHash('sha256').update(adminPassword).digest('hex');
        const passwordHash = await bcrypt.hash(sha256Hash, 12);
        await usersService.create({ email: adminEmail, name: 'Admin', passwordHash, role: 'admin' });
        logger.log(`Admin user seeded: ${adminEmail}`);
      } catch (err: unknown) {
        logger.warn(`Admin seed skipped: ${(err as Error).message}`);
      }
    }
  }
}

bootstrap();
