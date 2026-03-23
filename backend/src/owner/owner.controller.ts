import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OwnerService } from './owner.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { R2Service } from '../storage/r2.service';
import { ApplicationsService } from '../applications/applications.service';

@UseGuards(JwtAuthGuard)
@Controller('owner')
export class OwnerController {
  constructor(
    private readonly ownerService: OwnerService,
    private readonly r2Service: R2Service,
    private readonly applicationsService: ApplicationsService,
  ) {}

  @Get('requests')
  async getRequests(@Req() req: { user: { sub: string } }) {
    return this.applicationsService.getOwnerRequests(req.user.sub);
  }

  @Get('home')
  async getHome(
    @Req()
    req: {
      user: {
        sub: string;
        roles: Role[];
      };
    },
  ) {
    const userId = req.user.sub;
    return this.ownerService.getHomeFeed(userId);
  }

  @Get('pets')
  async getPets(@Req() req: { user: { sub: string } }) {
    return this.ownerService.getPets(req.user.sub);
  }

  @Post('pets')
  async createPet(
    @Req() req: { user: { sub: string } },
    @Body() dto: CreatePetDto,
  ) {
    return this.ownerService.createPet(req.user.sub, dto);
  }

  @Delete('pets/:id')
  async deletePet(
    @Param('id') id: string,
    @Req() req: { user: { sub: string } },
  ) {
    return this.ownerService.deletePet(req.user.sub, id, this.r2Service);
  }

  @Post('pets/upload-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPetImage(
    @Req() req: { user: { sub: string } },
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
  ) {
    if (!file.mimetype.match(/^image\/(jpg|jpeg|png|webp)$/)) {
      throw new BadRequestException('Invalid file type');
    }

    return this.ownerService.uploadPetImage(
      req.user.sub,
      file,
      this.r2Service,
    );
  }
}
