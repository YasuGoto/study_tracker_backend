import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './entities/user.entity';
import { StudySession } from './entities/studySession.entity';
import { DailySummary } from './entities/dailySummary.entity';
import { ConfigModule } from '@nestjs/config';
import { StudySessionModule } from './study-session/study-session.module';
import { DailySummaryModule } from './daily-summary/daily-summary.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';
import Keyv from 'keyv';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      host: process.env.DATABASE_URL ? undefined : 'localhost',
      port: process.env.DATABASE_URL ? undefined : 5432,
      username: process.env.DATABASE_URL ? undefined : 'gotoyasuko',
      database: process.env.DATABASE_URL ? undefined : 'study_tracker',
      entities: [User, StudySession, DailySummary],
      synchronize: true,
      ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
    }),
    AuthModule,
    UsersModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        // NestJS @nestjs/cache-manager v3 は `stores` のみ参照する（`store` は無視される）
        const redis = await redisStore({
          host: process.env.REDIS_HOST ?? '127.0.0.1',
          port: Number(process.env.REDIS_PORT ?? 6379),
        });
        // Keyv は store に delete / clear が必須。cache-manager-ioredis-yet は del / reset（型定義に未記載）
        const redisCompat = redis as typeof redis & {
          del: (key: string) => Promise<unknown>;
          reset: () => Promise<void>;
        };
        const keyvStore = {
          ...redis,
          delete: (key: string) => redisCompat.del(key),
          clear: async () => {
            await redisCompat.reset();
          },
        };
        return {
          stores: [
            new Keyv({
              store: keyvStore,
            }),
          ],
        };
      },
    }),
    StudySessionModule,
    DailySummaryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
