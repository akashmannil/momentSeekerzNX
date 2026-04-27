/**
 * Root application module.
 * Wires together all feature modules, MongoDB connection, config, and throttling.
 */
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { GalleryModule } from './modules/gallery/gallery.module';
import { BookingModule } from './modules/booking/booking.module';
import { UploadModule } from './modules/upload/upload.module';
import { CartModule } from './modules/cart/cart.module';
import { CheckoutModule } from './modules/checkout/checkout.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { LogsModule } from './modules/logs/logs.module';
import { GuestSessionMiddleware } from './common/middleware/guest-session.middleware';
import { CsrfMiddleware } from './common/middleware/csrf.middleware';
import { RequestContextMiddleware } from './common/middleware/request-context.middleware';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      cache: true,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
        dbName: 'savage-media',
      }),
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('THROTTLE_TTL', 60) * 1000,
          limit: config.get<number>('THROTTLE_LIMIT', 100),
        },
      ],
    }),
    LogsModule,
    AuthModule,
    UsersModule,
    GalleryModule,
    BookingModule,
    UploadModule,
    CartModule,
    CheckoutModule,
    AnalyticsModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestContextMiddleware, GuestSessionMiddleware, CsrfMiddleware)
      .forRoutes('*');
  }
}
