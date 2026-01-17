// Helper to convert time string (e.g., "08:00 AM") to minutes from midnight
export const timeToMinutes = (timeStr) => {
    const match = timeStr.match(/(\d+):(\d+)\s*([AP]M)/i);
    if (!match) return 0;

    let [_, hours, minutes, modifier] = match;
    hours = parseInt(hours);
    minutes = parseInt(minutes);
    modifier = modifier.toUpperCase();

    if (hours === 12 && modifier === 'AM') hours = 0;
    if (hours !== 12 && modifier === 'PM') hours += 12;

    return hours * 60 + minutes;
};

export const getNextDose = (times) => {
    if (!times || times.length === 0) return '--';

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Sort times just in case
    const sortedTimes = [...times].sort((a, b) => timeToMinutes(a) - timeToMinutes(b));

    // Find the first time that is later than now
    for (const time of sortedTimes) {
        if (timeToMinutes(time) > currentMinutes) {
            return time;
        }
    }

    // If no time is later than now, return the first time (tomorrow's first dose)
    return sortedTimes[0];
};

export const isNextDoseToday = (times) => {
    if (!times || times.length === 0) return false;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Check if any time is later than now
    return times.some(time => timeToMinutes(time) > currentMinutes);
};

export const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
};
