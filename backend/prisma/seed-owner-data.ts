import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// The owner we are seeding data FOR (the logged-in test account)
const OWNER_EMAIL = 'ramykhb18@gmail.com';
// const OWNER_EMAIL = 'tarekalkhatibb@gmail.com';

// Run after the other seeds:
// npx ts-node prisma/seed-locations.ts && npx ts-node prisma/seed-services.ts && npx ts-node prisma/seed-posts.ts && npx ts-node prisma/seed-sitter-data.ts && npx ts-node prisma/seed-owner-data.ts

// ---------------------------------------------------------------------------
// Sitter accounts that will appear in Today's Bookings & Sitter History
// ---------------------------------------------------------------------------
const SITTER_ACCOUNTS = [
  {
    email: 'alice.morgan@example.com',
    firstname: 'Alice',
    lastname: 'Morgan',
    location: 'Beirut',
  },
  {
    email: 'ben.carter@example.com',
    firstname: 'Ben',
    lastname: 'Carter',
    location: 'Jounieh',
  },
  {
    email: 'clara.reed@example.com',
    firstname: 'Clara',
    lastname: 'Reed',
    location: 'Beirut',
  },
  {
    email: 'daniel.fox@example.com',
    firstname: 'Daniel',
    lastname: 'Fox',
    location: 'Baabda',
  },
];

// ---------------------------------------------------------------------------
// Today's bookings  (status: CONFIRMED)
// ---------------------------------------------------------------------------
const TODAYS_BOOKINGS_DATA = [
  {
    sitterEmail: 'alice.morgan@example.com',
    petName: 'Biscuit',
    petBreed: 'Shih Tzu',
    serviceName: 'Dog Walking',
    location: 'Beirut',
    time: '09:30',
  },
  {
    sitterEmail: 'ben.carter@example.com',
    petName: 'Noodle',
    petBreed: 'Dachshund',
    serviceName: 'Pet Sitting',
    location: 'Jounieh',
    time: '14:00',
  },
];

// ---------------------------------------------------------------------------
// Past completed bookings  (status: COMPLETED) → drives "Sitter History"
// ---------------------------------------------------------------------------
const HISTORY_DATA = [
  {
    sitterEmail: 'alice.morgan@example.com',
    petName: 'Biscuit',
    petBreed: 'Shih Tzu',
    serviceName: 'Dog Walking',
    location: 'Beirut',
    daysAgo: 10,
    rating: 5,
    comment: 'Alice was amazing with Biscuit!',
  },
  {
    sitterEmail: 'ben.carter@example.com',
    petName: 'Noodle',
    petBreed: 'Dachshund',
    serviceName: 'Pet Sitting',
    location: 'Jounieh',
    daysAgo: 18,
    rating: 4,
    comment: 'Very attentive and professional.',
  },
  {
    sitterEmail: 'clara.reed@example.com',
    petName: 'Biscuit',
    petBreed: 'Shih Tzu',
    serviceName: 'Grooming',
    location: 'Beirut',
    daysAgo: 25,
    rating: 5,
    comment: 'Clara did a wonderful job grooming Biscuit.',
  },
  {
    sitterEmail: 'daniel.fox@example.com',
    petName: 'Noodle',
    petBreed: 'Dachshund',
    serviceName: 'Health Care',
    location: 'Baabda',
    daysAgo: 35,
    rating: 4,
    comment: 'Reliable and caring.',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function findOrCreateSitter(data: {
  email: string;
  firstname: string;
  lastname: string;
  location: string;
}) {
  let user = await prisma.user.findUnique({ where: { email: data.email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: data.email,
        firstname: data.firstname,
        lastname: data.lastname,
        passwordHash: 'hashed_password_placeholder',
        roles: ['SITTER'],
      },
    });
  } else if (!user.roles.includes('SITTER')) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { roles: { set: [...new Set([...user.roles, 'SITTER'])] as any } },
    });
  }

  // Ensure profile + location
  let locationRecord = await prisma.location.findUnique({
    where: { name: data.location },
  });
  if (!locationRecord) {
    locationRecord = await prisma.location.create({
      data: { name: data.location },
    });
  }

  const existingProfile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });
  if (!existingProfile) {
    await prisma.profile.create({
      data: { userId: user.id, locationId: locationRecord.id },
    });
  }

  return user;
}

async function findOrCreatePet(
  ownerId: string,
  petName: string,
  petBreed: string,
) {
  const existing = await prisma.pet.findFirst({
    where: { name: petName, ownerId },
  });
  if (existing) return existing;

  return prisma.pet.create({
    data: { name: petName, breed: petBreed, ownerId },
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log(`\n🔍 Looking for owner: ${OWNER_EMAIL}`);

  const owner = await prisma.user.findUnique({
    where: { email: OWNER_EMAIL },
    include: { profile: true },
  });

  if (!owner) {
    console.error(
      '❌ Owner not found. Make sure the account exists before running this seed.',
    );
    process.exit(1);
  }

  console.log(`✅ Found owner: ${owner.firstname} ${owner.lastname}`);

  // Ensure owner has the OWNER role
  if (!owner.roles.includes('OWNER')) {
    await prisma.user.update({
      where: { id: owner.id },
      data: {
        roles: {
          set: [...new Set([...owner.roles, 'OWNER'])] as any,
        },
      },
    });
    console.log('   Added OWNER role');
  }

  // Ensure owner has a profile with Beirut location
  if (!owner.profile) {
    let beirut = await prisma.location.findUnique({ where: { name: 'Beirut' } });
    if (!beirut) {
      beirut = await prisma.location.create({ data: { name: 'Beirut' } });
    }
    await prisma.profile.create({
      data: { userId: owner.id, locationId: beirut.id },
    });
    console.log('   Created owner profile (Beirut)');
  }

  // ---------------------------------------------------------------------------
  // 1. Seed sitter accounts
  // ---------------------------------------------------------------------------
  console.log("\n👤 Ensuring sitter accounts exist...");
  for (const s of SITTER_ACCOUNTS) {
    await findOrCreateSitter(s);
    console.log(`   ✓ ${s.firstname} ${s.lastname}`);
  }

  // ---------------------------------------------------------------------------
  // 2. Today's bookings  (CONFIRMED, scheduledTime = today at specified hour)
  // ---------------------------------------------------------------------------
  console.log("\n📅 Creating today's bookings...");
  const todayBase = new Date();
  todayBase.setHours(0, 0, 0, 0);

  for (const b of TODAYS_BOOKINGS_DATA) {
    const sitter = await prisma.user.findUnique({ where: { email: b.sitterEmail } });
    if (!sitter) {
      console.warn(`   ⚠ Sitter ${b.sitterEmail} not found, skipping`);
      continue;
    }

    const service = await prisma.service.findUnique({ where: { name: b.serviceName } });
    if (!service) {
      console.warn(`   ⚠ Service "${b.serviceName}" not found, skipping`);
      continue;
    }

    const pet = await findOrCreatePet(owner.id, b.petName, b.petBreed);

    const [hours, minutes] = b.time.split(':').map(Number);
    const scheduledTime = new Date(todayBase);
    scheduledTime.setHours(hours, minutes, 0, 0);

    // Avoid creating duplicate bookings for the same owner+sitter+service+day
    const existing = await prisma.booking.findFirst({
      where: {
        ownerId: owner.id,
        sitterId: sitter.id,
        serviceId: service.id,
        scheduledTime,
      },
    });

    if (!existing) {
      await prisma.booking.create({
        data: {
          ownerId: owner.id,
          sitterId: sitter.id,
          petId: pet.id,
          serviceId: service.id,
          location: b.location,
          scheduledTime,
          status: 'CONFIRMED',
        },
      });
      console.log(`   ✓ Booking with ${sitter.firstname} at ${b.time}`);
    } else {
      console.log(`   ↩ Already exists: booking with ${sitter.firstname} at ${b.time}`);
    }
  }

  // ---------------------------------------------------------------------------
  // 3. Completed past bookings  (COMPLETED → drives Sitter History)
  // ---------------------------------------------------------------------------
  console.log('\n🕑 Creating past completed bookings (sitter history)...');

  for (const h of HISTORY_DATA) {
    const sitter = await prisma.user.findUnique({ where: { email: h.sitterEmail } });
    if (!sitter) {
      console.warn(`   ⚠ Sitter ${h.sitterEmail} not found, skipping`);
      continue;
    }

    const service = await prisma.service.findUnique({ where: { name: h.serviceName } });
    if (!service) {
      console.warn(`   ⚠ Service "${h.serviceName}" not found, skipping`);
      continue;
    }

    const pet = await findOrCreatePet(owner.id, h.petName, h.petBreed);

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - h.daysAgo);
    pastDate.setHours(10, 0, 0, 0);

    // Avoid creating duplicate completed bookings
    const existing = await prisma.booking.findFirst({
      where: {
        ownerId: owner.id,
        sitterId: sitter.id,
        serviceId: service.id,
        status: 'COMPLETED',
      },
    });

    if (!existing) {
      const booking = await prisma.booking.create({
        data: {
          ownerId: owner.id,
          sitterId: sitter.id,
          petId: pet.id,
          serviceId: service.id,
          location: h.location,
          scheduledTime: pastDate,
          status: 'COMPLETED',
        },
      });

      await prisma.review.create({
        data: {
          bookingId: booking.id,
          rating: h.rating,
          comment: h.comment,
        },
      });

      console.log(
        `   ✓ Completed booking with ${sitter.firstname} (${h.daysAgo} days ago, rated ${h.rating}★)`,
      );
    } else {
      console.log(`   ↩ Already exists: completed booking with ${sitter.firstname}`);
    }
  }

  console.log('\n✅ Owner data seed complete for ' + OWNER_EMAIL);
  console.log('\nSummary:');
  console.log(`  - ${SITTER_ACCOUNTS.length} sitter accounts ensured`);
  console.log(`  - ${TODAYS_BOOKINGS_DATA.length} today\'s bookings created`);
  console.log(`  - ${HISTORY_DATA.length} past completed bookings (sitter history) created`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding owner data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
