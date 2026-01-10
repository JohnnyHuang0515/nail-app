
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function main() {
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
        console.log(`Staff ${s.displayName} (${s.id}) workingHours:`, JSON.stringify(s.workingHours));

        if (!s.workingHours) {
            console.log(`Updating staff ${s.displayName} with default hours...`);
            await prisma.staff.update({
                where: { id: s.id },
                data: { workingHours: defaultWorkingHours }
            });
            console.log('Updated.');
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
