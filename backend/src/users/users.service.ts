import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

const userSelect = {
  id: true,
  firstname: true,
  lastname: true,
  email: true,
  roles: true,
  createdAt: true,
  profileImageUrl: true,
};

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createUser(data: {
    firstname: string;
    lastname: string;
    email: string;
    passwordHash: string;
    roles?: Role[];
    profileImageUrl?: string;
  }) {
    const exists = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (exists) {
      throw new ConflictException('Email already in use');
    }

    return this.prisma.user.create({
      data: {
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        passwordHash: data.passwordHash,
        roles: data.roles ?? [Role.OWNER, Role.SITTER],
        ...(data.profileImageUrl && { profileImageUrl: data.profileImageUrl }),
      },
      select: userSelect,
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: userSelect,
    });
  }

  async findByEmailWithPassword(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });
  }

  async addRole(userId: string, role: Role) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.roles.includes(role)) {
      return user;
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        roles: [...user.roles, role],
      },
      select: userSelect,
    });
  }

  async updateProfile(
    userId: string,
    data: {
      firstname?: string;
      lastname?: string;
      email?: string;
      password?: string;
      location?: string;
      profileImageUrl?: string;
    },
  ) {
    const { firstname, lastname, email, location, password: __ } = data;
    void __;
    const updateData: {
      firstname?: string;
      lastname?: string;
      email?: string;
      emailVerified?: boolean;
      profileImageUrl?: string;
    } = {};

    if (firstname) updateData.firstname = firstname;
    if (lastname) updateData.lastname = lastname;

    if (email) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');

      const emailExists = await this.prisma.user.findUnique({
        where: { email },
      });
      if (emailExists && emailExists.id !== userId) {
        throw new ConflictException('Email already in use');
      }

      updateData.email = email;
      updateData.emailVerified = false;
    }

    if (location !== undefined) {
      const loc = await this.prisma.location.findUnique({
        where: { name: location },
      });

      if (!loc) {
        throw new NotFoundException(`Location '${location}' not found`);
      }

      await this.prisma.profile.upsert({
        where: { userId },
        update: {
          locationId: loc.id,
        },
        create: {
          userId: userId,
          locationId: loc.id,
        },
      });
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return this.getMe(userId);
  }

  async removeRole(userId: string, role: Role) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        roles: user.roles.filter((r) => r !== role),
      },
      select: userSelect,
    });
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        roles: true,
        profileImageUrl: true,
        profile: {
          select: {
            location: {
              select: {
                id: true,
                name: true,
              },
            },
            document: {
              select: {
                id: true,
                status: true,
                fileUrl: true,
                fileKey: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      ...user,
      location: user.profile?.location ?? null,
      document: user.profile?.document ?? null,
    };
  }

  async updateRefreshToken(
    userId: string,
    refreshTokenHash: string,
    refreshTokenJti: string,
    refreshTokenExp: Date,
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshTokenHash,
        refreshTokenJti,
        refreshTokenExp,
      },
    });
  }

  async clearRefreshToken(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshTokenHash: null,
        refreshTokenJti: null,
        refreshTokenExp: null,
      },
    });
  }

  async findByIdWithRefreshToken(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        roles: true,
        refreshTokenHash: true,
        refreshTokenJti: true,
        refreshTokenExp: true,
      },
    });
  }

  async saveEmailOtp(userId: string, otpHash: string, expiresAt: Date) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        emailOtpHash: otpHash,
        emailOtpExpires: expiresAt,
        emailOtpAttempts: 0,
      },
    });
  }

  async incrementOtpAttempts(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        emailOtpAttempts: {
          increment: 1,
        },
      },
    });
  }

  async verifyEmail(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified: true,
        emailOtpHash: null,
        emailOtpExpires: null,
        emailOtpAttempts: 0,
      },
    });
  }

  async findByEmailWithOtp(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        emailOtpHash: true,
        emailOtpExpires: true,
        emailOtpAttempts: true,
      },
    });
  }

  async savePasswordResetOtp(userId: string, otpHash: string, expiresAt: Date) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordResetOtpHash: otpHash,
        passwordResetOtpExpires: expiresAt,
        passwordResetOtpAttempts: 0,
      },
    });
  }

  async findByEmailWithPasswordResetOtp(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordResetOtpHash: true,
        passwordResetOtpExpires: true,
        passwordResetOtpAttempts: true,
      },
    });
  }

  async incrementPasswordResetOtpAttempts(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordResetOtpAttempts: {
          increment: 1,
        },
      },
    });
  }

  async resetPassword(userId: string, newPasswordHash: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
        emailVerified: true,
        passwordResetOtpHash: null,
        passwordResetOtpExpires: null,
        passwordResetOtpAttempts: 0,
        refreshTokenHash: null,
        refreshTokenJti: null,
        refreshTokenExp: null,
      },
    });
  }
  async updateProfileImage(userId: string, imageUrl: string) {
    const profile = await this.prisma.profile.upsert({
      where: { userId },
      create: {
        user: { connect: { id: userId } },
      },
      update: {},
    });

    await this.prisma.profilePicture.upsert({
      where: { profileId: profile.id },
      update: { url: imageUrl },
      create: {
        profileId: profile.id,
        url: imageUrl,
      },
    });

    return this.prisma.user.update({
      where: { id: userId },
      data: { profileImageUrl: imageUrl },
      select: userSelect,
    });
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      oldPassword,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new ConflictException('Invalid old password');
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    return this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
      select: userSelect,
    });
  }

  async deleteAccount(userId: string, passwordVerification: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      passwordVerification,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new ConflictException('Invalid password');
    }

    return this.prisma.user.delete({
      where: { id: userId },
      select: userSelect,
    });
  }

  async updateIdDocument(
    userId: string,
    documentUrl: string,
    documentKey?: string,
  ) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException(
        'Profile not found. Please create a profile first.',
      );
    }

    return this.prisma.document.upsert({
      where: { profileId: profile.id },
      update: {
        fileUrl: documentUrl,
        fileKey: documentKey,
      },
      create: {
        profileId: profile.id,
        fileUrl: documentUrl,
        fileKey: documentKey,
        status: 'UNVERIFIED',
      },
    });
  }

  async getUserProfile(userId: string, requesterId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        profileImageUrl: true,
        profile: {
          select: {
            location: {
              select: {
                name: true,
              },
            },
          },
        },
        ownedPets: {
          select: {
            id: true,
            name: true,
            breed: true,
            imageUrl: true,
          },
        },
        postsAsOwner: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            location: true,
            scheduledTime: true,
            duration: true,
            imageUrl: true,
            status: true,
            pet: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
            service: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const sitterBookings = await this.prisma.booking.findMany({
      where: {
        sitterId: userId,
        status: 'COMPLETED',
        scheduledTime: {
          lt: new Date(),
        },
      },
      select: {
        ownerId: true,
        review: {
          select: {
            rating: true,
          },
        },
      },
    });

    const uniqueClients = new Set(sitterBookings.map((b) => b.ownerId)).size;
    const reviews = sitterBookings.filter((b) => b.review);
    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((acc, curr) => acc + curr.review!.rating, 0) /
          totalReviews
        : 0;

    const ownerBookings = await this.prisma.booking.findMany({
      where: {
        ownerId: userId,
        status: 'COMPLETED',
        scheduledTime: {
          lt: new Date(),
        },
      },
      select: {
        sitterId: true,
        review: {
          select: {
            rating: true,
          },
        },
      },
    });

    const uniqueSittersBooked = new Set(ownerBookings.map((b) => b.sitterId))
      .size;

    const ownerReviews = ownerBookings.filter((b) => b.review);
    const ownerTotalReviews = ownerReviews.length;
    const ownerAverageRating =
      ownerTotalReviews > 0
        ? ownerReviews.reduce((acc, curr) => acc + curr.review!.rating, 0) /
          ownerTotalReviews
        : 0;

    const jobsPosted = await this.prisma.post.count({
      where: {
        ownerId: userId,
      },
    });

    const totalReviewsCombined = totalReviews + ownerTotalReviews;
    const combinedAverageRating =
      totalReviewsCombined > 0
        ? (reviews.reduce((acc, curr) => acc + curr.review!.rating, 0) +
            ownerReviews.reduce((acc, curr) => acc + curr.review!.rating, 0)) /
          totalReviewsCombined
        : 0;

    let previousRating: number | null = null;

    if (requesterId && requesterId !== userId) {
      const previousBookingReview = await this.prisma.booking.findFirst({
        where: {
          OR: [
            { ownerId: requesterId, sitterId: userId },
            { ownerId: userId, sitterId: requesterId },
          ],
          review: { isNot: null },
        },
        orderBy: { scheduledTime: 'desc' },
        select: {
          review: {
            select: {
              rating: true,
            },
          },
        },
      });

      if (previousBookingReview?.review) {
        previousRating = previousBookingReview.review.rating;
      }
    }

    return {
      contactInfo: {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
        location: user.profile?.location?.name || null,
      },
      sitterInfo: {
        clientsWorkedWith: uniqueClients,
        reviewsCount: totalReviews,
        averageRating: Number(averageRating.toFixed(1)),
      },
      ownerInfo: {
        sittersWorkedWith: uniqueSittersBooked,
        jobsPosted: jobsPosted,
        reviewsCount: ownerTotalReviews,
        averageRating: Number(ownerAverageRating.toFixed(1)),
      },
      pets: user.ownedPets,
      posts: user.postsAsOwner,
      previousRating,
      reviewsCount: totalReviewsCombined,
      averageRating: Number(combinedAverageRating.toFixed(1)),
    };
  }

  async reviewUser(reviewerId: string, targetUserId: string, rating: number) {
    if (reviewerId === targetUserId) {
      throw new ConflictException('You cannot review yourself');
    }

    const booking = await this.prisma.booking.findFirst({
      where: {
        OR: [
          { ownerId: reviewerId, sitterId: targetUserId },
          { ownerId: targetUserId, sitterId: reviewerId },
        ],
        status: 'COMPLETED',
        scheduledTime: {
          lt: new Date(),
        },
      },
      orderBy: {
        scheduledTime: 'desc',
      },
      include: {
        review: true,
      },
    });

    if (!booking) {
      throw new BadRequestException(
        'You can only review users you have worked with in a completed job.',
      );
    }
    const review = await this.prisma.review.upsert({
      where: {
        bookingId: booking.id,
      },
      update: {
        rating,
      },
      create: {
        bookingId: booking.id,
        rating,
      },
    });

    const reviewer = await this.prisma.user.findUnique({
      where: { id: reviewerId },
    });

    await this.notificationsService.createNotification(
      targetUserId,
      'NEW_REVIEW',
      'New Review Received',
      `${reviewer?.firstname} left you a ${rating}-star review for your recent booking.`,
      { bookingId: booking.id },
    );

    return review;
  }
}
