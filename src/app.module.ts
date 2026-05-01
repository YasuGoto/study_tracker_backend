import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './entities/user.entity';
import { StudySession } from './entities/studySession.entity';
import { DailySummary } from './entities/dailySummary.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StudySessionModule } from './study-session/study-session.module';
import { DailySummaryModule } from './daily-summary/daily-summary.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';
import Keyv from 'keyv';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');

        let storeConfig: object;
        if (redisUrl) {
          const url = new URL(redisUrl);
          storeConfig = {
            host: url.hostname,
            port: Number(url.port),
            username: url.username,
            password: url.password,
            tls: { rejectUnauthorized: false },
          };
        } else {
          storeConfig = {
            host: '127.0.0.1',
            port: 6379,
          };
        }

        const redis = await redisStore(storeConfig);
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
          stores: [new Keyv({ store: keyvStore })],
        };
      },
      inject: [ConfigService],
    }),
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
    StudySessionModule,
    DailySummaryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
