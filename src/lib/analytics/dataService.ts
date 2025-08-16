import { ANALYTICS_CONFIG } from './config';

// Types for analytics data based on our database tables
export interface AnalyticsAppointment {
  id: string;
  appointment_reference: string;
  citizen_id: string;
  service_id: string;
  department_id: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  appointment_date: string;
  appointment_time: string;
  scheduled_at: string;
  wait_time_minutes?: number;
  service_duration_minutes?: number;
  priority_level: 'urgent' | 'high' | 'normal' | 'low';
  appointment_channel: 'online' | 'phone' | 'walk_in' | 'mobile_app';
}

export interface AnalyticsDepartment {
  id: string;
  department_code: string;
  department_name: string;
  total_staff_count: number;
  daily_capacity: number;
  target_wait_time_minutes: number;
}

export interface AnalyticsService {
  id: string;
  service_code: string;
  service_name: string;
  department_id: string;
  estimated_duration_minutes: number;
  complexity_level: 'simple' | 'medium' | 'complex';
}

export interface HourlyMetrics {
  metric_date: string;
  metric_hour: number;
  department_id: string;
  appointments_scheduled: number;
  appointments_completed: number;
  average_wait_time_minutes: number;
  max_queue_length: number;
}

export interface DailyMetrics {
  metric_date: string;
  department_id: string;
  service_id?: string;
  total_appointments: number;
  completed_appointments: number;
  no_show_appointments: number;
  average_wait_time_minutes: number;
  completion_rate: number;
  no_show_rate: number;
  capacity_utilized: number;
}

export interface WeeklyTrends {
  week_start_date: string;
  department_id: string;
  total_appointments: number;
  completed_appointments: number;
  no_show_appointments: number;
  monday_appointments: number;
  tuesday_appointments: number;
  wednesday_appointments: number;
  thursday_appointments: number;
  friday_appointments: number;
  saturday_appointments: number;
  sunday_appointments: number;
  average_completion_rate: number;
  peak_day: string;
}

// Mock data generator based on analytics tables structure with statistical formulas
export class AnalyticsDataService {
  
  // Statistical Constants for Government Services
  private static readonly STATS_CONFIG = {
    // Normal distribution parameters for wait times (mean, std deviation)
    WAIT_TIME_NORMAL: { mean: 32, stdDev: 12 },
    // Poisson distribution parameter for appointment arrivals
    POISSON_LAMBDA: 4.2,
    // Beta distribution parameters for efficiency rates
    BETA_EFFICIENCY: { alpha: 9, beta: 1.5 },
    // Service time follows gamma distribution
    GAMMA_SERVICE_TIME: { shape: 2, scale: 15 },
    // Weekly seasonality coefficients
    WEEKLY_SEASONALITY: [0.6, 0.85, 0.95, 1.0, 1.15, 0.75, 0.45], // Mon-Sun
    // Hourly demand pattern (based on actual government service data)
    HOURLY_PATTERN: [0.2, 0.4, 0.7, 0.9, 0.95, 0.6, 0.8, 1.0, 0.85, 0.5] // 8AM-5PM
  };

  // Generate normal distribution random number (Box-Muller transform)
  private static normalRandom(mean: number, stdDev: number): number {
    const u = Math.random();
    const v = Math.random();
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    return Math.max(0, mean + stdDev * z);
  }

  // Generate Poisson distribution random number
  private static poissonRandom(lambda: number): number {
    const L = Math.exp(-lambda);
    let k = 0;
    let p = 1;
    
    do {
      k++;
      p *= Math.random();
    } while (p > L);
    
    return k - 1;
  }

  // Generate Beta distribution random number (for efficiency rates)
  private static betaRandom(alpha: number, beta: number): number {
    const gamma1 = this.gammaRandom(alpha, 1);
    const gamma2 = this.gammaRandom(beta, 1);
    return gamma1 / (gamma1 + gamma2);
  }

  // Generate Gamma distribution random number (for service times)
  private static gammaRandom(shape: number, scale: number): number {
    if (shape < 1) {
      return this.gammaRandom(shape + 1, scale) * Math.pow(Math.random(), 1 / shape);
    }
    
    const d = shape - 1/3;
    const c = 1 / Math.sqrt(9 * d);
    
    while (true) {
      let x, v;
      do {
        x = this.normalRandom(0, 1);
        v = 1 + c * x;
      } while (v <= 0);
      
      v = v * v * v;
      const u = Math.random();
      
      if (u < 1 - 0.0331 * x * x * x * x || 
          Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) {
        return d * v * scale;
      }
    }
  }

  // Calculate moving average for trend analysis
  private static movingAverage(data: number[], window: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - window + 1);
      const subset = data.slice(start, i + 1);
      const avg = subset.reduce((sum, val) => sum + val, 0) / subset.length;
      result.push(avg);
    }
    return result;
  }

  // Calculate exponential smoothing for forecasting
  private static exponentialSmoothing(data: number[], alpha: number = 0.3): number[] {
    const result: number[] = [data[0]];
    for (let i = 1; i < data.length; i++) {
      const smoothed = alpha * data[i] + (1 - alpha) * result[i - 1];
      result.push(smoothed);
    }
    return result;
  }

  // Calculate statistical significance using t-test
  private static tTest(sample1: number[], sample2: number[]): { tStat: number, pValue: number } {
    const mean1 = sample1.reduce((sum, val) => sum + val, 0) / sample1.length;
    const mean2 = sample2.reduce((sum, val) => sum + val, 0) / sample2.length;
    
    const variance1 = sample1.reduce((sum, val) => sum + Math.pow(val - mean1, 2), 0) / (sample1.length - 1);
    const variance2 = sample2.reduce((sum, val) => sum + Math.pow(val - mean2, 2), 0) / (sample2.length - 1);
    
    const pooledVariance = ((sample1.length - 1) * variance1 + (sample2.length - 1) * variance2) / 
                          (sample1.length + sample2.length - 2);
    
    const tStat = (mean1 - mean2) / Math.sqrt(pooledVariance * (1/sample1.length + 1/sample2.length));
    
    // Simplified p-value calculation (approximate)
    const pValue = 2 * (1 - this.normalCDF(Math.abs(tStat)));
    
    return { tStat, pValue };
  }

  // Normal cumulative distribution function (CDF)
  private static normalCDF(x: number): number {
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
  }

  // Error function approximation
  private static erf(x: number): number {
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;
    
    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);
    
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    
    return sign * y;
  }

  // Calculate confidence intervals
  private static confidenceInterval(data: number[], confidence: number = 0.95): { lower: number, upper: number, mean: number } {
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (data.length - 1);
    const stdError = Math.sqrt(variance / data.length);
    
    // Z-score for 95% confidence
    const zScore = confidence === 0.95 ? 1.96 : confidence === 0.99 ? 2.576 : 1.645;
    const margin = zScore * stdError;
    
    return {
      lower: mean - margin,
      upper: mean + margin,
      mean: mean
    };
  }
  
  // Generate mock departments data
  static generateDepartments(): AnalyticsDepartment[] {
    return Object.entries(ANALYTICS_CONFIG.departments).map(([key, dept]) => ({
      id: `dept-${key.toLowerCase()}`,
      department_code: dept.code,
      department_name: dept.name,
      total_staff_count: Math.floor(Math.random() * 20) + 5,
      daily_capacity: Math.floor(Math.random() * 100) + 50,
      target_wait_time_minutes: 30
    }));
  }

  // Generate mock services data
  static generateServices(): AnalyticsService[] {
    const services = [
      { code: 'BC001', name: 'Birth Certificate', dept: 'CIVIL_REGISTRATION', duration: 15 },
      { code: 'PP001', name: 'Passport Application', dept: 'IMMIGRATION', duration: 30 },
      { code: 'DL001', name: 'Driving License', dept: 'MOTOR_TRAFFIC', duration: 45 },
      { code: 'TAX001', name: 'Income Tax Filing', dept: 'TAX_DEPARTMENT', duration: 25 },
      { code: 'HC001', name: 'Medical Certificate', dept: 'HEALTHCARE', duration: 20 },
      { code: 'BR001', name: 'Business Registration', dept: 'BUSINESS_REG', duration: 40 },
      { code: 'LR001', name: 'Land Title Search', dept: 'LAND_REGISTRY', duration: 35 },
      { code: 'PS001', name: 'Police Clearance', dept: 'POLICE_SERVICES', duration: 30 },
      { code: 'EDU001', name: 'Certificate Verification', dept: 'EDUCATION', duration: 15 },
      { code: 'SS001', name: 'Welfare Benefits', dept: 'SOCIAL_SERVICES', duration: 25 },
      { code: 'JUD001', name: 'Court Document Request', dept: 'JUDICIAL', duration: 20 },
      { code: 'MUN001', name: 'Building Permit', dept: 'MUNICIPAL', duration: 50 }
    ];

    return services.map((service, index) => ({
      id: `service-${index + 1}`,
      service_code: service.code,
      service_name: service.name,
      department_id: `dept-${service.dept.toLowerCase()}`,
      estimated_duration_minutes: service.duration,
      complexity_level: service.duration > 40 ? 'complex' : service.duration > 25 ? 'medium' : 'simple'
    }));
  }

  // Generate hourly metrics for peak hours analysis using statistical models
  static generateHourlyMetrics(days: number = 7): HourlyMetrics[] {
    const departments = this.generateDepartments();
    const metrics: HourlyMetrics[] = [];
    
    for (let day = 0; day < days; day++) {
      const date = new Date();
      date.setDate(date.getDate() - day);
      const dayOfWeek = date.getDay();
      
      // Apply weekly seasonality
      const seasonalFactor = this.STATS_CONFIG.WEEKLY_SEASONALITY[dayOfWeek];
      
      for (let hour = 8; hour <= 17; hour++) {
        const hourIndex = hour - 8;
        departments.forEach(dept => {
          // Use Poisson distribution for appointment arrivals
          const baseArrivals = this.poissonRandom(this.STATS_CONFIG.POISSON_LAMBDA);
          
          // Apply hourly pattern and seasonal adjustment
          const hourlyFactor = this.STATS_CONFIG.HOURLY_PATTERN[hourIndex] || 0.5;
          const adjustedArrivals = Math.floor(baseArrivals * hourlyFactor * seasonalFactor * 8);
          
          // Use normal distribution for wait times
          const avgWaitTime = this.normalRandom(
            this.STATS_CONFIG.WAIT_TIME_NORMAL.mean,
            this.STATS_CONFIG.WAIT_TIME_NORMAL.stdDev
          );
          
          // Completion rate follows beta distribution
          const completionRate = this.betaRandom(
            this.STATS_CONFIG.BETA_EFFICIENCY.alpha,
            this.STATS_CONFIG.BETA_EFFICIENCY.beta
          );
          
          metrics.push({
            metric_date: date.toISOString().split('T')[0],
            metric_hour: hour,
            department_id: dept.id,
            appointments_scheduled: adjustedArrivals,
            appointments_completed: Math.floor(adjustedArrivals * completionRate),
            average_wait_time_minutes: Math.round(avgWaitTime),
            max_queue_length: Math.floor(avgWaitTime / 5) + this.poissonRandom(2)
          });
        });
      }
    }
    
    return metrics;
  }

  // Generate daily metrics using advanced statistical models
  static generateDailyMetrics(days: number = 30): DailyMetrics[] {
    const departments = this.generateDepartments();
    const metrics: DailyMetrics[] = [];
    
    for (let day = 0; day < days; day++) {
      const date = new Date();
      date.setDate(date.getDate() - day);
      const dayOfWeek = date.getDay();
      
      departments.forEach(dept => {
        // Use gamma distribution for total appointments
        const baseAppointments = this.gammaRandom(
          this.STATS_CONFIG.GAMMA_SERVICE_TIME.shape * 3,
          this.STATS_CONFIG.GAMMA_SERVICE_TIME.scale
        );
        
        // Apply weekly seasonality
        const seasonalFactor = this.STATS_CONFIG.WEEKLY_SEASONALITY[dayOfWeek];
        const totalAppointments = Math.floor(baseAppointments * seasonalFactor);
        
        // Use beta distribution for completion rate
        const completionRate = this.betaRandom(8.5, 1.8); // Higher alpha for better performance
        const completedAppointments = Math.floor(totalAppointments * completionRate);
        
        // No-show rate follows exponential distribution (rare events)
        const noShowRate = Math.min(0.25, -Math.log(Math.random()) * 0.08); // λ = 0.08
        const noShowAppointments = Math.floor(totalAppointments * noShowRate);
        
        // Wait time follows log-normal distribution (right-skewed)
        const logMean = Math.log(25);
        const logStdDev = 0.5;
        const avgWaitTime = Math.exp(this.normalRandom(logMean, logStdDev));
        
        // Capacity utilization with correlation to wait time
        const capacityUtilization = Math.min(100, 
          (totalAppointments / dept.daily_capacity) * 100 * (1 + avgWaitTime / 100)
        );
        
        metrics.push({
          metric_date: date.toISOString().split('T')[0],
          department_id: dept.id,
          total_appointments: totalAppointments,
          completed_appointments: completedAppointments,
          no_show_appointments: noShowAppointments,
          average_wait_time_minutes: Math.round(avgWaitTime),
          completion_rate: Math.round(completionRate * 100 * 10) / 10,
          no_show_rate: Math.round(noShowRate * 100 * 10) / 10,
          capacity_utilized: Math.round(capacityUtilization * 10) / 10
        });
      });
    }
    
    return metrics;
  }

  // Generate weekly trends
  static generateWeeklyTrends(weeks: number = 12): WeeklyTrends[] {
    const departments = this.generateDepartments();
    const trends: WeeklyTrends[] = [];
    
    for (let week = 0; week < weeks; week++) {
      const weekStartDate = new Date();
      weekStartDate.setDate(weekStartDate.getDate() - (week * 7));
      // Set to Monday of the week
      const dayOfWeek = weekStartDate.getDay();
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      weekStartDate.setDate(weekStartDate.getDate() + diffToMonday);
      
      departments.forEach(dept => {
        const weeklyTotal = Math.floor(Math.random() * 200) + 100;
        const dayDistribution = this.generateWeeklyDistribution(weeklyTotal);
        
        trends.push({
          week_start_date: weekStartDate.toISOString().split('T')[0],
          department_id: dept.id,
          total_appointments: weeklyTotal,
          completed_appointments: Math.floor(weeklyTotal * 0.85),
          no_show_appointments: Math.floor(weeklyTotal * 0.1),
          monday_appointments: dayDistribution[0],
          tuesday_appointments: dayDistribution[1],
          wednesday_appointments: dayDistribution[2],
          thursday_appointments: dayDistribution[3],
          friday_appointments: dayDistribution[4],
          saturday_appointments: dayDistribution[5],
          sunday_appointments: dayDistribution[6],
          average_completion_rate: 85 + Math.random() * 10,
          peak_day: this.getPeakDay(dayDistribution)
        });
      });
    }
    
    return trends;
  }

  // Helper: Get base load for different hours
  private static getHourlyBaseLoad(hour: number): number {
    const hourlyPatterns: { [key: number]: number } = {
      8: 25, 9: 45, 10: 60, 11: 75, 12: 40, 13: 30,
      14: 65, 15: 80, 16: 70, 17: 45
    };
    return hourlyPatterns[hour] || 20;
  }

  // Helper: Generate realistic weekly distribution
  private static generateWeeklyDistribution(total: number): number[] {
    const basePattern = [0.18, 0.20, 0.22, 0.24, 0.12, 0.03, 0.01]; // Mon-Sun
    return basePattern.map(ratio => Math.floor(total * ratio * (0.8 + Math.random() * 0.4)));
  }

  // Helper: Find peak day
  private static getPeakDay(distribution: number[]): string {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const maxIndex = distribution.indexOf(Math.max(...distribution));
    return days[maxIndex];
  }

  // Main dashboard data aggregation
  static generateDashboardData(timeframe: string = '7days') {
    const days = timeframe === '24hours' ? 1 : 
                 timeframe === '7days' ? 7 : 
                 timeframe === '30days' ? 30 : 90;

    const hourlyMetrics = this.generateHourlyMetrics(days);
    const dailyMetrics = this.generateDailyMetrics(days);
    const departments = this.generateDepartments();
    const services = this.generateServices();

    // Aggregate data for dashboard
    return {
      peakHours: this.aggregatePeakHours(hourlyMetrics),
      departmentalLoad: this.aggregateDepartmentalLoad(dailyMetrics, departments),
      weeklyTrends: this.aggregateWeeklyTrends(dailyMetrics),
      kpiMetrics: this.calculateKPIMetrics(dailyMetrics),
      realTimeMetrics: this.generateRealTimeMetrics()
    };
  }

  // Aggregate peak hours using statistical analysis
  private static aggregatePeakHours(hourlyMetrics: HourlyMetrics[]) {
    const hourGroups: { [hour: number]: HourlyMetrics[] } = {};
    
    hourlyMetrics.forEach(metric => {
      if (!hourGroups[metric.metric_hour]) {
        hourGroups[metric.metric_hour] = [];
      }
      hourGroups[metric.metric_hour].push(metric);
    });

    return Object.entries(hourGroups).map(([hour, metrics]) => {
      const bookingsData = metrics.map(m => m.appointments_scheduled);
      const waitTimeData = metrics.map(m => m.average_wait_time_minutes);
      
      // Calculate statistical measures
      const bookingsCI = this.confidenceInterval(bookingsData);
      const waitTimeCI = this.confidenceInterval(waitTimeData);
      
      // Use exponential smoothing for trend
      const smoothedBookings = this.exponentialSmoothing(bookingsData);
      const currentTrend = smoothedBookings[smoothedBookings.length - 1];
      
      return {
        hour: `${hour.padStart(2, '0')}:00`,
        bookings: Math.round(bookingsCI.mean),
        processing_time: Math.round(waitTimeCI.mean),
        // Additional statistical metrics
        bookings_trend: Math.round(currentTrend),
        confidence_lower: Math.round(bookingsCI.lower),
        confidence_upper: Math.round(bookingsCI.upper)
      };
    }).sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
  }

  // Aggregate departmental load with statistical analysis
  private static aggregateDepartmentalLoad(dailyMetrics: DailyMetrics[], departments: AnalyticsDepartment[]) {
    return departments.slice(0, 5).map(dept => {
      const deptMetrics = dailyMetrics.filter(m => m.department_id === dept.id);
      
      // Calculate statistical measures
      const appointmentsData = deptMetrics.map(m => m.total_appointments);
      const efficiencyData = deptMetrics.map(m => m.completion_rate);
      const noShowData = deptMetrics.map(m => m.no_show_appointments);
      
      // Calculate confidence intervals
      const appointmentsCI = this.confidenceInterval(appointmentsData);
      const efficiencyCI = this.confidenceInterval(efficiencyData);
      
      // Calculate trend using linear regression
      const trend = this.calculateTrend(appointmentsData);
      
      // Statistical significance test between departments
      const baselineEfficiency = efficiencyData.slice(0, Math.floor(efficiencyData.length / 2));
      const recentEfficiency = efficiencyData.slice(Math.floor(efficiencyData.length / 2));
      const tTestResult = this.tTest(baselineEfficiency, recentEfficiency);
      
      return {
        name: dept.department_name,
        appointments: Math.round(appointmentsCI.mean),
        no_shows: Math.round(noShowData.reduce((sum, val) => sum + val, 0) / noShowData.length),
        efficiency: Math.round(efficiencyCI.mean * 10) / 10,
        // Additional statistical metrics
        efficiency_trend: trend > 0 ? 'improving' : trend < 0 ? 'declining' : 'stable',
        statistical_significance: tTestResult.pValue < 0.05 ? 'significant' : 'not_significant',
        confidence_interval: {
          lower: Math.round(efficiencyCI.lower * 10) / 10,
          upper: Math.round(efficiencyCI.upper * 10) / 10
        }
      };
    });
  }

  // Calculate linear regression trend
  private static calculateTrend(data: number[]): number {
    const n = data.length;
    const sumX = (n * (n + 1)) / 2; // Sum of indices 1,2,3...n
    const sumY = data.reduce((sum, val) => sum + val, 0);
    const sumXY = data.reduce((sum, val, index) => sum + val * (index + 1), 0);
    const sumX2 = (n * (n + 1) * (2 * n + 1)) / 6; // Sum of squares 1²+2²+3²...n²
    
    // Linear regression slope = (n*ΣXY - ΣX*ΣY) / (n*ΣX² - (ΣX)²)
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }

  // Aggregate weekly trends
  private static aggregateWeeklyTrends(dailyMetrics: DailyMetrics[]) {
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const last7Days = dailyMetrics.slice(0, 7);
    
    return dayNames.map((day, index) => {
      const dayMetrics = last7Days[index];
      return {
        day,
        bookings: dayMetrics?.total_appointments || 0,
        completed: dayMetrics?.completed_appointments || 0,
        no_shows: dayMetrics?.no_show_appointments || 0
      };
    });
  }

  // Calculate KPI metrics using statistical analysis
  private static calculateKPIMetrics(dailyMetrics: DailyMetrics[]) {
    // Extract time series data
    const appointmentsTimeSeries = dailyMetrics.map(m => m.total_appointments);
    const completionRateTimeSeries = dailyMetrics.map(m => m.completion_rate);
    const waitTimeTimeSeries = dailyMetrics.map(m => m.average_wait_time_minutes);
    const noShowRateTimeSeries = dailyMetrics.map(m => m.no_show_rate);
    
    // Calculate moving averages for trend analysis
    const appointmentsMA = this.movingAverage(appointmentsTimeSeries, 7);
    const completionMA = this.movingAverage(completionRateTimeSeries, 7);
    
    // Calculate exponential smoothing for forecasting
    const waitTimeSmoothed = this.exponentialSmoothing(waitTimeTimeSeries, 0.3);
    
    // Calculate confidence intervals
    const appointmentsCI = this.confidenceInterval(appointmentsTimeSeries);
    const completionCI = this.confidenceInterval(completionRateTimeSeries);
    const waitTimeCI = this.confidenceInterval(waitTimeTimeSeries);
    const noShowCI = this.confidenceInterval(noShowRateTimeSeries);
    
    // Calculate volatility (coefficient of variation)
    const appointmentsVolatility = Math.sqrt(
      appointmentsTimeSeries.reduce((sum, val) => sum + Math.pow(val - appointmentsCI.mean, 2), 0) / 
      appointmentsTimeSeries.length
    ) / appointmentsCI.mean;
    
    // Calculate trend using linear regression
    const appointmentsTrend = this.calculateTrend(appointmentsTimeSeries);
    const completionTrend = this.calculateTrend(completionRateTimeSeries);
    
    return {
      totalAppointments: Math.round(appointmentsCI.mean),
      completionRate: Math.round(completionCI.mean * 10) / 10,
      averageWaitTime: Math.round(waitTimeCI.mean * 10) / 10,
      noShowRate: Math.round(noShowCI.mean * 10) / 10,
      
      // Advanced statistical metrics
      statistics: {
        appointmentsTrend: appointmentsTrend > 0 ? 'increasing' : appointmentsTrend < 0 ? 'decreasing' : 'stable',
        completionTrend: completionTrend > 0 ? 'improving' : completionTrend < 0 ? 'declining' : 'stable',
        volatility: Math.round(appointmentsVolatility * 100) / 100,
        forecasted_wait_time: Math.round(waitTimeSmoothed[waitTimeSmoothed.length - 1] * 10) / 10,
        confidence_intervals: {
          appointments: { lower: Math.round(appointmentsCI.lower), upper: Math.round(appointmentsCI.upper) },
          completion_rate: { lower: Math.round(completionCI.lower * 10) / 10, upper: Math.round(completionCI.upper * 10) / 10 },
          wait_time: { lower: Math.round(waitTimeCI.lower * 10) / 10, upper: Math.round(waitTimeCI.upper * 10) / 10 }
        }
      }
    };
  }

  // Generate real-time metrics using time-series analysis
  private static generateRealTimeMetrics() {
    const currentHour = new Date().getHours();
    const currentDay = new Date().getDay();
    
    // Apply hourly and daily patterns
    const hourlyMultiplier = currentHour >= 8 && currentHour <= 17 ? 
      this.STATS_CONFIG.HOURLY_PATTERN[currentHour - 8] || 0.5 : 0.1;
    const dailyMultiplier = this.STATS_CONFIG.WEEKLY_SEASONALITY[currentDay];
    
    // Use Poisson process for real-time arrivals
    const baseQueue = this.poissonRandom(6);
    const currentQueue = Math.floor(baseQueue * hourlyMultiplier * dailyMultiplier);
    
    // Active counters based on queue length (queueing theory)
    const optimalCounters = Math.ceil(currentQueue / 3); // M/M/c queue approximation
    const activeCounters = Math.min(12, Math.max(2, optimalCounters));
    
    // Today's completed follows gamma distribution
    const completedBase = this.gammaRandom(4, 25);
    const todayCompleted = Math.floor(completedBase * dailyMultiplier * (currentHour / 17));
    
    // Service time with correlation to queue length
    const baseServiceTime = this.gammaRandom(
      this.STATS_CONFIG.GAMMA_SERVICE_TIME.shape,
      this.STATS_CONFIG.GAMMA_SERVICE_TIME.scale
    );
    const queueFactor = 1 + (currentQueue / 20); // Longer service times when busy
    const averageServiceTime = Math.round(baseServiceTime * queueFactor);
    
    // Calculate Little's Law: L = λW (queue length = arrival rate × wait time)
    const arrivalRate = currentQueue / 60; // appointments per minute
    const waitTime = currentQueue / (activeCounters * 0.25); // service rate per counter
    
    return {
      currentQueue,
      activeCounters,
      todayCompleted,
      averageServiceTime,
      // Advanced real-time metrics
      realTimeAnalytics: {
        arrival_rate: Math.round(arrivalRate * 100) / 100,
        estimated_wait_time: Math.round(waitTime),
        system_utilization: Math.round((currentQueue / (activeCounters * 5)) * 100) / 100,
        queue_efficiency: currentQueue > 0 ? Math.round((activeCounters / currentQueue) * 100) / 100 : 1,
        peak_indicator: hourlyMultiplier > 0.8 ? 'peak' : hourlyMultiplier > 0.5 ? 'moderate' : 'low'
      }
    };
  }

  // Comprehensive statistical analysis for government analytics
  static generateStatisticalReport(timeframe: string = '30days') {
    const days = timeframe === '7days' ? 7 : timeframe === '30days' ? 30 : 90;
    const dailyMetrics = this.generateDailyMetrics(days);
    const hourlyMetrics = this.generateHourlyMetrics(days);
    
    // Time series analysis
    const appointmentsSeries = dailyMetrics.map(m => m.total_appointments);
    const efficiencySeries = dailyMetrics.map(m => m.completion_rate);
    
    // Statistical tests and analysis
    const normalityTest = this.shapiroWilkTest(appointmentsSeries.slice(0, 20)); // Test for normality
    const autocorrelation = this.calculateAutocorrelation(appointmentsSeries, 1); // Lag-1 autocorrelation
    const seasonality = this.detectSeasonality(appointmentsSeries);
    
    // Performance benchmarking
    const benchmarks = this.calculatePerformanceBenchmarks(dailyMetrics);
    
    // Forecasting using ARIMA-like model
    const forecast = this.simpleArima(appointmentsSeries, 7); // 7-day forecast
    
    return {
      statistical_summary: {
        sample_size: appointmentsSeries.length,
        normality_test: normalityTest,
        autocorrelation: Math.round(autocorrelation * 1000) / 1000,
        seasonality_detected: seasonality,
        data_quality_score: this.calculateDataQuality(dailyMetrics)
      },
      performance_benchmarks: benchmarks,
      forecast: forecast,
      recommendations: this.generateRecommendations(dailyMetrics, hourlyMetrics)
    };
  }

  // Shapiro-Wilk test for normality (simplified version)
  private static shapiroWilkTest(data: number[]): { statistic: number, isNormal: boolean } {
    const n = data.length;
    if (n < 3) return { statistic: 0, isNormal: false };
    
    // Sort data
    const sorted = [...data].sort((a, b) => a - b);
    
    // Calculate mean and variance
    const mean = sorted.reduce((sum, val) => sum + val, 0) / n;
    const variance = sorted.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (n - 1);
    
    // Simplified W statistic calculation
    let numerator = 0;
    for (let i = 0; i < Math.floor(n / 2); i++) {
      numerator += (sorted[n - 1 - i] - sorted[i]);
    }
    numerator = numerator * numerator;
    
    const denominator = (n - 1) * variance;
    const W = numerator / denominator;
    
    return {
      statistic: Math.round(W * 1000) / 1000,
      isNormal: W > 0.9 // Simplified threshold
    };
  }

  // Calculate autocorrelation
  private static calculateAutocorrelation(data: number[], lag: number): number {
    const n = data.length;
    const mean = data.reduce((sum, val) => sum + val, 0) / n;
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n - lag; i++) {
      numerator += (data[i] - mean) * (data[i + lag] - mean);
    }
    
    for (let i = 0; i < n; i++) {
      denominator += Math.pow(data[i] - mean, 2);
    }
    
    return numerator / denominator;
  }

  // Detect seasonality patterns
  private static detectSeasonality(data: number[]): boolean {
    if (data.length < 14) return false;
    
    // Check for weekly pattern (7-day cycle)
    const weeklyCorrelation = this.calculateAutocorrelation(data, 7);
    return Math.abs(weeklyCorrelation) > 0.3; // Threshold for significant correlation
  }

  // Calculate performance benchmarks
  private static calculatePerformanceBenchmarks(dailyMetrics: DailyMetrics[]) {
    const efficiencyData = dailyMetrics.map(m => m.completion_rate);
    const waitTimeData = dailyMetrics.map(m => m.average_wait_time_minutes);
    
    efficiencyData.sort((a, b) => a - b);
    waitTimeData.sort((a, b) => a - b);
    
    return {
      efficiency_percentiles: {
        p25: this.percentile(efficiencyData, 0.25),
        p50: this.percentile(efficiencyData, 0.50),
        p75: this.percentile(efficiencyData, 0.75),
        p90: this.percentile(efficiencyData, 0.90)
      },
      wait_time_percentiles: {
        p25: this.percentile(waitTimeData, 0.25),
        p50: this.percentile(waitTimeData, 0.50),
        p75: this.percentile(waitTimeData, 0.75),
        p90: this.percentile(waitTimeData, 0.90)
      }
    };
  }

  // Calculate percentile
  private static percentile(data: number[], p: number): number {
    const index = p * (data.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    
    return data[lower] * (1 - weight) + data[upper] * weight;
  }

  // Simple ARIMA-like forecasting
  private static simpleArima(data: number[], periods: number): number[] {
    if (data.length < 3) return [];
    
    // Calculate trend and seasonal components
    const trend = this.calculateTrend(data);
    const seasonalPeriod = 7; // Weekly seasonality
    const seasonal = this.extractSeasonal(data, seasonalPeriod);
    
    const forecast: number[] = [];
    const lastValue = data[data.length - 1];
    
    for (let i = 1; i <= periods; i++) {
      const trendComponent = trend * i;
      const seasonalComponent = seasonal[i % seasonalPeriod] || 0;
      const forecastValue = lastValue + trendComponent + seasonalComponent;
      forecast.push(Math.max(0, Math.round(forecastValue)));
    }
    
    return forecast;
  }

  // Extract seasonal component
  private static extractSeasonal(data: number[], period: number): number[] {
    const seasonal: number[] = new Array(period).fill(0);
    const counts: number[] = new Array(period).fill(0);
    
    for (let i = 0; i < data.length; i++) {
      const seasonIndex = i % period;
      seasonal[seasonIndex] += data[i];
      counts[seasonIndex]++;
    }
    
    // Average by period
    for (let i = 0; i < period; i++) {
      if (counts[i] > 0) {
        seasonal[i] = seasonal[i] / counts[i];
      }
    }
    
    // Detrend seasonal component
    const overall_mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    return seasonal.map(val => val - overall_mean);
  }

  // Calculate data quality score
  private static calculateDataQuality(dailyMetrics: DailyMetrics[]): number {
    let score = 100;
    
    // Check for missing values (simulated)
    const missingValues = dailyMetrics.filter(m => 
      m.total_appointments === 0 || m.completion_rate === 0
    ).length;
    score -= (missingValues / dailyMetrics.length) * 20;
    
    // Check for outliers using IQR method
    const appointments = dailyMetrics.map(m => m.total_appointments);
    const q1 = this.percentile(appointments, 0.25);
    const q3 = this.percentile(appointments, 0.75);
    const iqr = q3 - q1;
    const outliers = appointments.filter(val => 
      val < q1 - 1.5 * iqr || val > q3 + 1.5 * iqr
    ).length;
    score -= (outliers / appointments.length) * 15;
    
    // Check for data consistency
    const inconsistencies = dailyMetrics.filter(m => 
      m.completed_appointments > m.total_appointments ||
      m.no_show_appointments > m.total_appointments ||
      m.completion_rate > 100 || m.completion_rate < 0
    ).length;
    score -= (inconsistencies / dailyMetrics.length) * 25;
    
    return Math.max(0, Math.round(score));
  }

  // Generate data-driven recommendations
  private static generateRecommendations(dailyMetrics: DailyMetrics[], hourlyMetrics: HourlyMetrics[]): string[] {
    const recommendations: string[] = [];
    
    // Analyze efficiency trends
    const efficiencyData = dailyMetrics.map(m => m.completion_rate);
    const efficiencyTrend = this.calculateTrend(efficiencyData);
    
    if (efficiencyTrend < -0.1) {
      recommendations.push("Efficiency is declining. Consider staff training or process optimization.");
    }
    
    // Analyze wait times
    const avgWaitTime = dailyMetrics.reduce((sum, m) => sum + m.average_wait_time_minutes, 0) / dailyMetrics.length;
    if (avgWaitTime > 45) {
      recommendations.push("Average wait times exceed 45 minutes. Consider increasing staff or improving processes.");
    }
    
    // Analyze peak hours
    const peakHours = hourlyMetrics.reduce((max, current) => 
      current.appointments_scheduled > max.appointments_scheduled ? current : max
    );
    recommendations.push(`Peak hour is ${peakHours.metric_hour}:00. Consider staff scheduling optimization.`);
    
    // No-show analysis
    const avgNoShowRate = dailyMetrics.reduce((sum, m) => sum + m.no_show_rate, 0) / dailyMetrics.length;
    if (avgNoShowRate > 15) {
      recommendations.push("High no-show rate detected. Implement reminder systems or overbooking strategies.");
    }
    
    return recommendations;
  }
}
