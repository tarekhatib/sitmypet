"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const LOREM_IPSUM = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
const SAMPLE_POSTS = [
    {
        title: 'Golden Retriever needs a hike buddy',
        location: 'Dahyeh, Beirut',
        serviceName: 'Dog Walking',
        duration: '2-3 Days',
        imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
        description: LOREM_IPSUM,
        price: 25.0,
    },
    {
        title: 'Playful Kitten needs afternoon sitting',
        location: 'Hamra, Beirut',
        serviceName: 'Pet Sitting',
        duration: '4-5 Hours',
        imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
        description: LOREM_IPSUM,
        price: 15.0,
    },
    {
        title: 'Senior Dog needs gentle walks',
        location: 'Ashrafieh, Beirut',
        serviceName: 'Grooming',
        duration: '1 Hour',
        imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80',
        description: LOREM_IPSUM,
        price: 10.0,
    },
];
function randomScheduledTime() {
    const now = new Date();
    const daysAhead = Math.floor(Math.random() * 14) + 1;
    const hours = Math.floor(Math.random() * 10) + 8;
    const minutes = Math.random() < 0.5 ? 0 : 30;
    const date = new Date(now);
    date.setDate(now.getDate() + daysAhead);
    date.setHours(hours, minutes, 0, 0);
    return date;
}
async function main() {
    console.log('Cleaning up existing posts...');
    try {
        await prisma.savedPost.deleteMany({});
        await prisma.post.deleteMany({});
    }
    catch (err) {
        console.log('No posts to delete or tables not ready yet.');
    }
    console.log('Ensuring an owner and a pet exist...');
    let owner = await prisma.user.findFirst({
        where: { roles: { has: 'OWNER' } },
        include: { ownedPets: true },
    });
    if (!owner) {
        console.log('No owner found, looking for any user to assign OWNER role...');
        const anyUser = await prisma.user.findFirst();
        if (anyUser) {
            owner = await prisma.user.update({
                where: { id: anyUser.id },
                data: { roles: { set: ['OWNER'] } },
                include: { ownedPets: true },
            });
        }
        else {
            console.log('No user found at all, creating a test user...');
            owner = await prisma.user.create({
                data: {
                    email: 'testowner@example.com',
                    firstname: 'Test',
                    lastname: 'Owner',
                    passwordHash: 'hashed_password',
                    roles: ['OWNER'],
                },
                include: { ownedPets: true },
            });
        }
        const locationName = 'Beirut';
        let locationRecord = await prisma.location.findUnique({
            where: { name: locationName },
        });
        if (!locationRecord) {
            locationRecord = await prisma.location.create({
                data: { name: locationName },
            });
        }
        const existingProfile = await prisma.profile.findUnique({
            where: { userId: owner.id },
        });
        if (!existingProfile) {
            console.log(`Creating a Profile for ${owner.firstname}...`);
            await prisma.profile.create({
                data: {
                    userId: owner.id,
                    locationId: locationRecord.id,
                },
            });
        }
    }
    let pet = owner.ownedPets[0];
    if (!pet) {
        console.log(`Creating a sample pet for owner ${owner.firstname}...`);
        pet = await prisma.pet.create({
            data: {
                name: 'Buddy',
                breed: 'Golden Retriever',
                ownerId: owner.id,
            },
        });
    }
    console.log(`Creating 3 sample posts for owner ${owner.firstname} and pet ${pet.name}...`);
    for (const postData of SAMPLE_POSTS) {
        const service = await prisma.service.findUnique({
            where: { name: postData.serviceName },
        });
        if (!service) {
            console.warn(`Service "${postData.serviceName}" not found, skipping post`);
            continue;
        }
        await prisma.post.create({
            data: {
                title: postData.title,
                location: postData.location,
                duration: postData.duration,
                scheduledTime: randomScheduledTime(),
                imageUrl: postData.imageUrl,
                description: postData.description,
                price: postData.price,
                status: 'OPEN',
                service: {
                    connect: { id: service.id },
                },
                owner: {
                    connect: { id: owner.id },
                },
                pet: {
                    connect: { id: pet.id },
                },
            },
        });
    }
    console.log('Successfully seeded 3 sample posts with images.');
}
main()
    .catch((e) => {
    console.error('Error seeding posts:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed-posts.js.map