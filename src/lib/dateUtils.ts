/**
 * Date utilities for local timezone handling
 * JavaScript's toISOString() returns UTC time, which causes issues in KST (UTC+9)
 */

/**
 * Get local date string in YYYY-MM-DD format
 * This avoids timezone issues when comparing dates
 */
export const getLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Get today's date string in local timezone
 */
export const getTodayString = (): string => {
    return getLocalDateString(new Date());
};

/**
 * Check if a date is today in local timezone
 */
export const isToday = (date: Date): boolean => {
    return getLocalDateString(date) === getTodayString();
};
