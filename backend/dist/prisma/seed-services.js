"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const services = [
    'Dog Walking',
    'Pet Sitting',
    'Grooming',
    'Health Care',
];
async function main() {
    console.log('Seeding services...');
    const unique = [...new Set(services)].sort();
    await prisma.booking.deleteMany({});
    await prisma.post.deleteMany({});
    await prisma.service.deleteMany({});
    await prisma.service.createMany({
        data: unique.map((name) => ({ name })),
        skipDuplicates: true,
    });
    console.log(`✅ Seeded ${unique.length} services`);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed-services.js.map