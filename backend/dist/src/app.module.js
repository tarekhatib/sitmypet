"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const contact_module_1 = require("./contact/contact.module");
const locations_module_1 = require("./locations/locations.module");
const prisma_module_1 = require("./prisma/prisma.module");
const sitter_module_1 = require("./sitter/sitter.module");
const users_module_1 = require("./users/users.module");
const ocr_module_1 = require("./ocr/ocr.module");
const posts_module_1 = require("./posts/posts.module");
const storage_module_1 = require("./storage/storage.module");
const bookings_module_1 = require("./bookings/bookings.module");
const applications_module_1 = require("./applications/applications.module");
const owner_module_1 = require("./owner/owner.module");
const notifications_module_1 = require("./notifications/notifications.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
            schedule_1.ScheduleModule.forRoot(),
            prisma_module_1.PrismaModule,
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            contact_module_1.ContactModule,
            locations_module_1.LocationsModule,
            owner_module_1.OwnerModule,
            sitter_module_1.SitterModule,
            ocr_module_1.OcrModule,
            posts_module_1.PostsModule,
            storage_module_1.StorageModule,
            bookings_module_1.BookingsModule,
            applications_module_1.ApplicationsModule,
            notifications_module_1.NotificationsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map