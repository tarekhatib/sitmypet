import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ExploreQueryDto, SortBy } from './dto/explore-query.dto';
import { ExploreResponseDto } from './dto/explore-response.dto';
import { SitterHomeFeedDto } from './dto/sitter-home.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SitterService {
  constructor(private readonly prisma: PrismaService) {}

  async getHomeFeed(userId: string): Promise<SitterHomeFeedDto> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const bookings = await this.prisma.booking.findMany({
      where: {
        sitterId: userId,
        scheduledTime: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        owner: true,
        pet: true,
        service: true,
      },
      orderBy: {
        scheduledTime: 'asc',
      },
    });

    const todaysBookings = bookings.map((booking) => ({
      id: booking.id,
      ownerName: `${booking.owner.firstname} ${booking.owner.lastname}`,
      petName: booking.pet.name,
      ownerImageURL: booking.owner.profileImageUrl ?? undefined,
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
        sitterId: userId,
        status: 'COMPLETED',
      },
      include: {
        owner: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const uniqueOwners = new Map();
    for (const booking of completedBookings) {
      if (!uniqueOwners.has(booking.ownerId) && uniqueOwners.size < 10) {
        uniqueOwners.set(booking.ownerId, {
          id: booking.owner.id,
          ownerName: `${booking.owner.firstname} ${booking.owner.lastname}`,
          ownerImageUrl: booking.owner.profileImageUrl ?? undefined,
          location: booking.location,
          lastBookingDate: booking.scheduledTime,
        });
      }
    }
    const recentClients = Array.from(uniqueOwners.values());

    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: { location: true },
    });

    const locationName = profile?.location?.name;

    type PostWithRelations = Prisma.PostGetPayload<{
      include: {
        service: true;
        owner: {
          include: {
            bookingsAsOwner: {
              include: {
                review: true;
              };
            };
          };
        };
        savedBy: true;
      };
    }>;

    let posts: PostWithRelations[] = [];
    let nearbyPosts: any[] | null = null;

    if (locationName) {
      posts = await this.prisma.post.findMany({
        where: {
          status: 'OPEN',
          ownerId: { not: userId },
          scheduledTime: { gte: new Date() },
          location: {
            contains: locationName,
            mode: 'insensitive',
          },
        },
        include: {
          service: true,
          owner: {
            include: {
              bookingsAsOwner: {
                where: {
                  status: 'COMPLETED',
                },
                include: {
                  review: true,
                },
              },
            },
          },
          savedBy: {
            where: {
              userId: userId,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      });

      nearbyPosts = posts.map((post) => {
        const reviews = post.owner.bookingsAsOwner
          .map((booking) => booking.review)
          .filter((review) => review !== null);

        const reviewCount = reviews.length;
        const rating =
          reviewCount > 0
            ? reviews.reduce((sum, review) => sum + (review?.rating || 0), 0) /
              reviewCount
            : 0;

        return {
          id: post.id,
          title: post.title,
          location: post.location,
          service: {
            id: post.service.id,
            name: post.service.name,
          },
          duration: post.duration,
          rating: Number(rating.toFixed(1)),
          reviewCount: reviewCount,
          imageUrl: post.imageUrl ?? undefined,
          isSaved: post.savedBy.length > 0,
        };
      });
    }

    return {
      todaysBookings,
      recentClients: recentClients as {
        id: string;
        ownerName: string;
        ownerImageUrl?: string;
        location: string;
        lastBookingDate: Date;
      }[],
      nearbyPosts,
    };
  }

  async explore(
    query: ExploreQueryDto,
    userId: string,
  ): Promise<ExploreResponseDto> {
    const {
      search,
      services,
      location,
      sortBy,
      minRating,
      page = 1,
      limit = 20,
    } = query;

    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: { location: true },
    });
    const sitterLocation = profile?.location?.name || '';

    const where: Prisma.PostWhereInput = {
      status: 'OPEN',
      ownerId: { not: userId },
      scheduledTime: { gte: new Date() },
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        {
          owner: {
            OR: [
              { firstname: { contains: search, mode: 'insensitive' } },
              { lastname: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    if (services) {
      const service = await this.prisma.service.findFirst({
        where: { name: { equals: services, mode: 'insensitive' } },
      });
      if (service) {
        where.serviceId = service.id;
      }
    }

    const postsData = await this.prisma.post.findMany({
      where,
      include: {
        service: true,
        owner: {
          include: {
            bookingsAsOwner: {
              where: { status: 'COMPLETED' },
              include: { review: true },
            },
          },
        },
        savedBy: {
          where: { userId },
        },
      },
    });

    type PostWithAll = Prisma.PostGetPayload<{
      include: {
        service: true;
        owner: {
          include: {
            bookingsAsOwner: {
              include: { review: true };
            };
          };
        };
        savedBy: true;
      };
    }>;

    const posts = postsData as unknown as PostWithAll[];

    let processedPosts = posts.map((post) => {
      const reviews = post.owner.bookingsAsOwner
        .map((b) => b.review)
        .filter((r) => r !== null);

      const totalRating = reviews.reduce((sum, r) => sum + (r?.rating || 0), 0);
      const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;
      const reviewCount = reviews.length;

      const isNear =
        sitterLocation &&
        post.location.toLowerCase().includes(sitterLocation.toLowerCase());

      return {
        ...post,
        avgRating,
        reviewCount,
        isNear,
      };
    });

    if (minRating !== undefined) {
      processedPosts = processedPosts.filter((r) => r.avgRating >= minRating);
    }
    if (
      sortBy === SortBy.HIGHEST_RATED ||
      sortBy === SortBy.RATING_HIGH_TO_LOW
    ) {
      processedPosts.sort((a, b) => b.avgRating - a.avgRating);
    } else if (sortBy === SortBy.MOST_REVIEWS) {
      processedPosts.sort((a, b) => b.reviewCount - a.reviewCount);
    } else if (
      sortBy === SortBy.LOWEST_PRICE ||
      sortBy === SortBy.PRICE_LOW_TO_HIGH
    ) {
      processedPosts.sort(
        (a, b) => (Number(a.price) || 0) - (Number(b.price) || 0),
      );
    } else if (
      sortBy === SortBy.HIGHEST_PRICE ||
      sortBy === SortBy.PRICE_HIGH_TO_LOW
    ) {
      processedPosts.sort(
        (a, b) => (Number(b.price) || 0) - (Number(a.price) || 0),
      );
    } else if (sortBy === SortBy.NEAREST_FIRST) {
      processedPosts.sort((a, b) => {
        if (a.isNear && !b.isNear) return -1;
        if (!a.isNear && b.isNear) return 1;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
    } else {
      processedPosts.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      );
    }

    const total = processedPosts.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedPosts = processedPosts.slice(start, end);

    const postDtos = paginatedPosts.map((post) => ({
      id: post.id,
      ownerName: `${post.owner.firstname} ${post.owner.lastname}`,
      imageUrl: post.imageUrl ?? undefined,
      title: post.title,
      location: post.location,
      service: {
        id: post.service.id,
        name: post.service.name,
      },
      duration: post.duration,
      createdAt: post.createdAt,
      price: post.price ? Number(post.price) : undefined,
      rating: Number(post.avgRating.toFixed(1)),
      reviewCount: post.reviewCount,
      isSaved: post.savedBy.length > 0,
    }));

    return {
      posts: postDtos,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async toggleSavedPost(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const existingSave = await this.prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existingSave) {
      await this.prisma.savedPost.delete({
        where: { id: existingSave.id },
      });
      return { saved: false };
    } else {
      await this.prisma.savedPost.create({
        data: {
          userId,
          postId,
        },
      });
      return { saved: true };
    }
  }

  async getSavedPosts(userId: string) {
    await this.prisma.savedPost.deleteMany({
      where: {
        userId,
        post: { scheduledTime: { lt: new Date() } },
      },
    });

    const savedPosts = await this.prisma.savedPost.findMany({
      where: {
        userId,
        post: {
          status: 'OPEN',
          scheduledTime: { gte: new Date() },
        },
      },
      include: {
        post: {
          include: {
            service: true,
            owner: {
              include: {
                bookingsAsOwner: {
                  where: { status: 'COMPLETED' },
                  include: { review: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      posts: savedPosts.map((savedPostItem) => {
        const post = savedPostItem.post;
        const reviews = post.owner.bookingsAsOwner
          .map((b) => b.review)
          .filter((r) => r !== null);

        const totalRating = reviews.reduce(
          (sum, r) => sum + (r?.rating || 0),
          0,
        );
        const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;
        const reviewCount = reviews.length;

        return {
          id: post.id,
          title: post.title,
          location: post.location,
          service: {
            id: post.service.id,
            name: post.service.name,
          },
          duration: post.duration,
          imageUrl: post.imageUrl ?? undefined,
          ownerName: `${post.owner.firstname} ${post.owner.lastname}`,
          price: post.price ? Number(post.price) : undefined,
          rating: Number(avgRating.toFixed(1)),
          reviewCount: reviewCount,
          isSaved: true,
          createdAt: post.createdAt,
        };
      }),
    };
  }
}
