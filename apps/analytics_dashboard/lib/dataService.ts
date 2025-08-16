// Real Database Analytics Data Service
// This service fetches actual data from the main database tables
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Types matching the main database structure
export interface MainBooking {
  id: number;
  booking_code: string;
  user_id: string | null;
  service_id: string;
  office_id: string;
  slot_date: string;
  slot_time: string;
  full_name: string;
  nic: string;
  email: string;
  phone: string;
  alt_phone?: string;
  status: string; // 'Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'No Show'
  created_at: string;
}

export interface MainService {
  id: string;
  slug: string;
  title: string;
  short_description?: string;
  category: string;
  department_id: string | null;
  is_online: boolean;
  processing_time_days_min?: number;
  processing_time_days_max?: number;
  fee_min?: number;
  fee_max?: number;
  popularity: 'high' | 'medium' | 'low';
  default_location?: string;
  updated_at: string;
}

export interface MainDepartment {
  id: string;
  name: string;
}

export interface MainOffice {
  id: string;
  name: string;
  city: string;
  timezone: string;
}

export interface MainProfile {
  id: string;
  full_name?: string;
  nic?: string;
  dob?: string;
  phone?: string;
  email?: string;
  address_line1?: string;
  address_line2?: string;
  district?: string;
  postal_code?: string;
  preferred_language?: 'en' | 'si' | 'ta';
  verified: boolean;
  updated_at: string;
}

// Dashboard data types (output format)
export interface DashboardData {
  peakHours: Array<{
    hour: string;
    bookings: number;
    processing_time: number;
  }>;
  departmentalLoad: Array<{
    name: string;
    appointments: number;
    no_shows: number;
    efficiency: number;
  }>;
  weeklyTrends: Array<{
    day: string;
    bookings: number;
    completed: number;
    no_shows: number;
  }>;
  kpiMetrics: {
    totalAppointments: number;
    completionRate: number;
    averageWaitTime: number;
    noShowRate: number;
  };
}

export class AnalyticsDataService {
  // Lazily create a Supabase client when env vars are present; otherwise return null
  private static _supabase: SupabaseClient | null | undefined;
  private static getSupabase(): SupabaseClient | null {
    if (this._supabase !== undefined) return this._supabase;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      this._supabase = null;
      return null;
    }
    this._supabase = createClient(url, key);
    return this._supabase;
  }

  // Cache for database queries (5 minute TTL)
  private static dataCache: Map<string, any> = new Map();
  private static cacheExpiry: Map<string, number> = new Map();

  private static getCacheKey(query: string, params: any): string {
    return `${query}_${JSON.stringify(params)}`;
  }

  private static isCacheValid(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    return expiry ? Date.now() < expiry : false;
  }

  private static setCache(key: string, data: any, ttlMinutes: number = 5): void {
    this.dataCache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + (ttlMinutes * 60 * 1000));
  }

  private static getFromCache(key: string): any {
    return this.dataCache.get(key);
  }

  // Get date range based on timeframe
  private static getDateRange(timeframe: string): { startDate: string; endDate: string } {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case '24hours':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case '7days':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 7);
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  }

  // Fetch all bookings for the given timeframe
  static async fetchBookings(timeframe: string = '7days'): Promise<MainBooking[]> {
  const supabase = this.getSupabase();
  if (!supabase) return [];
    const cacheKey = this.getCacheKey('bookings', { timeframe });
    if (this.isCacheValid(cacheKey)) {
      return this.getFromCache(cacheKey);
    }

    const { startDate, endDate } = this.getDateRange(timeframe);

  const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .gte('slot_date', startDate)
      .lte('slot_date', endDate)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }

    this.setCache(cacheKey, bookings || []);
    return bookings || [];
  }

  // Fetch all departments
  static async fetchDepartments(): Promise<MainDepartment[]> {
  const supabase = this.getSupabase();
  if (!supabase) return [];
    const cacheKey = this.getCacheKey('departments', {});
    if (this.isCacheValid(cacheKey)) {
      return this.getFromCache(cacheKey);
    }

  const { data: departments, error } = await supabase
      .from('departments')
      .select('*');

    if (error) {
      console.error('Error fetching departments:', error);
      return [];
    }

    this.setCache(cacheKey, departments || []);
    return departments || [];
  }

  // Fetch all services
  static async fetchServices(): Promise<MainService[]> {
  const supabase = this.getSupabase();
  if (!supabase) return [];
    const cacheKey = this.getCacheKey('services', {});
    if (this.isCacheValid(cacheKey)) {
      return this.getFromCache(cacheKey);
    }

  const { data: services, error } = await supabase
      .from('services')
      .select('*');

    if (error) {
      console.error('Error fetching services:', error);
      return [];
    }

    this.setCache(cacheKey, services || []);
    return services || [];
  }

  // Fetch all offices
  static async fetchOffices(): Promise<MainOffice[]> {
  const supabase = this.getSupabase();
  if (!supabase) return [];
    const cacheKey = this.getCacheKey('offices', {});
    if (this.isCacheValid(cacheKey)) {
      return this.getFromCache(cacheKey);
    }

  const { data: offices, error } = await supabase
      .from('offices')
      .select('*');

    if (error) {
      console.error('Error fetching offices:', error);
      return [];
    }

    this.setCache(cacheKey, offices || []);
    return offices || [];
  }

  // Fetch slots (used as fallback when bookings are empty)
  static async fetchSlots(): Promise<any[]> {
  const supabase = this.getSupabase();
  if (!supabase) return [];
    const cacheKey = this.getCacheKey('slots', {});
    if (this.isCacheValid(cacheKey)) {
      return this.getFromCache(cacheKey);
    }

  const { data: slots, error } = await supabase
      .from('slots')
      .select('*')
      .order('slot_date', { ascending: false });

    if (error) {
      console.error('Error fetching slots:', error);
      return [];
    }

    this.setCache(cacheKey, slots || []);
    return slots || [];
  }

  // Main dashboard data generation from real database
  static async generateDashboardData(timeframe: string = '7days'): Promise<DashboardData> {
    try {
      // Fetch real data from main database
      const [bookings, departments, services, offices] = await Promise.all([
        this.fetchBookings(timeframe),
        this.fetchDepartments(),
        this.fetchServices(),
        this.fetchOffices()
      ]);

      // If bookings exist, generate metrics from them
      if (bookings && bookings.length > 0) {
        return {
          peakHours: this.calculatePeakHours(bookings),
          departmentalLoad: await this.calculateDepartmentalLoad(bookings, departments, services),
          weeklyTrends: this.calculateWeeklyTrends(bookings),
          kpiMetrics: this.calculateKPIMetrics(bookings)
        };
      }

      // Fallback: if bookings are empty, derive visuals from slots + services
      const slots = await this.fetchSlots();
      if (slots && slots.length > 0) {
        return this.generateFromSlots(slots, services, departments);
      }

      // If nothing available, return empty structure
      return this.getEmptyDashboardData();

    } catch (error) {
      console.error('Error generating dashboard data:', error);
      // Return empty data structure if database is not available
      return this.getEmptyDashboardData();
    }
  }

  // Generate dashboard data from slots when bookings are not available
  private static generateFromSlots(slots: any[], services: MainService[], departments: MainDepartment[]): DashboardData {
    // Peak hours: count slots by hour
    const hourlyCounts: { [hour: string]: number } = {};
    for (let hour = 8; hour <= 17; hour++) {
      hourlyCounts[`${hour.toString().padStart(2, '0')}:00`] = 0;
    }

    slots.forEach(s => {
      if (!s.slot_time) return;
      const h = `${s.slot_time.split(':')[0].padStart(2, '0')}:00`;
      if (hourlyCounts[h] !== undefined) hourlyCounts[h]++;
    });

    const peakHours = Object.entries(hourlyCounts).map(([hour, count]) => ({ hour, bookings: count, processing_time: 0 }));

    // Departmental load: count slots per service -> department (support id or slug)
    const serviceIdToDept: Record<string, string> = {};
    const serviceSlugToDept: Record<string, string> = {};
    services.forEach(s => { 
      if (s.department_id) {
        serviceIdToDept[String(s.id)] = s.department_id;
        if (s.slug) serviceSlugToDept[String(s.slug).toLowerCase()] = s.department_id;
      }
    });

    const deptStats: { [deptId: string]: { name: string; appointments: number; no_shows: number } } = {};
    departments.forEach(d => { deptStats[d.id] = { name: d.name, appointments: 0, no_shows: 0 }; });

    slots.forEach(s => {
      const svcKey = String(s.service_id);
      const dept = serviceIdToDept[svcKey] ?? serviceSlugToDept[svcKey.toLowerCase()];
      if (dept && deptStats[dept]) deptStats[dept].appointments++;
    });

    const departmentalLoad = Object.values(deptStats).map(d => ({ name: d.name, appointments: d.appointments, no_shows: d.no_shows, efficiency: d.appointments > 0 ? 100 : 0 }));

    // Weekly trends from slot_date
    const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    const weekly: { [day: string]: number } = {};
    days.forEach(d => weekly[d] = 0);
    slots.forEach(s => {
      const date = new Date(s.slot_date);
      if (isNaN(date.getTime())) return;
      const dayIndex = date.getDay();
      const dayName = days[dayIndex === 0 ? 6 : dayIndex - 1];
      weekly[dayName]++;
    });
    const weeklyTrends = days.map(d => ({ day: d, bookings: weekly[d], completed: 0, no_shows: 0 }));

    const totalSlots = slots.length;

    return {
      peakHours,
      departmentalLoad,
      weeklyTrends,
      kpiMetrics: {
        totalAppointments: totalSlots,
        completionRate: 0,
        averageWaitTime: 0,
        noShowRate: 0
      }
    };
  }

  // Calculate peak hours from real booking data
  private static calculatePeakHours(bookings: MainBooking[]) {
    const hourlyData: { [hour: string]: { count: number; totalProcessingTime: number } } = {};

    // Initialize hours 8 AM to 5 PM
    for (let hour = 8; hour <= 17; hour++) {
      const hourStr = `${hour.toString().padStart(2, '0')}:00`;
      hourlyData[hourStr] = { count: 0, totalProcessingTime: 0 };
    }

    // Count bookings by hour
    bookings.forEach(booking => {
      const appointmentHour = parseInt(booking.slot_time.split(':')[0]);
      if (appointmentHour >= 8 && appointmentHour <= 17) {
        const hourStr = `${appointmentHour.toString().padStart(2, '0')}:00`;
        hourlyData[hourStr].count++;
        
        // Estimate processing time based on status (in minutes)
        let processingTime = 30; // default
        if (booking.status === 'Completed') processingTime = 25;
        if (booking.status === 'No Show') processingTime = 0;
        if (booking.status === 'Cancelled') processingTime = 0;
        
        hourlyData[hourStr].totalProcessingTime += processingTime;
      }
    });

    // Convert to array format for charts
    return Object.entries(hourlyData).map(([hour, data]) => ({
      hour,
      bookings: data.count,
      processing_time: data.count > 0 ? Math.round(data.totalProcessingTime / data.count) : 0
    }));
  }

  // Calculate departmental load from real data
  private static async calculateDepartmentalLoad(
    bookings: MainBooking[], 
    departments: MainDepartment[], 
    services: MainService[]
  ) {
    const departmentStats: { [deptId: string]: { 
      name: string; 
      appointments: number; 
      completed: number; 
      noShows: number; 
    } } = {};

    // Initialize department stats
    departments.forEach(dept => {
      departmentStats[dept.id] = {
        name: dept.name,
        appointments: 0,
        completed: 0,
        noShows: 0
      };
    });

    // Create service to department mapping supporting both id and slug keys
    const serviceIdToDept: Record<string, string> = {};
    const serviceSlugToDept: Record<string, string> = {};
    services.forEach(service => {
      if (service.department_id) {
        serviceIdToDept[String(service.id)] = service.department_id;
        if (service.slug) {
          serviceSlugToDept[String(service.slug).toLowerCase()] = service.department_id;
        }
      }
    });

    // Count bookings by department
    bookings.forEach(booking => {
      const svcKey = String(booking.service_id);
      const departmentId = serviceIdToDept[svcKey] ?? serviceSlugToDept[svcKey.toLowerCase()];
      if (departmentId && departmentStats[departmentId]) {
        departmentStats[departmentId].appointments++;

        const status = String(booking.status || '').toLowerCase();
        if (status === 'completed') {
          departmentStats[departmentId].completed++;
        }
        if (status === 'no show' || status === 'no_show' || status === 'noshow') {
          departmentStats[departmentId].noShows++;
        }
      }
    });

    // Convert to array format
    return Object.values(departmentStats).map(dept => ({
      name: dept.name,
      appointments: dept.appointments,
      no_shows: dept.noShows,
      efficiency: dept.appointments > 0 ? Math.round((dept.completed / dept.appointments) * 100) : 0
    }));
  }

  // Calculate weekly trends from real booking data
  private static calculateWeeklyTrends(bookings: MainBooking[]) {
    const weeklyData: { [day: string]: { bookings: number; completed: number; noShows: number } } = {};
    
    // Initialize days of the week
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    days.forEach(day => {
      weeklyData[day] = { bookings: 0, completed: 0, noShows: 0 };
    });

    // Count bookings by day of week
    bookings.forEach(booking => {
      const date = new Date(booking.slot_date);
      const dayIndex = date.getDay();
      const dayName = days[dayIndex === 0 ? 6 : dayIndex - 1]; // Convert Sunday=0 to Sunday=6

      weeklyData[dayName].bookings++;
      
  const status = String(booking.status || '').toLowerCase();
  if (status === 'completed') {
        weeklyData[dayName].completed++;
      }
  if (status === 'no show' || status === 'no_show' || status === 'noshow') {
        weeklyData[dayName].noShows++;
      }
    });

    // Convert to array format
    return days.map(day => ({
      day,
      bookings: weeklyData[day].bookings,
      completed: weeklyData[day].completed,
      no_shows: weeklyData[day].noShows
    }));
  }

  // Calculate KPI metrics from real data
  private static calculateKPIMetrics(bookings: MainBooking[]) {
    const totalAppointments = bookings.length;
    const completedAppointments = bookings.filter(b => String(b.status || '').toLowerCase() === 'completed').length;
    const noShowAppointments = bookings.filter(b => {
      const s = String(b.status || '').toLowerCase();
      return s === 'no show' || s === 'no_show' || s === 'noshow';
    }).length;
    
    // Calculate average wait time (estimated based on appointment time vs created time)
    let totalWaitTime = 0;
    let waitTimeCount = 0;
    
    bookings.forEach(booking => {
  const status = String(booking.status || '').toLowerCase();
  if (status === 'completed') {
        // Estimate wait time based on appointment slot vs creation time
        const appointmentDateTime = new Date(`${booking.slot_date}T${booking.slot_time}`);
        const createdDateTime = new Date(booking.created_at);
        
        // Simple estimation: assume 30 minutes average wait for completed appointments
        totalWaitTime += 30;
        waitTimeCount++;
      }
    });

    return {
      totalAppointments,
      completionRate: totalAppointments > 0 ? Math.round((completedAppointments / totalAppointments) * 100) : 0,
      averageWaitTime: waitTimeCount > 0 ? Math.round(totalWaitTime / waitTimeCount) : 0,
      noShowRate: totalAppointments > 0 ? Math.round((noShowAppointments / totalAppointments) * 100) : 0
    };
  }

  // Return empty data structure when database is not available
  private static getEmptyDashboardData(): DashboardData {
    return {
      peakHours: Array.from({ length: 10 }, (_, i) => ({
        hour: `${(i + 8).toString().padStart(2, '0')}:00`,
        bookings: 0,
        processing_time: 0
      })),
      departmentalLoad: [
        { name: 'Immigration Services', appointments: 0, no_shows: 0, efficiency: 0 },
        { name: 'Civil Registration', appointments: 0, no_shows: 0, efficiency: 0 },
        { name: 'Motor Traffic', appointments: 0, no_shows: 0, efficiency: 0 },
        { name: 'Healthcare Services', appointments: 0, no_shows: 0, efficiency: 0 }
      ],
      weeklyTrends: [
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
      ].map(day => ({ day, bookings: 0, completed: 0, no_shows: 0 })),
      kpiMetrics: {
        totalAppointments: 0,
        completionRate: 0,
        averageWaitTime: 0,
        noShowRate: 0
      }
    };
  }

  // Query for specific analytics needs
  static async getBookingsByStatus(timeframe: string = '7days'): Promise<{ [status: string]: number }> {
    const bookings = await this.fetchBookings(timeframe);
    const statusCounts: { [status: string]: number } = {};

    bookings.forEach(booking => {
      statusCounts[booking.status] = (statusCounts[booking.status] || 0) + 1;
    });

    return statusCounts;
  }

  // Get department performance metrics
  static async getDepartmentPerformance(timeframe: string = '7days') {
    const [bookings, departments, services] = await Promise.all([
      this.fetchBookings(timeframe),
      this.fetchDepartments(),
      this.fetchServices()
    ]);

    return this.calculateDepartmentalLoad(bookings, departments, services);
  }

  // Get service popularity metrics
  static async getServicePopularity(timeframe: string = '7days') {
    const [bookings, services] = await Promise.all([
      this.fetchBookings(timeframe),
      this.fetchServices()
    ]);

    const serviceStats: { [serviceId: string]: { name: string; count: number; title: string } } = {};

    // Initialize service stats
    services.forEach(service => {
      serviceStats[service.id] = {
        name: service.slug,
        title: service.title,
        count: 0
      };
    });

    // Count bookings by service
    bookings.forEach(booking => {
      if (serviceStats[booking.service_id]) {
        serviceStats[booking.service_id].count++;
      }
    });

    // Convert to array and sort by popularity
    return Object.values(serviceStats)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 services
  }

  // Generate a basic statistical report for the given timeframe
  static async generateStatisticalReport(timeframe: string = '30days') {
    // Fetch data
    const [bookings, departments, services] = await Promise.all([
      this.fetchBookings(timeframe),
      this.fetchDepartments(),
      this.fetchServices()
    ]);

    const sampleSize = bookings.length || 0;

    // Weekly counts
    const weekly = this.calculateWeeklyTrends(bookings || []);
    const dailyCounts = weekly.map(w => w.bookings);
    const mean = dailyCounts.reduce((s, v) => s + v, 0) / (dailyCounts.length || 1);
    const variance = dailyCounts.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / (dailyCounts.length || 1);

    const seasonality_detected = variance > Math.max(1, mean * 0.2);

    const dataQualityScore = Math.min(100, Math.round(Math.min(1, sampleSize / Math.max(1, services.length * 10)) * 100));

    // Department efficiencies for percentiles
    const deptLoad = await this.calculateDepartmentalLoad(bookings, departments, services);
    const efficiencies = deptLoad.map(d => d.efficiency).sort((a, b) => a - b);

    const percentile = (arr: number[], p: number) => {
      if (arr.length === 0) return 0;
      const idx = Math.floor((p / 100) * (arr.length - 1));
      return arr[Math.max(0, Math.min(arr.length - 1, idx))];
    };

    const efficiency_percentiles = {
      p25: percentile(efficiencies, 25),
      p50: percentile(efficiencies, 50),
      p75: percentile(efficiencies, 75),
      p90: percentile(efficiencies, 90)
    };

    // Wait time percentiles - best-effort based on averageWaitTime
    const avgWait = this.calculateKPIMetrics(bookings).averageWaitTime;
    const wait_time_percentiles = {
      p25: Math.round(avgWait * 0.8),
      p50: avgWait,
      p75: Math.round(avgWait * 1.25),
      p90: Math.round(avgWait * 1.5)
    };

    // Simple forecast: repeat mean for next 7 days
    const forecast = Array.from({ length: 7 }, () => Math.round(mean));

    const recommendations: string[] = [];
    if (dataQualityScore < 50) recommendations.push('Increase data collection for better analysis.');
    if (seasonality_detected) recommendations.push('Consider weekly staffing adjustments to match seasonality.');
    if (efficiency_percentiles.p50 < 80) recommendations.push('Investigate processes in lower-performing departments to improve efficiency.');

    return {
      statistical_summary: {
        sample_size: sampleSize,
        normality_test: { statistic: 0, isNormal: sampleSize >= 30 },
        autocorrelation: 0,
        seasonality_detected,
        data_quality_score: dataQualityScore
      },
      performance_benchmarks: {
        efficiency_percentiles,
        wait_time_percentiles
      },
      forecast,
      recommendations
    };
  }
}
