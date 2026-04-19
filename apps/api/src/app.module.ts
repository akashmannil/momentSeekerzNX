/**
 * Root application module.
 * Wires together all feature modules, MongoDB connection, config, and throttling.
 */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { GalleryModule } from './modules/gallery/gallery.module';
import { BookingModule } from './modules/booking/booking.module';
import { UploadModule } from './modules/upload/upload.module';
import { StoreModule } from './modules/store/store.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [
    // ── Environment config ─────────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      cache: true,
    }),

    // ── MongoDB connection ─────────────────────────────────────────────────────
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
        dbName: 'savage-media',
      }),
    }),

    // ── Rate limiting ──────────────────────────────────────────────────────────
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('THROTTLE_TTL', 60) * 1000,
          limit: config.get<number>('THROTTLE_LIMIT', 100),
        },
      ],
    }),

    // ── Feature modules ────────────────────────────────────────────────────────
    AuthModule,
    UsersModule,
    GalleryModule,
    BookingModule,
    UploadModule,
    StoreModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
