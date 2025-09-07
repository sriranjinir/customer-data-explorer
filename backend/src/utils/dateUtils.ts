/**
 * Date utility functions for handling date format conversions
 */

/**
 * Converts DD/MM/YYYY format to YYYY-MM-DD format
 * @param ddmmyyyy - Date string in DD/MM/YYYY format
 * @returns Date string in YYYY-MM-DD format or null if invalid
 */
export function convertDateFormat(ddmmyyyy: string): string | null {
  if (!ddmmyyyy) return null;

  // Match DD/MM/YYYY format
  const dateMatch = ddmmyyyy.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!dateMatch) return null;

  const [, day, month, year] = dateMatch;
  // Convert to YYYY-MM-DD format with zero padding
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * Validates if a date string is in DD/MM/YYYY format
 * @param dateString - Date string to validate
 * @returns boolean indicating if the format is valid
 */
export function isValidDateFormat(dateString: string): boolean {
  return /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.test(dateString);
}

/**
 * Converts YYYY-MM-DD format to DD/MM/YYYY format
 * @param yyyymmdd - Date string in YYYY-MM-DD format
 * @returns Date string in DD/MM/YYYY format or null if invalid
 */
export function convertToDisplayFormat(yyyymmdd: string): string | null {
  if (!yyyymmdd) return null;

  const dateMatch = yyyymmdd.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!dateMatch) return null;

  const [, year, month, day] = dateMatch;
  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
}
