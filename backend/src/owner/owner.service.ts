import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OwnerHomeFeedDto, SitterHistoryDto } from './dto/owner-home.dto';
import { CreatePetDto } from './dto/create-pet.dto';
import { R2Service } from '../storage/r2.service';

@Injectable()
export class OwnerService {
  constructor(private readonly prisma: PrismaService) {}

  async getHomeFeed(userId: string): Promise<OwnerHomeFeedDto> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const bookings = await this.prisma.booking.findMany({
      where: {
        ownerId: userId,
        scheduledTime: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        sitter: true,
        pet: true,
        service: true,
      },
      orderBy: {
        scheduledTime: 'asc',
      },
    });

    const todaysBookings = bookings.map((booking) => ({
      id: booking.id,
      sitterName: `${booking.sitter.firstname} ${booking.sitter.lastname}`,
      sitterImageURL: booking.sitter.profileImageUrl ?? undefined,
      petName: booking.pet.name,
      service: {
        id: booking.service.id,
        name: booking.service.name,
      },
      status: booking.status,
      location: booking.location,
      time: booking.scheduledTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }));

    const completedBookings = await this.prisma.booking.findMany({
      where: {
        ownerId: userId,
        status: 'COMPLETED',
      },
      include: {
        sitter: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const uniqueSitters = new Map<string, SitterHistoryDto>();
    for (const booking of completedBookings) {
      if (!uniqueSitters.has(booking.sitterId) && uniqueSitters.size < 10) {
        uniqueSitters.set(booking.sitterId, {
          id: booking.sitter.id,
          sitterName: `${booking.sitter.firstname} ${booking.sitter.lastname}`,
          sitterImageUrl: booking.sitter.profileImageUrl ?? undefined,
          location: booking.location,
          lastBookingDate: booking.scheduledTime,
        });
      }
    }
    const recentSitters = Array.from(uniqueSitters.values());
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: { location: true },
    });

    const locationName = profile?.location?.name;

    let nearbySitters: any[] | null = null;

    if (locationName) {
      const sitters = await this.prisma.user.findMany({
        where: {
          id: { not: userId },
          roles: { has: 'SITTER' },
          profile: {
            location: {
              name: {
                contains: locationName,
                mode: 'insensitive',
              },
            },
          },
        },
        select: {
          id: true,
          firstname: true,
          lastname: true,
          profileImageUrl: true,
          profile: {
            select: {
              location: { select: { name: true } },
              savedBy: {
                where: { userId },
                select: { id: true },
              },
            },
          },
          bookingsAsSitter: {
            where: { status: 'COMPLETED' },
            select: {
              review: { select: { rating: true } },
            },
          },
        },
        take: 10,
      });

      nearbySitters = sitters.map((sitter) => {
        const reviews = sitter.bookingsAsSitter
          .map((b) => b.review)
          .filter((r) => r !== null);

        const reviewCount = reviews.length;
        const rating =
          reviewCount > 0
            ? reviews.reduce((sum, r) => sum + (r?.rating || 0), 0) /
              reviewCount
            : 0;

        return {
          id: sitter.id,
          sitterName: `${sitter.firstname} ${sitter.lastname}`,
          sitterImageUrl: sitter.profileImageUrl ?? undefined,
          location: sitter.profile?.location?.name ?? null,
          rating: Number(rating.toFixed(1)),
          reviewCount,
          isSaved: (sitter.profile?.savedBy?.length ?? 0) > 0,
        };
      });
    }

    return {
      todaysBookings,
      recentSitters,
      nearbySitters,
    };
  }

  async getPets(ownerId: string) {
    return this.prisma.pet.findMany({
      where: { ownerId },
      select: {
        id: true,
        name: true,
        breed: true,
        imageUrl: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createPet(ownerId: string, dto: CreatePetDto) {
    return this.prisma.pet.create({
      data: {
        ownerId,
        name: dto.name,
        breed: dto.breed,
        imageUrl: dto.imageUrl,
      },
    });
  }

  async deletePet(ownerId: string, petId: string, r2Service: R2Service) {
    const pet = await this.prisma.pet.findUnique({
      where: { id: petId },
    });

    if (!pet) {
      throw new NotFoundException(`Pet with ID ${petId} not found`);
    }

    if (pet.ownerId !== ownerId) {
      throw new ForbiddenException('You can only delete your own pets');
    }

    if (pet.imageUrl) {
      const key = r2Service.extractKeyFromUrl(pet.imageUrl);
      if (key) {
        await r2Service.delete(key);
      }
    }

    await this.prisma.pet.delete({ where: { id: petId } });

    return { message: 'Pet deleted successfully' };
  }

  async uploadPetImage(
    ownerId: string,
    petId: string,
    file: Express.Multer.File,
    r2Service: R2Service,
  ) {
    const pet = await this.prisma.pet.findUnique({
      where: { id: petId },
    });

    if (!pet) {
      throw new NotFoundException(`Pet with ID ${petId} not found`);
    }

    if (pet.ownerId !== ownerId) {
      throw new ForbiddenException('You can only update your own pets');
    }

    if (pet.imageUrl) {
      const oldKey = r2Service.extractKeyFromUrl(pet.imageUrl);
      if (oldKey) {
        await r2Service.delete(oldKey);
      }
    }

    const uploaded = await r2Service.upload(
      file.buffer,
      file.originalname,
      file.mimetype,
      'uploads/pet_pfps',
    );

    await this.prisma.pet.update({
      where: { id: petId },
      data: { imageUrl: uploaded.url },
    });

    return { imageUrl: uploaded.url };
  }
}
