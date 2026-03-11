import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ContactModule } from './contact/contact.module';
import { LocationsModule } from './locations/locations.module';
import { PrismaModule } from './prisma/prisma.module';
import { SitterModule } from './sitter/sitter.module';
import { UsersModule } from './users/users.module';
import { OcrModule } from './ocr/ocr.module';
import { PostsModule } from './posts/posts.module';
import { StorageModule } from './storage/storage.module';
import { BookingsModule } from './bookings/bookings.module';
import { ApplicationsModule } from './applications/applications.module';
import { OwnerModule } from './owner/owner.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ScheduleModule.forRoot(),
    PrismaModule,
    UsersModule,
    AuthModule,
    ContactModule,
    LocationsModule,
    OwnerModule,
    SitterModule,
    OcrModule,
    PostsModule,
    StorageModule,
    BookingsModule,
    ApplicationsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
