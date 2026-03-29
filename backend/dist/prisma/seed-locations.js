"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const lebaneseCities = [
    'Beirut',
    'Tripoli',
    'Sidon',
    'Tyre',
    'Nabatieh',
    'Jounieh',
    'Zahle',
    'Baalbek',
    'Byblos',
    'Aley',
    'Baabda',
    'Jbeil',
    'Batroun',
    'Bint Jbeil',
    'Marjeyoun',
    'Rashaya',
    'Hasbaya',
    'Jezzine',
    'Chouf',
    'Keserwan',
    'Metn',
    'Akkar',
    'Hermel',
    'Minieh-Danniyeh',
    'Zgharta',
    'Koura',
    'Bcharre',
    'Batroun',
    'Jbeil',
    'Kesrouan',
    'Matn',
    'Baabda',
    'Aley',
    'Chouf',
];
async function main() {
    console.log('Seeding locations...');
    let uniqueCities;
    uniqueCities = [...new Set(lebaneseCities)].sort();
    for (const cityName of uniqueCities) {
        await prisma.location.upsert({
            where: { name: cityName },
            update: {},
            create: { name: cityName },
        });
    }
    console.log(`✅ Seeded ${uniqueCities.length} locations`);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed-locations.js.map