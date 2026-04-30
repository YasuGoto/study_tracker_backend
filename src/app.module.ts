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

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'gotoyasuko',
      password: '',
      database: 'study_tracker',
      entities: [User, StudySession, DailySummary],
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    StudySessionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
