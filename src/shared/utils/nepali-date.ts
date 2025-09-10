// Nepali Date Utilities
// Converts AD dates to BS (Bikram Sambat) Nepali calendar dates

interface NepaliDate {
  year: number;
  month: number;
  day: number;
  monthName: string;
  dayName: string;
}

// Nepali month names
const NEPALI_MONTHS = [
  'बैशाख', 'जेठ', 'आषाढ', 'श्रावण', 'भाद्र', 'आश्विन',
  'कार्तिक', 'मंसिर', 'पौष', 'माघ', 'फाल्गुन', 'चैत्र'
];

const NEPALI_MONTHS_EN = [
  'Baisakh', 'Jestha', 'Asadh', 'Shrawan', 'Bhadra', 'Ashwin',
  'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
];

// Nepali day names
const NEPALI_DAYS = ['आइतबार', 'सोमबार', 'मंगलबार', 'बुधबार', 'बिहिबार', 'शुक्रबार', 'शनिबार'];
const NEPALI_DAYS_EN = ['Aaitabar', 'Sombar', 'Mangalbar', 'Budhabar', 'Bihibar', 'Shukrabar', 'Shanibar'];

// Convert AD date to BS (simplified conversion - for accurate conversion, use a proper library)
export function adToBs(adDate: Date): NepaliDate {
  // This is a simplified conversion
  // For accurate conversion, you should use libraries like 'bikram-sambat' or 'nepali-date'
  
  const adYear = adDate.getFullYear();
  const adMonth = adDate.getMonth() + 1;
  const adDay = adDate.getDate();
  
  // Simplified BS conversion (approximately +56-57 years)
  let bsYear = adYear + 56;
  let bsMonth = adMonth;
  let bsDay = adDay;
  
  // Handle mid-April to mid-April year boundary
  if (adMonth >= 4 && adDay >= 14) {
    bsYear = adYear + 57;
    bsMonth = adMonth - 3;
    if (bsMonth <= 0) bsMonth += 12;
  } else {
    bsYear = adYear + 56;
    bsMonth = adMonth + 9;
    if (bsMonth > 12) bsMonth -= 12;
  }
  
  return {
    year: bsYear,
    month: bsMonth,
    day: bsDay,
    monthName: NEPALI_MONTHS_EN[bsMonth - 1] || 'Baisakh',
    dayName: NEPALI_DAYS_EN[adDate.getDay()] || 'Aaitabar'
  };
}

// Format Nepali date
export function formatNepaliDate(adDate: Date | string | number, format: 'short' | 'long' | 'relative' = 'short'): string {
  try {
    const date = new Date(adDate);
    
    // Check if date is invalid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    if (format === 'relative') {
      return formatRelativeTime(date);
    }
    
    const nepaliDate = adToBs(date);
    
    if (format === 'long') {
      return `${nepaliDate.day} ${nepaliDate.monthName} ${nepaliDate.year}`;
    }
    
    return `${nepaliDate.year}/${nepaliDate.month.toString().padStart(2, '0')}/${nepaliDate.day.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('Error formatting Nepali date:', error);
    return 'Date Error';
  }
}

// Format relative time (e.g., "2 hours ago", "3 days ago")
export function formatRelativeTime(date: Date | string | number): string {
  try {
    const now = new Date();
    const targetDate = new Date(date);
    
    // Check if date is invalid
    if (isNaN(targetDate.getTime())) {
      return 'Invalid Date';
    }
    
    const diffMs = now.getTime() - targetDate.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);
    
    if (diffSeconds < 60) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    } else if (diffWeeks < 4) {
      return `${diffWeeks} week${diffWeeks === 1 ? '' : 's'} ago`;
    } else if (diffMonths < 12) {
      return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`;
    } else {
      return `${diffYears} year${diffYears === 1 ? '' : 's'} ago`;
    }
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'Time Error';
  }
}

// Get current Nepali date
export function getCurrentNepaliDate(): NepaliDate {
  return adToBs(new Date());
}

// Format today's date in Nepali
export function getTodayNepali(): string {
  const nepaliDate = getCurrentNepaliDate();
  return `आज ${nepaliDate.day} ${NEPALI_MONTHS[nepaliDate.month - 1]} ${nepaliDate.year}`;
}

// Validate and format date safely
export function safeFormatDate(date: any, format: 'short' | 'long' | 'relative' | 'nepali' = 'relative'): string {
  if (!date) return 'No date';
  
  try {
    if (format === 'nepali') {
      return formatNepaliDate(date, 'long');
    }
    return formatNepaliDate(date, format);
  } catch (error) {
    return 'Date unavailable';
  }
}