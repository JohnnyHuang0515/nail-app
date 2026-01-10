
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

dotenv.config();
const prisma = new PrismaClient();

async function main() {
    try {
        const staff = await prisma.staff.findMany();
        console.log('Found staff:', staff.length);

        const defaultWorkingHours = {
            monday: { start: '10:00', end: '20:00' },
            tuesday: { start: '10:00', end: '20:00' },
            wednesday: { start: '10:00', end: '20:00' },
            thursday: { start: '10:00', end: '20:00' },
            friday: { start: '10:00', end: '21:00' },
            saturday: { start: '10:00', end: '21:00' },
            sunday: { start: '10:00', end: '18:00' }
        };

        for (const s of staff) {
            console.log(`Staff ${s.displayName} (${s.id}) workingHours present:`, !!s.workingHours);

            if (!s.workingHours || Object.keys(s.workingHours).length === 0) {
                console.log(`Updating staff ${s.displayName} with default hours...`);
                await prisma.staff.update({
                    where: { id: s.id },
                    data: { workingHours: defaultWorkingHours }
                });
                console.log('Updated.');
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
