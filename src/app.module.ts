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
import { redisStore } from 'cache-manager-redis-store';

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
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: 'localhost',
      port: 6379,
    }),
    StudySessionModule,
    DailySummaryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
