// Configuration for Analytics Dashboard Tables
export const ANALYTICS_CONFIG = {
	// Analytics tables for dashboard visualization
	tables: {
		appointments: 'analytics_appointments',
		citizens: 'analytics_citizens',
		services: 'analytics_services',
		departments: 'analytics_departments',
		daily_metrics: 'analytics_daily_metrics',
		hourly_metrics: 'analytics_hourly_metrics',
		weekly_trends: 'analytics_weekly_trends'
	},

	// Column mappings for analytics tables
	columns: {
		appointments: {
			id: 'id',
			appointment_reference: 'appointment_reference',
			citizen_id: 'citizen_id',
			service_id: 'service_id',
			department_id: 'department_id',
			status: 'status',
			appointment_date: 'appointment_date',
			appointment_time: 'appointment_time',
			scheduled_at: 'scheduled_at',
			arrived_at: 'arrived_at',
			service_started_at: 'service_started_at',
			service_completed_at: 'service_completed_at',
			wait_time_minutes: 'wait_time_minutes',
			service_duration_minutes: 'service_duration_minutes',
			total_processing_time_minutes: 'total_processing_time_minutes',
			priority_level: 'priority_level',
			appointment_channel: 'appointment_channel',
			rescheduled_count: 'rescheduled_count'
		},
		citizens: {
			id: 'id',
			citizen_reference: 'citizen_reference',
			age_group: 'age_group',
			gender: 'gender',
			district: 'district',
			province: 'province',
			preferred_language: 'preferred_language',
			total_appointments: 'total_appointments',
			completed_appointments: 'completed_appointments',
			no_show_count: 'no_show_count'
		},
		services: {
			id: 'id',
			service_code: 'service_code',
			service_name: 'service_name',
			service_name_si: 'service_name_si',
			service_name_ta: 'service_name_ta',
			department_id: 'department_id',
			estimated_duration_minutes: 'estimated_duration_minutes',
			base_fee: 'base_fee',
			complexity_level: 'complexity_level',
			is_active: 'is_active'
		},
		departments: {
			id: 'id',
			department_code: 'department_code',
			department_name: 'department_name',
			department_name_si: 'department_name_si',
			department_name_ta: 'department_name_ta',
			total_staff_count: 'total_staff_count',
			daily_capacity: 'daily_capacity',
			target_wait_time_minutes: 'target_wait_time_minutes',
			is_active: 'is_active'
		},
		daily_metrics: {
			metric_date: 'metric_date',
			department_id: 'department_id',
			service_id: 'service_id',
			total_appointments: 'total_appointments',
			completed_appointments: 'completed_appointments',
			no_show_appointments: 'no_show_appointments',
			average_wait_time_minutes: 'average_wait_time_minutes',
			completion_rate: 'completion_rate',
			no_show_rate: 'no_show_rate',
			capacity_utilized: 'capacity_utilized'
		},
		hourly_metrics: {
			metric_date: 'metric_date',
			metric_hour: 'metric_hour',
			department_id: 'department_id',
			appointments_scheduled: 'appointments_scheduled',
			appointments_completed: 'appointments_completed',
			average_wait_time_minutes: 'average_wait_time_minutes',
			max_queue_length: 'max_queue_length'
		}
	},

	// Status mappings
	appointmentStatuses: {
		SCHEDULED: 'scheduled',
		CONFIRMED: 'confirmed',
		IN_PROGRESS: 'in_progress',
		COMPLETED: 'completed',
		CANCELLED: 'cancelled',
		NO_SHOW: 'no_show'
	},

	// Department codes with full names
	departments: {
		IMMIGRATION: { code: 'IMM', name: 'Immigration Services' },
		CIVIL_REGISTRATION: { code: 'CR', name: 'Civil Registration' },
		TAX_DEPARTMENT: { code: 'TAX', name: 'Tax Department' },
		MOTOR_TRAFFIC: { code: 'MT', name: 'Motor Traffic' },
		HEALTHCARE: { code: 'HC', name: 'Healthcare Services' },
		EDUCATION: { code: 'EDU', name: 'Education Department' },
		SOCIAL_SERVICES: { code: 'SS', name: 'Social Services' },
		LAND_REGISTRY: { code: 'LR', name: 'Land Registry' },
		BUSINESS_REG: { code: 'BR', name: 'Business Registration' },
		POLICE_SERVICES: { code: 'PS', name: 'Police Services' },
		JUDICIAL: { code: 'JUD', name: 'Judicial Services' },
		MUNICIPAL: { code: 'MUN', name: 'Municipal Services' }
	},

	// Service categories
	serviceCategories: {
		CERTIFICATES: 'certificates',
		LICENSES: 'licenses',
		REGISTRATIONS: 'registrations',
		PAYMENTS: 'payments',
		APPLICATIONS: 'applications',
		RENEWALS: 'renewals'
	}
};

// Sample queries for analytics dashboard
export const ANALYTICS_QUERIES = {
	// Get appointment statistics for a date range
	getAppointmentStats: (startDate: string, endDate: string) => ({
		from: ANALYTICS_CONFIG.tables.appointments,
		select: `
			*,
			${ANALYTICS_CONFIG.tables.services}(service_name, department_id),
			${ANALYTICS_CONFIG.tables.departments}(department_name)
		`,
		filters: [
			{ column: 'scheduled_at', operator: 'gte', value: startDate },
			{ column: 'scheduled_at', operator: 'lte', value: endDate }
		]
	}),

	// Get department performance metrics
	getDepartmentPerformance: () => ({
		from: ANALYTICS_CONFIG.tables.daily_metrics,
		select: `
			*,
			${ANALYTICS_CONFIG.tables.departments}(department_name, department_code)
		`
	}),

	// Get peak hours data from hourly metrics
	getPeakHours: (startDate: string, endDate: string) => ({
		from: ANALYTICS_CONFIG.tables.hourly_metrics,
		select: 'metric_hour, appointments_scheduled, average_wait_time_minutes',
		filters: [
			{ column: 'metric_date', operator: 'gte', value: startDate },
			{ column: 'metric_date', operator: 'lte', value: endDate }
		]
	}),

	// Get weekly trends
	getWeeklyTrends: (startDate: string, endDate: string) => ({
		from: ANALYTICS_CONFIG.tables.weekly_trends,
		select: '*',
		filters: [
			{ column: 'week_start_date', operator: 'gte', value: startDate },
			{ column: 'week_end_date', operator: 'lte', value: endDate }
		]
	}),

	// Get real-time appointment data
	getRealTimeAppointments: () => ({
		from: ANALYTICS_CONFIG.tables.appointments,
		select: 'status, scheduled_at, wait_time_minutes, appointment_channel',
		filters: [
			{ column: 'appointment_date', operator: 'eq', value: 'today' },
			{ column: 'status', operator: 'in', value: ['scheduled', 'in_progress', 'completed'] }
		]
	})
};

// Helper functions for data processing
export const ANALYTICS_HELPERS = {
	// Group appointments by hour
	groupAppointmentsByHour: (appointments: any[]) => {
		const hourGroups: { [key: string]: any[] } = {};
    
		appointments.forEach(appointment => {
			const hour = new Date(appointment.created_at).getHours();
			const hourKey = `${hour.toString().padStart(2, '0')}:00`;
      
			if (!hourGroups[hourKey]) {
				hourGroups[hourKey] = [];
			}
			hourGroups[hourKey].push(appointment);
		});
    
		return hourGroups;
	},

	// Calculate efficiency rate
	calculateEfficiency: (total: number, completed: number, noShows: number) => {
		if (total === 0) return 0;
		return ((completed / total) * 100);
	},

	// Calculate average wait time
	calculateAverageWaitTime: (appointments: any[]) => {
		const appointmentsWithWaitTime = appointments.filter(apt => apt.wait_time_minutes);
		if (appointmentsWithWaitTime.length === 0) return 0;
    
		const totalWaitTime = appointmentsWithWaitTime.reduce(
			(sum, apt) => sum + apt.wait_time_minutes, 0
		);
    
		return totalWaitTime / appointmentsWithWaitTime.length;
	},

	// Group by day of week
	groupByDayOfWeek: (appointments: any[]) => {
		const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
		const dayGroups: { [key: string]: any[] } = {};
    
		days.forEach(day => dayGroups[day] = []);
    
		appointments.forEach(appointment => {
			const dayIndex = new Date(appointment.created_at).getDay();
			dayGroups[days[dayIndex]].push(appointment);
		});
    
		return dayGroups;
	}
};

// Real-time data refresh intervals (in milliseconds)
export const REFRESH_INTERVALS = {
	DASHBOARD: 300000, // 5 minutes
	REALTIME: 30000,   // 30 seconds
	HOURLY: 3600000,   // 1 hour
	DAILY: 86400000    // 24 hours
};
