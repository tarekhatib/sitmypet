"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let PrismaExceptionFilter = class PrismaExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        if (exception instanceof client_1.Prisma.PrismaClientKnownRequestError &&
            exception.code === 'P1001') {
            return response.status(common_1.HttpStatus.SERVICE_UNAVAILABLE).json({
                message: 'Database unavailable',
            });
        }
        return response.status(common_1.HttpStatus.SERVICE_UNAVAILABLE).json({
            message: 'Service temporarily unavailable',
        });
    }
};
exports.PrismaExceptionFilter = PrismaExceptionFilter;
exports.PrismaExceptionFilter = PrismaExceptionFilter = __decorate([
    (0, common_1.Catch)(client_1.Prisma.PrismaClientKnownRequestError, client_1.Prisma.PrismaClientUnknownRequestError, client_1.Prisma.PrismaClientRustPanicError, client_1.Prisma.PrismaClientInitializationError)
], PrismaExceptionFilter);
//# sourceMappingURL=prisma-exception.filter.js.map