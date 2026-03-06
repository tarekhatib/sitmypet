import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Posts are created from OTHER owners (not ramy) so they appear in his sitter feed.
// Location must contain "Beirut" (Ramy's profile location) to show as nearbyPosts.
// scheduledTime must be in the FUTURE for the sitter feed query to pick them up.

// Run AFTER: seed-locations.ts && seed-services.ts
// npx ts-node prisma/seed-sitter-posts.ts

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';

// daysFromNow: how many days in the future to schedule each post
const POSTS_DATA = [
  {
    ownerEmail: 'hana.nassif@example.com',
    ownerFirstname: 'Hana',
    ownerLastname: 'Nassif',
    ownerLocation: 'Beirut',
    petName: 'Caramel',
    petBreed: 'Maltese',
    title: 'Fluffy Maltese needs a weekend sitter in Beirut',
    location: 'Hamra, Beirut',
    serviceName: 'Pet Sitting',
    duration: '2-3 Days',
    price: 45.0,
    imageUrl:
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80',
    daysFromNow: 3,
  },
  {
    ownerEmail: 'karim.azar@example.com',
    ownerFirstname: 'Karim',
    ownerLastname: 'Azar',
    ownerLocation: 'Beirut',
    petName: 'Shadow',
    petBreed: 'German Shepherd',
    title: 'German Shepherd needs daily morning walks',
    location: 'Ashrafieh, Beirut',
    serviceName: 'Dog Walking',
    duration: '1-2 Hours',
    price: 20.0,
    imageUrl:
      'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=800&q=80',
    daysFromNow: 5,
  },
  {
    ownerEmail: 'dana.khalil@example.com',
    ownerFirstname: 'Dana',
    ownerLastname: 'Khalil',
    ownerLocation: 'Beirut',
    petName: 'Snowball',
    petBreed: 'Persian',
    title: 'Persian cat needs full grooming session',
    location: 'Verdun, Beirut',
    serviceName: 'Grooming',
    duration: '3-4 Hours',
    price: 35.0,
    imageUrl:
      'https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?auto=format&fit=crop&w=800&q=80',
    daysFromNow: 7,
  },
  {
    ownerEmail: 'maya.saleh@example.com',
    ownerFirstname: 'Maya',
    ownerLastname: 'Saleh',
    ownerLocation: 'Beirut',
    petName: 'Cleo',
    petBreed: 'Siamese',
    title: 'Siamese cat needs health check and care',
    location: 'Achrafieh, Beirut',
    serviceName: 'Health Care',
    duration: '2-3 Hours',
    price: 30.0,
    imageUrl:
      'https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&w=800&q=80',
    daysFromNow: 10,
  },
  {
    ownerEmail: 'joe.frem@example.com',
    ownerFirstname: 'Joe',
    ownerLastname: 'Frem',
    ownerLocation: 'Beirut',
    petName: 'Titan',
    petBreed: 'Labrador Retriever',
    title: 'Labrador needs energetic afternoon walks',
    location: 'Mar Mikhael, Beirut',
    serviceName: 'Dog Walking',
    duration: '2-3 Hours',
    price: 25.0,
    imageUrl:
      'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80',
    daysFromNow: 4,
  },
  {
    ownerEmail: 'lara.abdo@example.com',
    ownerFirstname: 'Lara',
    ownerLastname: 'Abdo',
    ownerLocation: 'Beirut',
    petName: 'Fifi',
    petBreed: 'Poodle',
    title: 'Poodle needs a fun overnight sitter',
    location: 'Gemmayzeh, Beirut',
    serviceName: 'Pet Sitting',
    duration: '1-2 Days',
    price: 60.0,
    imageUrl:
      'https://images.unsplash.com/photo-1583511655826-05700d4f7de5?auto=format&fit=crop&w=800&q=80',
    daysFromNow: 6,
  },
  {
    ownerEmail: 'nour.salameh@example.com',
    ownerFirstname: 'Nour',
    ownerLastname: 'Salameh',
    ownerLocation: 'Beirut',
    petName: 'Mochi',
    petBreed: 'Shiba Inu',
    title: 'Shiba Inu needs socialisation walks in Beirut',
    location: 'Dahyeh, Beirut',
    serviceName: 'Dog Walking',
    duration: '1-2 Hours',
    price: 18.0,
    imageUrl:
      'https://images.unsplash.com/photo-1555169062-013468b47731?auto=format&fit=crop&w=800&q=80',
    daysFromNow: 8,
  },
  {
    ownerEmail: 'tarek.frem@example.com',
    ownerFirstname: 'Tarek',
    ownerLastname: 'Frem',
    ownerLocation: 'Beirut',
    petName: 'Ginger',
    petBreed: 'Golden Retriever',
    title: 'Golden Retriever needs grooming and a trim',
    location: 'Raouche, Beirut',
    serviceName: 'Grooming',
    duration: '2-3 Hours',
    price: 40.0,
    imageUrl:
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
    daysFromNow: 12,
  },
];

async function main() {
  console.log('\n🌱 Seeding future sitter posts...\n');

  const now = new Date();

  let created = 0;
  let skipped = 0;

  for (const p of POSTS_DATA) {
    // ── Owner ────────────────────────────────────────────────────────────────
    let owner = await prisma.user.findUnique({ where: { email: p.ownerEmail } });
    if (!owner) {
      owner = await prisma.user.create({
        data: {
          email: p.ownerEmail,
          firstname: p.ownerFirstname,
          lastname: p.ownerLastname,
          passwordHash: 'hashed_password_placeholder',
          roles: ['OWNER'],
        },
      });
    } else if (!owner.roles.includes('OWNER')) {
      owner = await prisma.user.update({
        where: { id: owner.id },
        data: { roles: { set: [...new Set([...owner.roles, 'OWNER'])] as any } },
      });
    }

    // ── Owner profile + location ────────────────────────────────────────────
    let locationRecord = await prisma.location.findUnique({
      where: { name: p.ownerLocation },
    });
    if (!locationRecord) {
      locationRecord = await prisma.location.create({
        data: { name: p.ownerLocation },
      });
    }

    const existingProfile = await prisma.profile.findUnique({
      where: { userId: owner.id },
    });
    if (!existingProfile) {
      await prisma.profile.create({
        data: { userId: owner.id, locationId: locationRecord.id },
      });
    }

    // ── Pet ─────────────────────────────────────────────────────────────────
    let pet = await prisma.pet.findFirst({
      where: { name: p.petName, ownerId: owner.id },
    });
    if (!pet) {
      pet = await prisma.pet.create({
        data: { name: p.petName, breed: p.petBreed, ownerId: owner.id },
      });
    }

    // ── Service ─────────────────────────────────────────────────────────────
    const service = await prisma.service.findUnique({
      where: { name: p.serviceName },
    });
    if (!service) {
      console.warn(`   ⚠ Service "${p.serviceName}" not found — run seed-services.ts first`);
      skipped++;
      continue;
    }

    // ── Posts: skip if an identical future post already exists ───────────────
    const scheduledTime = new Date(now);
    scheduledTime.setDate(scheduledTime.getDate() + p.daysFromNow);
    scheduledTime.setHours(10, 0, 0, 0);

    const existing = await prisma.post.findFirst({
      where: {
        ownerId: owner.id,
        title: p.title,
        status: 'OPEN',
        scheduledTime: { gte: now },
      },
    });

    if (existing) {
      console.log(`   ↩  Already exists: "${p.title}"`);
      skipped++;
      continue;
    }

    await prisma.post.create({
      data: {
        title: p.title,
        location: p.location,
        duration: p.duration,
        scheduledTime,
        imageUrl: p.imageUrl,
        description: LOREM,
        price: p.price,
        status: 'OPEN',
        service: { connect: { id: service.id } },
        owner: { connect: { id: owner.id } },
        pet: { connect: { id: pet.id } },
      },
    });

    console.log(
      `   ✓ "${p.title}" — ${p.location} (+${p.daysFromNow}d, $${p.price})`,
    );
    created++;
  }

  console.log(`\n✅ Done — ${created} post(s) created, ${skipped} skipped`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding sitter posts:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
