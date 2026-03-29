"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const SITTER_EMAIL = 'ramykhb18@gmail.com';
function randomScheduledTime() {
    const now = new Date();
    const daysAhead = Math.floor(Math.random() * 7) + 1;
    const hours = Math.floor(Math.random() * 10) + 8;
    now.setDate(now.getDate() + daysAhead);
    now.setHours(hours, 0, 0, 0);
    return now;
}
const LOREM_IPSUM = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';
const NEARBY_POSTS_DATA = [
    {
        title: 'Energetic Husky needs morning walks',
        location: 'Beirut',
        serviceName: 'Dog Walking',
        duration: '1-2 Hours',
        imageUrl: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?auto=format&fit=crop&w=800&q=80',
        description: LOREM_IPSUM,
        price: 15.0,
        ownerFirstname: 'Sarah',
        ownerLastname: 'Johnson',
        petName: 'Max',
        petBreed: 'Siberian Husky',
    },
    {
        title: 'Persian Cat needs grooming and care',
        location: 'Beirut',
        serviceName: 'Grooming',
        duration: '2-3 Hours',
        imageUrl: 'https://images.unsplash.com/photo-1583511655826-05700d4f7de5?auto=format&fit=crop&w=800&q=80',
        description: LOREM_IPSUM,
        price: 25.0,
        ownerFirstname: 'Michael',
        ownerLastname: 'Chen',
        petName: 'Luna',
        petBreed: 'Persian',
    },
    {
        title: 'Friendly Labrador needs weekend sitting',
        location: 'Jounieh',
        serviceName: 'Pet Sitting',
        duration: '2-3 Days',
        imageUrl: 'https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=800&q=80',
        description: LOREM_IPSUM,
        price: 50.0,
        ownerFirstname: 'Emma',
        ownerLastname: 'Davis',
        petName: 'Charlie',
        petBreed: 'Labrador Retriever',
    },
    {
        title: 'Playful Beagle needs afternoon hiking',
        location: 'Beirut',
        serviceName: 'Dog Walking',
        duration: '3-4 Hours',
        imageUrl: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&w=800&q=80',
        description: LOREM_IPSUM,
        price: 20.0,
        ownerFirstname: 'David',
        ownerLastname: 'Martinez',
        petName: 'Buddy',
        petBreed: 'Beagle',
    },
    {
        title: 'Senior Golden Retriever needs gentle care',
        location: 'Baabda',
        serviceName: 'Pet Sitting',
        duration: '4-5 Hours',
        imageUrl: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?auto=format&fit=crop&w=800&q=80',
        description: LOREM_IPSUM,
        price: 18.0,
        ownerFirstname: 'Lisa',
        ownerLastname: 'Anderson',
        petName: 'Rocky',
        petBreed: 'Golden Retriever',
    },
];
const CLIENT_HISTORY_DATA = [
    {
        firstname: 'James',
        lastname: 'Wilson',
        email: 'james.wilson@example.com',
        petName: 'Bella',
        petBreed: 'French Bulldog',
        serviceName: 'Dog Walking',
        location: 'Beirut',
        rating: 5,
        comment: 'Excellent service! My dog loved the walks.',
    },
    {
        firstname: 'Sophia',
        lastname: 'Brown',
        email: 'sophia.brown@example.com',
        petName: 'Milo',
        petBreed: 'Poodle',
        serviceName: 'Grooming',
        location: 'Beirut',
        rating: 4,
        comment: 'Very professional and caring.',
    },
    {
        firstname: 'Oliver',
        lastname: 'Taylor',
        email: 'oliver.taylor@example.com',
        petName: 'Cooper',
        petBreed: 'Border Collie',
        serviceName: 'Pet Sitting',
        location: 'Jounieh',
        rating: 5,
        comment: 'Great experience! Highly recommend.',
    },
    {
        firstname: 'Isabella',
        lastname: 'Moore',
        email: 'isabella.moore@example.com',
        petName: 'Daisy',
        petBreed: 'Yorkshire Terrier',
        serviceName: 'Dog Walking',
        location: 'Beirut',
        rating: 5,
        comment: 'Wonderful caretaker!',
    },
    {
        firstname: 'Ethan',
        lastname: 'White',
        email: 'ethan.white@example.com',
        petName: 'Zeus',
        petBreed: 'German Shepherd',
        serviceName: 'Health Care',
        location: 'Baabda',
        rating: 4,
        comment: 'Good service, very reliable.',
    },
];
const BOOKINGS_DATA = [
    {
        ownerFirstname: 'Ava',
        ownerLastname: 'Harris',
        email: 'ava.harris@example.com',
        petName: 'Oscar',
        petBreed: 'Cocker Spaniel',
        serviceName: 'Dog Walking',
        location: 'Beirut',
        daysFromToday: 0,
        time: '09:00',
    },
    {
        ownerFirstname: 'Noah',
        ownerLastname: 'Clark',
        email: 'noah.clark@example.com',
        petName: 'Coco',
        petBreed: 'Chihuahua',
        serviceName: 'Pet Sitting',
        location: 'Jounieh',
        daysFromToday: 0,
        time: '14:30',
    },
    {
        ownerFirstname: 'Mia',
        ownerLastname: 'Lewis',
        email: 'mia.lewis@example.com',
        petName: 'Simba',
        petBreed: 'Maine Coon',
        serviceName: 'Grooming',
        location: 'Beirut',
        daysFromToday: 1,
        time: '10:00',
    },
    {
        ownerFirstname: 'Liam',
        ownerLastname: 'Johnson',
        email: 'liam.johnson@example.com',
        petName: 'Luna',
        petBreed: 'Pomeranian',
        serviceName: 'Dog Walking',
        location: 'Beirut',
        daysFromToday: 1,
        time: '15:00',
    },
    {
        ownerFirstname: 'Emma',
        ownerLastname: 'Williams',
        email: 'emma.williams@example.com',
        petName: 'Rex',
        petBreed: 'Rottweiler',
        serviceName: 'Medication Administration',
        location: 'Baabda',
        daysFromToday: 3,
        time: '08:00',
    },
    {
        ownerFirstname: 'Lucas',
        ownerLastname: 'Brown',
        email: 'lucas.brown@example.com',
        petName: 'Mittens',
        petBreed: 'British Shorthair',
        serviceName: 'Pet Sitting',
        location: 'Jounieh',
        daysFromToday: 5,
        time: '12:00',
    },
    {
        ownerFirstname: 'Olivia',
        ownerLastname: 'Garcia',
        email: 'olivia.garcia@example.com',
        petName: 'Duke',
        petBreed: 'Boxer',
        serviceName: 'Dog Walking',
        location: 'Beirut',
        daysFromToday: 7,
        time: '17:00',
    },
];
async function main() {
    console.log('🔍 Looking for sitter user: ' + SITTER_EMAIL);
    let sitter = await prisma.user.findUnique({
        where: { email: SITTER_EMAIL },
        include: { profile: true },
    });
    if (!sitter) {
        console.log('❌ Sitter not found. Please create the user first.');
        process.exit(1);
    }
    console.log(`✅ Found sitter: ${sitter.firstname} ${sitter.lastname}`);
    if (!sitter.roles.includes('SITTER')) {
        console.log('Adding SITTER role...');
        const updatedRoles = [...new Set([...sitter.roles, 'SITTER'])];
        sitter = await prisma.user.update({
            where: { id: sitter.id },
            data: {
                roles: updatedRoles,
            },
            include: { profile: true },
        });
    }
    if (!sitter.profile) {
        console.log('Creating profile for sitter...');
        let beirutLocation = await prisma.location.findUnique({
            where: { name: 'Beirut' },
        });
        if (!beirutLocation) {
            console.log('Creating Beirut location...');
            beirutLocation = await prisma.location.create({
                data: { name: 'Beirut' },
            });
        }
        await prisma.profile.create({
            data: {
                userId: sitter.id,
                locationId: beirutLocation.id,
            },
        });
    }
    console.log('\n📝 Creating sample data...\n');
    console.log('Creating nearby posts...');
    for (const postData of NEARBY_POSTS_DATA) {
        let owner = await prisma.user.findUnique({
            where: {
                email: `${postData.ownerFirstname.toLowerCase()}.${postData.ownerLastname.toLowerCase()}@example.com`,
            },
        });
        if (!owner) {
            owner = await prisma.user.create({
                data: {
                    email: `${postData.ownerFirstname.toLowerCase()}.${postData.ownerLastname.toLowerCase()}@example.com`,
                    firstname: postData.ownerFirstname,
                    lastname: postData.ownerLastname,
                    passwordHash: 'hashed_password_placeholder',
                    roles: ['OWNER'],
                },
            });
        }
        if (!owner.roles.includes('OWNER')) {
            const updatedRoles = [...new Set([...owner.roles, 'OWNER'])];
            owner = await prisma.user.update({
                where: { id: owner.id },
                data: {
                    roles: updatedRoles,
                },
            });
        }
        let locationRecord = await prisma.location.findUnique({
            where: { name: postData.location },
        });
        if (!locationRecord) {
            locationRecord = await prisma.location.create({
                data: { name: postData.location },
            });
        }
        const existingProfile = await prisma.profile.findUnique({
            where: { userId: owner.id },
        });
        if (!existingProfile) {
            await prisma.profile.create({
                data: {
                    userId: owner.id,
                    locationId: locationRecord.id,
                },
            });
        }
        let pet = await prisma.pet.findFirst({
            where: {
                name: postData.petName,
                ownerId: owner.id,
            },
        });
        if (!pet) {
            pet = await prisma.pet.create({
                data: {
                    name: postData.petName,
                    breed: postData.petBreed,
                    ownerId: owner.id,
                },
            });
        }
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
                service: { connect: { id: service.id } },
                duration: postData.duration,
                scheduledTime: new Date(Date.now() + Math.floor(Math.random() * 14 + 1) * 24 * 60 * 60 * 1000),
                imageUrl: postData.imageUrl,
                description: postData.description,
                price: postData.price,
                status: 'OPEN',
                owner: { connect: { id: owner.id } },
                pet: { connect: { id: pet.id } },
            },
        });
        console.log(`  ✓ Created post: ${postData.title}`);
    }
    console.log('\nCreating client history...');
    for (const clientData of CLIENT_HISTORY_DATA) {
        let owner = await prisma.user.findUnique({
            where: { email: clientData.email },
        });
        if (!owner) {
            owner = await prisma.user.create({
                data: {
                    email: clientData.email,
                    firstname: clientData.firstname,
                    lastname: clientData.lastname,
                    passwordHash: 'hashed_password_placeholder',
                    roles: ['OWNER'],
                },
            });
        }
        let locationRecord = await prisma.location.findUnique({
            where: { name: clientData.location },
        });
        if (!locationRecord) {
            locationRecord = await prisma.location.create({
                data: { name: clientData.location },
            });
        }
        const existingProfile = await prisma.profile.findUnique({
            where: { userId: owner.id },
        });
        if (!existingProfile) {
            await prisma.profile.create({
                data: {
                    userId: owner.id,
                    locationId: locationRecord.id,
                },
            });
        }
        let pet = await prisma.pet.findFirst({
            where: {
                name: clientData.petName,
                ownerId: owner.id,
            },
        });
        if (!pet) {
            pet = await prisma.pet.create({
                data: {
                    name: clientData.petName,
                    breed: clientData.petBreed,
                    ownerId: owner.id,
                },
            });
        }
        const service = await prisma.service.findUnique({
            where: { name: clientData.serviceName },
        });
        if (!service) {
            console.warn(`Service "${clientData.serviceName}" not found, skipping client`);
            continue;
        }
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - Math.floor(Math.random() * 30) - 1);
        const booking = await prisma.booking.create({
            data: {
                sitterId: sitter.id,
                ownerId: owner.id,
                petId: pet.id,
                serviceId: service.id,
                location: clientData.location,
                scheduledTime: pastDate,
                status: 'COMPLETED',
            },
        });
        await prisma.review.create({
            data: {
                bookingId: booking.id,
                rating: clientData.rating,
                comment: clientData.comment,
            },
        });
        console.log(`  ✓ Created client: ${clientData.firstname} ${clientData.lastname}`);
    }
    console.log('\nCreating bookings (today, tomorrow, and future)...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (const bookingData of BOOKINGS_DATA) {
        let owner = await prisma.user.findUnique({
            where: { email: bookingData.email },
        });
        if (!owner) {
            owner = await prisma.user.create({
                data: {
                    email: bookingData.email,
                    firstname: bookingData.ownerFirstname,
                    lastname: bookingData.ownerLastname,
                    passwordHash: 'hashed_password_placeholder',
                    roles: ['OWNER'],
                },
            });
        }
        let locationRecord = await prisma.location.findUnique({
            where: { name: bookingData.location },
        });
        if (!locationRecord) {
            locationRecord = await prisma.location.create({
                data: { name: bookingData.location },
            });
        }
        const existingProfile = await prisma.profile.findUnique({
            where: { userId: owner.id },
        });
        if (!existingProfile) {
            await prisma.profile.create({
                data: {
                    userId: owner.id,
                    locationId: locationRecord.id,
                },
            });
        }
        let pet = await prisma.pet.findFirst({
            where: {
                name: bookingData.petName,
                ownerId: owner.id,
            },
        });
        if (!pet) {
            pet = await prisma.pet.create({
                data: {
                    name: bookingData.petName,
                    breed: bookingData.petBreed,
                    ownerId: owner.id,
                },
            });
        }
        const service = await prisma.service.findUnique({
            where: { name: bookingData.serviceName },
        });
        if (!service) {
            console.warn(`Service "${bookingData.serviceName}" not found, skipping booking`);
            continue;
        }
        const bookingDate = new Date(today);
        bookingDate.setDate(bookingDate.getDate() + bookingData.daysFromToday);
        const [hours, minutes] = bookingData.time.split(':');
        bookingDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        await prisma.booking.create({
            data: {
                sitterId: sitter.id,
                ownerId: owner.id,
                petId: pet.id,
                serviceId: service.id,
                location: bookingData.location,
                scheduledTime: bookingDate,
                status: 'CONFIRMED',
            },
        });
        const dateLabel = bookingData.daysFromToday === 0
            ? 'Today'
            : bookingData.daysFromToday === 1
                ? 'Tomorrow'
                : `${bookingDate.toLocaleDateString()}`;
        console.log(`  ✓ Created booking: ${bookingData.ownerFirstname} ${bookingData.ownerLastname} - ${dateLabel} at ${bookingData.time}`);
    }
    console.log('\n✅ Successfully seeded all data for ' + SITTER_EMAIL);
    console.log('\nSummary:');
    console.log(`  - ${NEARBY_POSTS_DATA.length} nearby posts created`);
    console.log(`  - ${CLIENT_HISTORY_DATA.length} recent clients with reviews created`);
    console.log(`  - ${BOOKINGS_DATA.length} bookings created (today, tomorrow, and future)`);
}
main()
    .catch((e) => {
    console.error('❌ Error seeding sitter data:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed-sitter-data.js.map