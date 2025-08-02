import { format, formatDistanceToNow, isToday, isTomorrow, isThisWeek } from "date-fns";

export function formatEventDate(date: Date): string {
  if (isToday(date)) {
    return `Today, ${format(date, "h:mm a")}`;
  }
  
  if (isTomorrow(date)) {
    return `Tomorrow, ${format(date, "h:mm a")}`;
  }
  
  if (isThisWeek(date)) {
    return format(date, "EEEE, h:mm a");
  }
  
  return format(date, "MMM d, h:mm a");
}

export function formatRelativeTime(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true });
}

export function getPriorityBadgeText(date: Date): string {
  if (isToday(date) || isTomorrow(date)) {
    return "Urgent";
  }
  
  const days = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  
  if (days <= 7) {
    return `${days} day${days === 1 ? '' : 's'}`;
  }
  
  if (days <= 30) {
    const weeks = Math.ceil(days / 7);
    return `${weeks} week${weeks === 1 ? '' : 's'}`;
  }
  
  return "Later";
}

export function getPriorityColor(date: Date): string {
  if (isToday(date) || isTomorrow(date)) {
    return "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400";
  }
  
  const days = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  
  if (days <= 7) {
    return "bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400";
  }
  
  return "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400";
}
