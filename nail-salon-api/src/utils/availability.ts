
import {
    format,
    addMinutes,
    parse,
    isBefore,
    isAfter,
    isEqual,
    startOfDay,
    endOfDay,
    parseISO
} from 'date-fns';
import prisma from '../lib/prisma';

export interface TimeSlot {
    time: string;
    available: boolean;
}

export interface WorkingHours {
    [key: string]: { start: string; end: string } | null;
}

/**
 * Get available time slots for a staff member on a specific date
 */
export async function getStaffAvailability(
    staffId: string,
    dateString: string
): Promise<TimeSlot[]> {
    const date = parseISO(dateString);
    const dayOfWeek = format(date, 'eeee').toLowerCase(); // 'monday', 'tuesday', etc.

    // 1. Get staff details (working hours)
    const staff = await prisma.staff.findUnique({
        where: { id: staffId },
        select: { workingHours: true, slotIntervalMins: true }
    });

    if (!staff || !staff.workingHours) {
        return [];
    }

    const workingHours = staff.workingHours as WorkingHours;
    const todayHours = workingHours[dayOfWeek];

    if (!todayHours) {
        return []; // Staff not working today
    }

    // 2. Generate all potential slots
    const slots: TimeSlot[] = [];
    const interval = staff.slotIntervalMins || 30;

    // Parse start and end times
    // Date doesn't matter for time comparison, so we use a reference date
    const refDate = new Date();
    let currentTime = parse(todayHours.start, 'HH:mm', refDate);
    const endTime = parse(todayHours.end, 'HH:mm', refDate);

    while (isBefore(currentTime, endTime)) {
        slots.push({
            time: format(currentTime, 'HH:mm'),
            available: true
        });
        currentTime = addMinutes(currentTime, interval);
    }

    // 3. Get existing bookings for this staff on this date
    // We need to cover the entire day
    const startOfDayDate = startOfDay(date);
    const endOfDayDate = endOfDay(date);

    const bookings = await prisma.booking.findMany({
        where: {
            stylistId: staffId,
            status: { notIn: ['NO_SHOW'] },
            scheduledAt: {
                gte: startOfDayDate,
                lte: endOfDayDate
            }
        },
        select: {
            scheduledAt: true,
            totalDurationMinutes: true
        }
    });

    // 4. Mark booked slots as unavailable
    for (const booking of bookings) {
        const bookingStart = booking.scheduledAt; // This is a Date object from DB
        const bookingDuration = booking.totalDurationMinutes;

        // We need to compare "HH:mm" strings or normalized Date objects
        // Let's use the slot time strings to create normalized Date objects for comparison

        // Get booking start time as "HH:mm"
        const bookingTimeStr = format(bookingStart, 'HH:mm');

        // Find which slots are covered by this booking
        let bookingStartTime = parse(bookingTimeStr, 'HH:mm', refDate);
        const bookingEndTime = addMinutes(bookingStartTime, bookingDuration);

        // Iterate through all slots and check overlap
        for (const slot of slots) {
            if (!slot.available) continue; // Already marked

            const slotTime = parse(slot.time, 'HH:mm', refDate);
            const slotEndTime = addMinutes(slotTime, interval);

            // Check if slot overlaps with booking
            // Overlap condition: SlotStart < BookingEnd AND SlotEnd > BookingStart
            if (isBefore(slotTime, bookingEndTime) && isAfter(slotEndTime, bookingStartTime)) {
                slot.available = false;
            }
        }
    }

    return slots;
}
