-- Analytics Dashboard Database Schema for Supabase
-- Run these commands in your Supabase SQL editor when ready to create the analytics tables

-- Enable Row Level Security and create necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Analytics Departments Table
CREATE TABLE IF NOT EXISTS analytics_departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Department Information
  department_code VARCHAR(10) UNIQUE NOT NULL,
  department_name VARCHAR(255) NOT NULL,
  department_name_si TEXT,
  department_name_ta TEXT,
  
  -- Operational Details
  location VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  
  -- Capacity & Resources
  total_staff_count INTEGER DEFAULT 1,
  active_counters INTEGER DEFAULT 1,
  daily_capacity INTEGER DEFAULT 100,
  
  -- Operating Hours
  opening_time TIME DEFAULT '08:00:00',
  closing_time TIME DEFAULT '16:30:00',
  lunch_break_start TIME DEFAULT '12:30:00',
  lunch_break_end TIME DEFAULT '13:30:00',
  
  -- Performance Targets
  target_wait_time_minutes INTEGER DEFAULT 30,
  target_service_time_minutes INTEGER DEFAULT 15,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Analytics Services Table
CREATE TABLE IF NOT EXISTS analytics_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Service Information
  service_code VARCHAR(20) UNIQUE NOT NULL,
  service_name VARCHAR(255) NOT NULL,
  service_name_si TEXT,
  service_name_ta TEXT,
  department_id UUID NOT NULL REFERENCES analytics_departments(id),
  
  -- Service Configuration
  estimated_duration_minutes INTEGER NOT NULL DEFAULT 30,
  max_appointments_per_day INTEGER DEFAULT 50,
  requires_documents BOOLEAN DEFAULT true,
  online_available BOOLEAN DEFAULT true,
  
  -- Pricing
  base_fee DECIMAL(10,2) DEFAULT 0.00,
  express_fee DECIMAL(10,2) DEFAULT 0.00,
  
  -- Analytics Metadata
  complexity_level VARCHAR(10) DEFAULT 'medium' CHECK (complexity_level IN ('simple', 'medium', 'complex')),
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Analytics Citizens Table (Anonymized)
CREATE TABLE IF NOT EXISTS analytics_citizens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Citizen Information (anonymized for analytics)
  citizen_reference VARCHAR(50) UNIQUE NOT NULL,
  age_group VARCHAR(20) CHECK (age_group IN ('18-25', '26-35', '36-45', '46-55', '56-65', '65+')),
  gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  
  -- Location Data
  district VARCHAR(50),
  province VARCHAR(50),
  
  -- Preferences
  preferred_language VARCHAR(5) DEFAULT 'en' CHECK (preferred_language IN ('en', 'si', 'ta')),
  preferred_contact_method VARCHAR(20) DEFAULT 'email' CHECK (preferred_contact_method IN ('email', 'sms', 'phone')),
  
  -- Engagement Metrics
  total_appointments INTEGER DEFAULT 0,
  completed_appointments INTEGER DEFAULT 0,
  cancelled_appointments INTEGER DEFAULT 0,
  no_show_count INTEGER DEFAULT 0,
  
  -- Registration Info
  registration_channel VARCHAR(20) DEFAULT 'web' CHECK (registration_channel IN ('web', 'mobile', 'office', 'agent')),
  first_appointment_date DATE,
  last_appointment_date DATE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Analytics Appointments Table
CREATE TABLE IF NOT EXISTS analytics_appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Appointment Details
  appointment_reference VARCHAR(50) UNIQUE NOT NULL,
  citizen_id UUID NOT NULL REFERENCES analytics_citizens(id),
  service_id UUID NOT NULL REFERENCES analytics_services(id),
  department_id UUID NOT NULL REFERENCES analytics_departments(id),
  
  -- Timing Information
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  arrived_at TIMESTAMP WITH TIME ZONE,
  service_started_at TIMESTAMP WITH TIME ZONE,
  service_completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Status Tracking
  status VARCHAR(20) NOT NULL CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  
  -- Performance Metrics
  wait_time_minutes INTEGER DEFAULT 0,
  service_duration_minutes INTEGER DEFAULT 0,
  total_processing_time_minutes INTEGER DEFAULT 0,
  
  -- Additional Info
  priority_level VARCHAR(10) DEFAULT 'normal' CHECK (priority_level IN ('urgent', 'high', 'normal', 'low')),
  appointment_channel VARCHAR(20) DEFAULT 'online' CHECK (appointment_channel IN ('online', 'phone', 'walk_in', 'mobile_app')),
  rescheduled_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Analytics Daily Metrics Table
CREATE TABLE IF NOT EXISTS analytics_daily_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Date and Scope
  metric_date DATE NOT NULL,
  department_id UUID REFERENCES analytics_departments(id),
  service_id UUID REFERENCES analytics_services(id),
  
  -- Appointment Metrics
  total_appointments INTEGER DEFAULT 0,
  completed_appointments INTEGER DEFAULT 0,
  cancelled_appointments INTEGER DEFAULT 0,
  no_show_appointments INTEGER DEFAULT 0,
  walk_in_appointments INTEGER DEFAULT 0,
  
  -- Performance Metrics
  average_wait_time_minutes DECIMAL(5,2) DEFAULT 0,
  average_service_time_minutes DECIMAL(5,2) DEFAULT 0,
  total_processing_time_minutes INTEGER DEFAULT 0,
  
  -- Efficiency Metrics
  completion_rate DECIMAL(5,2) DEFAULT 0,
  no_show_rate DECIMAL(5,2) DEFAULT 0,
  on_time_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Capacity Metrics
  capacity_utilized DECIMAL(5,2) DEFAULT 0,
  peak_hour_start TIME,
  peak_hour_end TIME,
  peak_hour_appointments INTEGER DEFAULT 0,
  
  -- Revenue Metrics
  total_fees_collected DECIMAL(12,2) DEFAULT 0,
  express_fees_collected DECIMAL(12,2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Analytics Hourly Metrics Table
CREATE TABLE IF NOT EXISTS analytics_hourly_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Time Period
  metric_date DATE NOT NULL,
  metric_hour INTEGER NOT NULL CHECK (metric_hour >= 0 AND metric_hour <= 23),
  department_id UUID REFERENCES analytics_departments(id),
  
  -- Hourly Appointments
  appointments_scheduled INTEGER DEFAULT 0,
  appointments_completed INTEGER DEFAULT 0,
  appointments_no_show INTEGER DEFAULT 0,
  walk_ins INTEGER DEFAULT 0,
  
  -- Timing Metrics
  average_wait_time_minutes DECIMAL(5,2) DEFAULT 0,
  average_service_time_minutes DECIMAL(5,2) DEFAULT 0,
  
  -- Queue Metrics
  max_queue_length INTEGER DEFAULT 0,
  average_queue_length DECIMAL(4,1) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Analytics Weekly Trends Table
CREATE TABLE IF NOT EXISTS analytics_weekly_trends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Week Information
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  year INTEGER NOT NULL,
  week_number INTEGER NOT NULL,
  
  -- Department/Service
  department_id UUID REFERENCES analytics_departments(id),
  service_id UUID REFERENCES analytics_services(id),
  
  -- Weekly Aggregates
  total_appointments INTEGER DEFAULT 0,
  completed_appointments INTEGER DEFAULT 0,
  no_show_appointments INTEGER DEFAULT 0,
  cancelled_appointments INTEGER DEFAULT 0,
  
  -- Day-wise Breakdown
  monday_appointments INTEGER DEFAULT 0,
  tuesday_appointments INTEGER DEFAULT 0,
  wednesday_appointments INTEGER DEFAULT 0,
  thursday_appointments INTEGER DEFAULT 0,
  friday_appointments INTEGER DEFAULT 0,
  saturday_appointments INTEGER DEFAULT 0,
  sunday_appointments INTEGER DEFAULT 0,
  
  -- Performance Metrics
  average_completion_rate DECIMAL(5,2) DEFAULT 0,
  average_wait_time_minutes DECIMAL(5,2) DEFAULT 0,
  peak_day VARCHAR(10),
  peak_day_appointments INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_analytics_appointments_date ON analytics_appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_analytics_appointments_status ON analytics_appointments(status);
CREATE INDEX IF NOT EXISTS idx_analytics_appointments_department_date ON analytics_appointments(department_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_analytics_appointments_service_date ON analytics_appointments(service_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_analytics_appointments_created_at ON analytics_appointments(created_at);

CREATE INDEX IF NOT EXISTS idx_analytics_citizens_district ON analytics_citizens(district);
CREATE INDEX IF NOT EXISTS idx_analytics_citizens_age_group ON analytics_citizens(age_group);

CREATE INDEX IF NOT EXISTS idx_analytics_daily_metrics_date ON analytics_daily_metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_analytics_daily_metrics_department_date ON analytics_daily_metrics(department_id, metric_date);

CREATE INDEX IF NOT EXISTS idx_analytics_hourly_metrics_date ON analytics_hourly_metrics(metric_date, metric_hour);

CREATE INDEX IF NOT EXISTS idx_analytics_weekly_trends_date ON analytics_weekly_trends(week_start_date);

-- Add Unique Constraints
ALTER TABLE analytics_daily_metrics ADD CONSTRAINT unique_daily_metric 
  UNIQUE(metric_date, department_id, service_id);

ALTER TABLE analytics_hourly_metrics ADD CONSTRAINT unique_hourly_metric 
  UNIQUE(metric_date, metric_hour, department_id);

ALTER TABLE analytics_weekly_trends ADD CONSTRAINT unique_weekly_trend 
  UNIQUE(week_start_date, department_id, service_id);

-- Enable Row Level Security (RLS)
ALTER TABLE analytics_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_citizens ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_hourly_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_weekly_trends ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies (Allow read access for analytics)
CREATE POLICY "Allow analytics read access" ON analytics_departments FOR SELECT USING (true);
CREATE POLICY "Allow analytics read access" ON analytics_services FOR SELECT USING (true);
CREATE POLICY "Allow analytics read access" ON analytics_citizens FOR SELECT USING (true);
CREATE POLICY "Allow analytics read access" ON analytics_appointments FOR SELECT USING (true);
CREATE POLICY "Allow analytics read access" ON analytics_daily_metrics FOR SELECT USING (true);
CREATE POLICY "Allow analytics read access" ON analytics_hourly_metrics FOR SELECT USING (true);
CREATE POLICY "Allow analytics read access" ON analytics_weekly_trends FOR SELECT USING (true);

-- Insert Sample Departments Data
INSERT INTO analytics_departments (department_code, department_name, department_name_si, department_name_ta, location, total_staff_count, daily_capacity) VALUES
('IMM', 'Immigration Services', 'ආගමන සේවා', 'குடியேற்ற சேவைகள்', 'Colombo', 15, 80),
('CR', 'Civil Registration', 'සිවිල් ලියාපදිංචි කිරීම', 'சிவில் பதிவு', 'All Districts', 25, 120),
('TAX', 'Tax Department', 'බදු දෙපාර්තමේන්තුව', 'வரித் துறை', 'Colombo', 20, 100),
('MT', 'Motor Traffic', 'මෝටර් රථ', 'மோட்டார் போக்குவரத்து', 'All Districts', 30, 150),
('HC', 'Healthcare Services', 'සෞඛ්‍ය සේවා', 'சுகாதார சேவைகள்', 'All Districts', 40, 200),
('EDU', 'Education Department', 'අධ්‍යාපන දෙපාර්තමේන්තුව', 'கல்வித் துறை', 'All Districts', 18, 90),
('SS', 'Social Services', 'සමාජ සේවා', 'சமூக சேவைகள்', 'All Districts', 22, 110),
('LR', 'Land Registry', 'ඉඩම් ලේඛන', 'நில பதிவு', 'District Offices', 12, 60),
('BR', 'Business Registration', 'ව්‍යාපාර ලියාපදිංචි කිරීම', 'வணிகப் பதிவு', 'Colombo', 10, 50),
('PS', 'Police Services', 'පොලිස් සේවා', 'காவல்துறை சேவைகள்', 'All Districts', 35, 180),
('JUD', 'Judicial Services', 'අධිකරණ සේවා', 'நீதித்துறை சேவைகள்', 'Court Houses', 8, 40),
('MUN', 'Municipal Services', 'නාගරික සේවා', 'நகராட்சி சேவைகள்', 'Local Councils', 25, 130);

-- Insert Sample Services Data
INSERT INTO analytics_services (service_code, service_name, service_name_si, service_name_ta, department_id, estimated_duration_minutes, base_fee) VALUES
('BC001', 'Birth Certificate', 'උප්පැන්න සහතිකය', 'பிறப்புச் சான்றிதழ்', (SELECT id FROM analytics_departments WHERE department_code = 'CR'), 15, 500.00),
('PP001', 'Passport Application', 'ගමන් බලපත්‍ර අයදුම්පත', 'பாஸ்போர்ட் விண்ணப்பம்', (SELECT id FROM analytics_departments WHERE department_code = 'IMM'), 30, 3500.00),
('DL001', 'Driving License', 'රිය පැදවීමේ බලපත්‍රය', 'ஓட்டுநர் உரிமம்', (SELECT id FROM analytics_departments WHERE department_code = 'MT'), 45, 2500.00),
('TAX001', 'Income Tax Filing', 'ආදායම් බදු ගොනු කිරීම', 'வருமான வரிப் பதிவு', (SELECT id FROM analytics_departments WHERE department_code = 'TAX'), 25, 0.00),
('HC001', 'Medical Certificate', 'වෛද්‍ය සහතිකය', 'மருத்துவச் சான்றிதழ்', (SELECT id FROM analytics_departments WHERE department_code = 'HC'), 20, 1000.00),
('BR001', 'Business Registration', 'ව්‍යාපාර ලියාපදිංචි කිරීම', 'வணிகப் பதிவு', (SELECT id FROM analytics_departments WHERE department_code = 'BR'), 40, 5000.00),
('LR001', 'Land Title Search', 'ඉඩම් හිමිකම් සෙවීම', 'நில உரிமைத் தேடல்', (SELECT id FROM analytics_departments WHERE department_code = 'LR'), 35, 2000.00),
('PS001', 'Police Clearance', 'පොලිස් නිදහස්කරණය', 'காவல்துறை அனுமதி', (SELECT id FROM analytics_departments WHERE department_code = 'PS'), 30, 500.00),
('EDU001', 'Certificate Verification', 'සහතික සත්‍යාපනය', 'சான்றிதழ் சரிபார்ப்பு', (SELECT id FROM analytics_departments WHERE department_code = 'EDU'), 15, 500.00),
('SS001', 'Welfare Benefits', 'සුභසාධන ප්‍රතිලාභ', 'நல்வாழ்வுப் பலன்கள்', (SELECT id FROM analytics_departments WHERE department_code = 'SS'), 25, 0.00),
('JUD001', 'Court Document Request', 'උසාවි ලේඛන ඉල්ලීම', 'நீதிமன்ற ஆவணக் கோரிக்கை', (SELECT id FROM analytics_departments WHERE department_code = 'JUD'), 20, 1000.00),
('MUN001', 'Building Permit', 'ගොඩනැගිලි අවසරපත', 'கட்டிட அனுமதி', (SELECT id FROM analytics_departments WHERE department_code = 'MUN'), 50, 10000.00);

-- Create a view for dashboard analytics
CREATE OR REPLACE VIEW analytics_dashboard_summary AS
SELECT 
  d.department_name,
  d.department_code,
  COUNT(a.id) as total_appointments,
  COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_appointments,
  COUNT(CASE WHEN a.status = 'no_show' THEN 1 END) as no_show_appointments,
  AVG(a.wait_time_minutes) as avg_wait_time,
  AVG(a.service_duration_minutes) as avg_service_time,
  ROUND(
    COUNT(CASE WHEN a.status = 'completed' THEN 1 END)::numeric / 
    NULLIF(COUNT(a.id), 0) * 100, 2
  ) as completion_rate
FROM analytics_departments d
LEFT JOIN analytics_appointments a ON d.id = a.department_id
WHERE a.appointment_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY d.id, d.department_name, d.department_code
ORDER BY total_appointments DESC;
