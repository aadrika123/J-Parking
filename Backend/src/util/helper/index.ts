export function getCurrentWeekRange() {
  const today = new Date();

  // Get the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const dayOfWeek = today.getDay();

  // Calculate the difference to get back to Monday
  const diffToMonday = (dayOfWeek + 6) % 7; // If today is Sunday (0), then it will be 6 days back; otherwise, dayOfWeek - 1

  // Calculate the start of the week (Monday)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0); // Set time to midnight

  // Calculate the end of the week (Sunday)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999); // Set time to the end of the day

  const formatDate = (date: any) => date.toISOString().slice(0, 10);

  return {
    startOfWeek: formatDate(startOfWeek),
    endOfWeek: formatDate(endOfWeek),
  };
}

function parseTime(timeStr: string) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return new Date(1970, 0, 1, hours, minutes);
}

export function timeDifferenceInHours(startTime: string, endTime: string) {
  const start: any = parseTime(startTime);
  const end: any = parseTime(endTime);

  let diff = end - start;
  if (diff < 0) {
    diff += 24 * 60 * 60 * 1000;
  }

  // Check if the difference is less than 10 minutes (600,000 ms)
  if (diff <= 10 * 60 * 1000) {
    console.log("Time difference is less than 10 minutes");
    return 0;
  }

  const diffInHours = diff / (1000 * 60 * 60);
  return Math.ceil(diffInHours);
}

export function getCurrentMonthRange() {
  const today = new Date();

  // Calculate the start of the month (1st day of the current month)
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 2);
  startOfMonth.setHours(0, 0, 0, 0); // Set time to midnight

  // End of the range is the current date
  const endOfMonth = new Date(today);
  endOfMonth.setHours(23, 59, 59, 999); // Set time to the end of the current day

  const formatDate = (date: any) => date.toISOString().slice(0, 10);

  return {
    startOfMonth: formatDate(startOfMonth),
    endOfMonth: formatDate(endOfMonth),
  };
}

export const getCurrentMonthsRange = () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    startOfMonth: startOfMonth.toISOString().split("T")[0],
    endOfMonth: endOfMonth.toISOString().split("T")[0],
  };
};

export const getCurrentYearRange = () => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const endOfYear = new Date(now.getFullYear(), 11, 31);
  return {
    startOfYear: startOfYear.toISOString().split("T")[0],
    endOfYear: endOfYear.toISOString().split("T")[0],
  };
};