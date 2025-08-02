export interface AttendanceCalculation {
  currentPercentage: number;
  canBunk: number;
  mustAttend: number;
  status: 'safe' | 'warning' | 'danger';
}

export function calculateAttendance(
  attended: number,
  total: number,
  requiredPercentage: number = 75
): AttendanceCalculation {
  const currentPercentage = total > 0 ? (attended / total) * 100 : 0;
  const requiredLectures = Math.ceil((requiredPercentage / 100) * total);
  const canBunk = Math.max(0, attended - requiredLectures);
  const mustAttend = Math.max(0, requiredLectures - attended);
  
  let status: 'safe' | 'warning' | 'danger' = 'safe';
  if (currentPercentage < requiredPercentage) {
    status = 'danger';
  } else if (currentPercentage < requiredPercentage + 10) {
    status = 'warning';
  }
  
  return {
    currentPercentage,
    canBunk,
    mustAttend,
    status
  };
}

export function getAttendanceColor(percentage: number, required: number = 75): string {
  if (percentage >= required + 10) {
    return 'text-green-600 dark:text-green-400';
  } else if (percentage >= required) {
    return 'text-yellow-600 dark:text-yellow-400';
  } else {
    return 'text-red-600 dark:text-red-400';
  }
}

export function getProgressBarColor(percentage: number, required: number = 75): string {
  if (percentage >= required + 10) {
    return 'bg-green-500';
  } else if (percentage >= required) {
    return 'bg-yellow-500';
  } else {
    return 'bg-red-500';
  }
}

export function getBunkometerStatus(percentage: number, required: number = 75): {
  status: string;
  color: string;
  bgColor: string;
} {
  if (percentage >= required + 10) {
    return {
      status: 'Safe zone',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900'
    };
  } else if (percentage >= required) {
    return {
      status: 'Warning zone',
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900'
    };
  } else {
    return {
      status: 'Danger zone',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900'
    };
  }
}
