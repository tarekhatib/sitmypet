import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ApplicationsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async apply(postId: string, sitterId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const existing = await this.prisma.application.findFirst({
      where: {
        postId,
        sitterId,
      },
    });

    if (existing) {
      throw new BadRequestException('Already applied to this job');
    }

    const application = await this.prisma.application.create({
      data: {
        postId,
        sitterId,
        status: 'PENDING',
        updatedAt: new Date(),
      },
      include: {
        post: true,
        sitter: true,
      },
    });

    await this.notificationsService.createNotification(
      post.ownerId,
      'NEW_APPLICATION',
      'New Application',
      `${application.sitter.firstname} applied to your post titled "${post.title}"`,
      { applicationId: application.id, postId: post.id },
    );

    return application;
  }

  async withdraw(postId: string, sitterId: string) {
    const application = await this.prisma.application.findFirst({
      where: {
        postId,
        sitterId,
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    await this.prisma.application.delete({
      where: { id: application.id },
    });

    return { success: true };
  }

  async getApplicationsByPostId(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.ownerId !== userId) {
      throw new BadRequestException(
        'You do not have permission to view these applications',
      );
    }

    return this.prisma.application.findMany({
      where: {
        postId,
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        sitter: {
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
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async acceptApplication(applicationId: string, ownerId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        post: true,
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.post.ownerId !== ownerId) {
      throw new BadRequestException(
        'You do not have permission to accept this application',
      );
    }

    if (application.post.scheduledTime < new Date()) {
      throw new BadRequestException(
        'Cannot accept application: this post has already expired',
      );
    }

    if (!application.post.petId) {
      throw new BadRequestException(
        'Cannot accept application: Post is missing an associated pet ID',
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          sitterId: application.sitterId,
          ownerId: application.post.ownerId,
          petId: application.post.petId!,
          serviceId: application.post.serviceId,
          location: application.post.location,
          scheduledTime: application.post.scheduledTime,
          status: 'CONFIRMED',
        },
      });

      await tx.post.update({
        where: { id: application.postId },
        data: { status: 'CLOSED' },
      });

      await tx.application.deleteMany({
        where: { postId: application.postId },
      });

      return booking;
    });

    const owner = await this.prisma.user.findUnique({
      where: { id: ownerId },
    });

    await this.notificationsService.createNotification(
      application.sitterId,
      'APPLICATION_ACCEPTED',
      'Application Accepted',
      `${owner?.firstname} accepted your application for the post "${application.post.title}"`,
      { bookingId: result.id },
    );

    return result;
  }

  async getOwnerRequests(ownerId: string) {
    return this.prisma.application.findMany({
      where: {
        post: {
          ownerId,
          status: 'OPEN',
        },
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        post: {
          select: {
            id: true,
            title: true,
            location: true,
            duration: true,
            service: {
              select: {
                name: true,
              },
            },
          },
        },
        sitter: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
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
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async rejectApplication(applicationId: string, ownerId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        post: true,
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.post.ownerId !== ownerId) {
      throw new BadRequestException(
        'You do not have permission to reject this application',
      );
    }

    await this.prisma.application.delete({
      where: { id: applicationId },
    });

    const owner = await this.prisma.user.findUnique({
      where: { id: ownerId },
    });

    await this.notificationsService.createNotification(
      application.sitterId,
      'APPLICATION_REJECTED',
      'Application Rejected',
      `${owner?.firstname} rejected your application for the post "${application.post.title}"`,
      { postId: application.postId },
    );

    return { success: true };
  }
}
