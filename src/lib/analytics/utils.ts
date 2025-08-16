// Utility functions for admin analytics
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat().format(num);
};

export const formatPercentage = (num: number): string => {
  return `${num.toFixed(1)}%`;
};

export const formatTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

export const getStatusColor = (efficiency: number): string => {
  if (efficiency >= 90) return 'text-green-600';
  if (efficiency >= 80) return 'text-yellow-600';
  return 'text-red-600';
};

export const getStatusBadgeColor = (efficiency: number): string => {
  if (efficiency >= 90) return 'bg-green-100 text-green-800';
  if (efficiency >= 80) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

// Date utilities
export const getDateRange = (timeframe: string) => {
  const now = new Date();
  const start = new Date();
  
  switch (timeframe) {
    case '24hours':
      start.setHours(now.getHours() - 24);
      break;
    case '7days':
      start.setDate(now.getDate() - 7);
      break;
    case '30days':
      start.setDate(now.getDate() - 30);
      break;
    case '90days':
      start.setDate(now.getDate() - 90);
      break;
    default:
      start.setDate(now.getDate() - 7);
  }
  
  return { start, end: now };
};

// Chart color schemes
export const CHART_COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981',
  accent: '#F59E0B',
  danger: '#EF4444',
  info: '#6366F1',
  success: '#059669',
  warning: '#D97706',
};

export const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Data validation
export const validateDashboardData = (data: any): boolean => {
  return (
    data &&
    Array.isArray(data.peakHours) &&
    Array.isArray(data.departmentalLoad) &&
    Array.isArray(data.weeklyTrends) &&
    data.kpiMetrics &&
    typeof data.kpiMetrics.totalAppointments === 'number'
  );
};
