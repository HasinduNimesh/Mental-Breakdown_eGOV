import React from 'react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { track, getExperimentVariant } from '@/lib/analytics';
import {
  DocumentTextIcon,
  UserIcon,
  TruckIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  HeartIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  MapPinIcon,
  ClockIcon,
  CalendarDaysIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  department: string;
  location: string;
  processingTime: string;
  fee: string;
  popularity: 'high' | 'medium' | 'low';
  icon: React.ElementType;
  href: string;
  isOnline: boolean;
  requirements: string[];
  nextAvailableDays: number; // for "Soonest appointment" sorting
  updatedAt: string; // ISO date string for "Recently updated"
}

const ServicesPage: React.FC = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  // Experiment: default sorting (most_popular vs nearest_office)
  type SortKey = 'relevance' | 'popularity' | 'soonest' | 'shortest' | 'recent';
  const defaultSort: SortKey = React.useMemo(() => (
    getExperimentVariant('services_default_sort', ['popularity', 'soonest'])
  ), []);
  const [sortBy, setSortBy] = React.useState<SortKey>(defaultSort);
  const [filterOnline, setFilterOnline] = React.useState(false);
  const [filterInPerson, setFilterInPerson] = React.useState(false);
  const [filterTime, setFilterTime] = React.useState<string[]>([]);
  const [filterDepartments, setFilterDepartments] = React.useState<string[]>([]);
  const [filterLocations, setFilterLocations] = React.useState<string[]>([]);

  // Sync incoming ?query from header search deep links
  React.useEffect(() => {
    const q = (router.query.query as string) || '';
    if (q) setSearchQuery(q);
  }, [router.query.query]);

  // Default sorting: Relevance if searched, otherwise Popularity
  React.useEffect(() => {
    const hasQuery = searchQuery.trim().length > 0;
  setSortBy(prev => {
      if (hasQuery && prev === 'popularity') return 'relevance';
      if (!hasQuery && prev === 'relevance') return 'popularity';
      return prev;
    });
  }, [searchQuery]);

  const categories = [
    { id: 'all', name: 'All Services', count: 24, icon: GlobeAltIcon },
    { id: 'documents', name: 'Documents & Certificates', count: 8, icon: DocumentTextIcon },
    { id: 'transport', name: 'Transport & Vehicles', count: 5, icon: TruckIcon },
    { id: 'immigration', name: 'Immigration & Travel', count: 4, icon: UserIcon },
    { id: 'business', name: 'Business & Trade', count: 3, icon: BuildingOfficeIcon },
    { id: 'education', name: 'Education & Training', count: 2, icon: AcademicCapIcon },
    { id: 'health', name: 'Health & Social', count: 2, icon: HeartIcon },
  ];

  const services: Service[] = [
    // Documents & Certificates
    {
      id: 'passport-application',
      title: 'Passport Application',
      description: 'Apply for new passport or renew existing passport with expedited processing options.',
      category: 'immigration',
  department: 'Department of Immigration & Emigration',
  location: 'Colombo',
      processingTime: '7-14 days',
      fee: 'LKR 3,500 - 9,000',
      popularity: 'high',
      icon: DocumentTextIcon,
      href: '/book?service=passport',
      isOnline: true,
      requirements: ['National ID', 'Birth Certificate', 'Photographs', 'Application Form'],
  nextAvailableDays: 2,
  updatedAt: '2025-07-30',
    },
    {
      id: 'driving-license',
      title: 'Driving License Services',
      description: 'Apply for new driving license, renewal, duplicate, or international driving permit.',
      category: 'transport',
  department: 'Department of Motor Traffic',
  location: 'Werahera',
      processingTime: '1-3 days',
      fee: 'LKR 500 - 2,500',
      popularity: 'high',
      icon: TruckIcon,
      href: '/book?service=license',
      isOnline: true,
      requirements: ['Medical Certificate', 'National ID', 'Previous License (for renewal)'],
  nextAvailableDays: 1,
  updatedAt: '2025-07-28',
    },
    {
      id: 'birth-certificate',
      title: 'Birth Certificate',
      description: 'Obtain certified copies of birth certificates for official purposes.',
      category: 'documents',
  department: 'Registrar General Department',
  location: 'Nationwide',
      processingTime: '2-5 days',
      fee: 'LKR 100 - 500',
      popularity: 'high',
      icon: DocumentTextIcon,
      href: '/book?service=birth-cert',
      isOnline: true,
      requirements: ['Application Form', 'Parent\'s ID', 'Hospital Records'],
  nextAvailableDays: 3,
  updatedAt: '2025-07-20',
    },
    {
      id: 'marriage-certificate',
      title: 'Marriage Certificate',
      description: 'Register marriage and obtain certified marriage certificates.',
      category: 'documents',
  department: 'Registrar General Department',
  location: 'Nationwide',
      processingTime: '1-3 days',
      fee: 'LKR 100 - 500',
      popularity: 'medium',
      icon: DocumentTextIcon,
      href: '/book?service=marriage-cert',
      isOnline: true,
      requirements: ['Marriage Registration', 'Both Parties\' ID', 'Witnesses\' Details'],
  nextAvailableDays: 4,
  updatedAt: '2025-07-15',
    },
    {
      id: 'police-clearance',
      title: 'Police Clearance Certificate',
      description: 'Obtain police clearance certificate for employment, visa, or immigration purposes.',
      category: 'documents',
  department: 'Sri Lanka Police',
  location: 'Colombo',
      processingTime: '7-14 days',
      fee: 'LKR 500 - 1,000',
      popularity: 'high',
      icon: ShieldCheckIcon,
      href: '/book?service=police-clearance',
      isOnline: true,
      requirements: ['National ID', 'Fingerprints', 'Purpose Declaration', 'Application Form'],
  nextAvailableDays: 5,
  updatedAt: '2025-07-22',
    },
    {
      id: 'vehicle-registration',
      title: 'Vehicle Registration',
      description: 'Register new vehicles, transfer ownership, or update registration details.',
      category: 'transport',
  department: 'Department of Motor Traffic',
  location: 'Nationwide',
      processingTime: '3-7 days',
      fee: 'LKR 1,000 - 15,000',
      popularity: 'medium',
      icon: TruckIcon,
      href: '/book?service=vehicle-reg',
      isOnline: true,
      requirements: ['Import Permit', 'Insurance', 'Revenue License', 'Technical Inspection'],
  nextAvailableDays: 6,
  updatedAt: '2025-07-10',
    },
    {
      id: 'business-registration',
      title: 'Business Registration',
      description: 'Register new business, company incorporation, or business name reservation.',
      category: 'business',
  department: 'Registrar of Companies',
  location: 'Colombo',
      processingTime: '5-10 days',
      fee: 'LKR 2,000 - 25,000',
      popularity: 'medium',
      icon: BuildingOfficeIcon,
      href: '/book?service=business-reg',
      isOnline: true,
      requirements: ['Business Plan', 'Director Details', 'Registered Address', 'Articles of Association'],
  nextAvailableDays: 7,
  updatedAt: '2025-07-26',
    },
    {
      id: 'consular-services',
      title: 'Consular Services',
      description: 'Document attestation, visa assistance, and consular support services.',
      category: 'immigration',
  department: 'Ministry of Foreign Affairs',
  location: 'Colombo',
      processingTime: '3-7 days',
      fee: 'LKR 1,500 - 5,000',
      popularity: 'medium',
      icon: GlobeAltIcon,
      href: '/book?service=consular',
      isOnline: true,
      requirements: ['Original Documents', 'Application Form', 'Purpose Declaration'],
  nextAvailableDays: 2,
  updatedAt: '2025-07-18',
    },
    {
      id: 'education-certificates',
      title: 'Education Certificates',
      description: 'Verification and certification of educational qualifications and transcripts.',
      category: 'education',
  department: 'Ministry of Education',
  location: 'Nationwide',
      processingTime: '5-10 days',
      fee: 'LKR 200 - 1,000',
      popularity: 'medium',
      icon: AcademicCapIcon,
      href: '/book?service=education-cert',
      isOnline: true,
      requirements: ['Original Certificates', 'Application Form', 'Student ID'],
  nextAvailableDays: 9,
  updatedAt: '2025-07-12',
    },
    {
      id: 'health-services',
      title: 'Health Services',
      description: 'Medical certificates, vaccination records, and health department services.',
      category: 'health',
  department: 'Ministry of Health',
  location: 'Nationwide',
      processingTime: '1-3 days',
      fee: 'LKR 100 - 2,000',
      popularity: 'low',
      icon: HeartIcon,
      href: '/book?service=health',
      isOnline: true,
      requirements: ['Medical Records', 'National ID', 'Doctor\'s Recommendation'],
  nextAvailableDays: 8,
  updatedAt: '2025-07-08',
    },
    {
      id: 'tax-services',
      title: 'Tax & Revenue Services',
      description: 'Tax registration, clearance certificates, and revenue department services.',
      category: 'business',
  department: 'Department of Inland Revenue',
  location: 'Colombo',
      processingTime: '3-7 days',
      fee: 'LKR 500 - 2,000',
      popularity: 'medium',
      icon: CurrencyDollarIcon,
      href: '/book?service=tax',
      isOnline: true,
      requirements: ['Business Registration', 'Financial Records', 'Tax ID', 'Application Form'],
  nextAvailableDays: 12,
  updatedAt: '2025-07-16',
    },
    {
      id: 'land-registration',
      title: 'Land & Property Services',
      description: 'Land registration, property transfers, and survey department services.',
      category: 'documents',
      department: 'Survey Department',
      location: 'District Offices',
      processingTime: '10-21 days',
      fee: 'LKR 2,000 - 50,000',
      popularity: 'low',
      icon: MapPinIcon,
      href: '/book?service=land',
      isOnline: false,
      requirements: ['Title Deeds', 'Survey Reports', 'Tax Clearance', 'Legal Documentation'],
      nextAvailableDays: 14,
      updatedAt: '2025-07-01',
    },
  ];

  const allDepartments = Array.from(new Set(services.map(s => s.department))).sort();
  const allLocations = Array.from(new Set(services.map(s => s.location))).sort();

  // Helper to parse min processing days
  const getMinDays = (s: Service) => {
    const m = s.processingTime.match(/(\d+)(?:\s*-\s*(\d+))?\s*day/);
    if (m) return parseInt(m[1], 10);
    if (/one\s*day|same\s*day/i.test(s.processingTime)) return 0;
    return 999; // unknown large
  };

  // Manage loading state on filter/search/sort changes
  React.useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 250);
    return () => clearTimeout(t);
  }, [searchQuery, filterOnline, filterInPerson, filterTime.join(','), filterDepartments.join(','), filterLocations.join(','), sortBy, selectedCategory]);

  const matchesTimeBucket = (days: number, bucket: string) => {
    switch (bucket) {
      case 'same': return days === 0;
      case '1-3': return days >= 1 && days <= 3;
      case '4-7': return days >= 4 && days <= 7;
      case '8-14': return days >= 8 && days <= 14;
      case '15+': return days >= 15;
      default: return true;
    }
  };

  const popularityScore = (p: Service['popularity']) => (p === 'high' ? 3 : p === 'medium' ? 2 : 1);

  const relevanceScore = (s: Service, q: string) => {
    if (!q) return 0;
    const hay = `${s.title} ${s.description} ${s.department}`.toLowerCase();
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    let score = 0;
    for (const t of terms) {
      if (hay.includes(t)) score += 1;
    }
    return score + (hay.startsWith(terms[0] || '') ? 1 : 0);
  };

  let filteredServices = services.filter(service => {
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q || (
      service.title.toLowerCase().includes(q) ||
      service.description.toLowerCase().includes(q) ||
      service.department.toLowerCase().includes(q)
    );
    // Mode filters
    const modeOk = (filterOnline || filterInPerson)
      ? ((filterOnline && service.isOnline) || (filterInPerson && !service.isOnline))
      : true;
    // Time bucket
    const dmin = getMinDays(service);
    const timeOk = filterTime.length ? filterTime.some(b => matchesTimeBucket(dmin, b)) : true;
    // Department
    const deptOk = filterDepartments.length ? filterDepartments.includes(service.department) : true;
    // Location
    const locOk = filterLocations.length ? filterLocations.includes(service.location) : true;
    return matchesCategory && matchesSearch && modeOk && timeOk && deptOk && locOk;
  });

  // Sorting
  const effectiveSort = searchQuery.trim() ? (sortBy === 'popularity' ? 'relevance' : sortBy) : sortBy;
  filteredServices = filteredServices.sort((a, b) => {
    switch (effectiveSort) {
      case 'relevance':
        return relevanceScore(b, searchQuery) - relevanceScore(a, searchQuery) || popularityScore(b.popularity) - popularityScore(a.popularity);
      case 'soonest':
        return a.nextAvailableDays - b.nextAvailableDays;
      case 'shortest':
        return getMinDays(a) - getMinDays(b);
      case 'recent':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      case 'popularity':
      default:
        return popularityScore(b.popularity) - popularityScore(a.popularity);
    }
  });

  const popularServices = services.filter(s => s.popularity === 'high').slice(0, 4);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white">
        {/* Background pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black/10" />
          {/* Government-style pattern */}
          <svg className="absolute right-0 top-0 h-full w-1/2 opacity-10" viewBox="0 0 400 400" aria-hidden="true">
            <defs>
              <pattern id="services-govt-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M20 0L30 10L20 20L10 10Z" fill="white" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#services-govt-pattern)" />
          </svg>
        </div>

        {/* Hero Content */}
        <Container className="relative py-16 sm:py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <div className="text-blue-200 text-xs sm:text-sm uppercase tracking-wider mb-4 font-semibold">
                OUR MISSION IS <span className="text-orange-400">FOR YOU!</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6">
                Government Services
                <span className="block text-blue-200">Find & Access Public Services</span>
              </h1>
              <p className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8 max-w-xl">
                "Public service should be the birthright of every citizen"
              </p>
              <p className="text-base sm:text-lg text-blue-200 mb-6 sm:mb-8 max-w-xl">
                Browse and book appointments for over 500+ government services across all departments. 
                Fast, secure, and accessible online.
              </p>

              {/* Search Bar */}
              <div className="max-w-xl mb-6 sm:mb-8">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-200" aria-hidden />
                  <input
                    type="text"
                    placeholder="Search services, departments, or documents..."
                    className="w-full pl-12 pr-4 py-4 rounded-xl text-text-900 placeholder-text-500 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Hide booking CTA for signed-out users; avoid flicker during auth init */}
              <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                {/* Experiment: single vs dual CTA */}
                {!authLoading && user ? (
                  getExperimentVariant('services_hero_cta', ['single','dual']) === 'single' ? (
                    <Button href="/book" size="lg" variant="secondary">Book Appointment</Button>
                  ) : (
                    <>
                      <Button href="/book" size="lg" variant="secondary">Book Appointment</Button>
                      <Button href="/help" size="lg" variant="outline" className="border-white text-white hover:text-blue-900">Service Guide</Button>
                    </>
                  )
                ) : (
                  <Button href="/help" size="lg" variant="outline" className="border-white text-white hover:text-blue-900">Service Guide</Button>
                )}
              </div>
            </div>
            
            {/* Right side with decorative elements */}
            <div className="relative hidden lg:block">
              <div className="absolute top-8 right-8 w-72 h-48 rounded-lg bg-white/10 border border-white/20 backdrop-blur-sm transform rotate-6 shadow-2xl">
                <div className="p-6">
                  <div className="text-white font-semibold mb-2">Digital Services</div>
                  <div className="text-blue-200 text-sm">Quick & Efficient</div>
                </div>
              </div>
              <div className="absolute top-32 right-16 w-64 h-40 rounded-lg bg-white/5 border border-white/20 backdrop-blur-sm transform -rotate-3 shadow-xl">
                <div className="p-6">
                  <div className="text-white font-semibold mb-2">Citizen First</div>
                  <div className="text-blue-200 text-sm">Service Excellence</div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Popular Services Quick Access */}
      <div className="bg-white">
        <Container className="pt-4">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Services' }]} />
        </Container>
      </div>
      <section className="relative -mt-12 z-10">
        <Container>
          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-text-900">Most Popular Services</h2>
              <Badge tone="warning" className="flex items-center gap-1">
                <StarIcon className="w-3 h-3" />
                Trending
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {popularServices.map((service) => (
                <div key={service.id} className="group cursor-pointer">
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-bg-100 transition-colors">
                    <div className="flex-shrink-0">
                      <service.icon className="w-8 h-8 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-text-900 group-hover:text-primary-700 transition-colors truncate">
                        {service.title}
                      </div>
                      <div className="text-xs text-text-500">{service.processingTime}</div>
                    </div>
                    <ChevronRightIcon className="w-4 h-4 text-text-400 group-hover:text-primary-600 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Container>
      </section>

      {/* Filters & Sorting */}
      <section className="py-12 sm:py-16 bg-white">
        <Container>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Filter Rail */}
            <div className="lg:w-1/4">
              <div className="sticky top-6">
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <FunnelIcon className="w-5 h-5 text-text-600" />
                    <h3 className="font-semibold text-text-900">Filters</h3>
                  </div>
                  <div className="space-y-4">
                    {/* Mode */}
                    <div>
                      <div className="font-medium text-sm text-text-900 mb-2">Mode</div>
                      <div className="flex items-center gap-3 text-sm">
                        <label className="inline-flex items-center gap-2"><input type="checkbox" checked={filterOnline} onChange={(e) => { setFilterOnline(e.target.checked); track('filter_change', { kind: 'mode', online: e.target.checked }); }} /> Online</label>
                        <label className="inline-flex items-center gap-2"><input type="checkbox" checked={filterInPerson} onChange={(e) => { setFilterInPerson(e.target.checked); track('filter_change', { kind: 'mode', inperson: e.target.checked }); }} /> In-person</label>
                      </div>
                    </div>
                    {/* Processing time */}
                    <div>
                      <div className="font-medium text-sm text-text-900 mb-2">Processing time</div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {['same','1-3','4-7','8-14','15+'].map((b) => (
                          <label key={b} className="inline-flex items-center gap-2">
                            <input type="checkbox" checked={filterTime.includes(b)} onChange={(e) => { setFilterTime(prev => e.target.checked ? [...prev, b] : prev.filter(x => x !== b)); track('filter_change', { kind: 'time', bucket: b, checked: e.target.checked }); }} />
                            {b === 'same' ? 'Same-day' : b + ' days'}
                          </label>
                        ))}
                      </div>
                    </div>
                    {/* Department */}
                    <div>
                      <div className="font-medium text-sm text-text-900 mb-2">Department</div>
                      <div className="max-h-36 overflow-auto space-y-2 text-sm pr-1">
                        {allDepartments.map(dep => (
                          <label key={dep} className="flex items-center gap-2">
                            <input type="checkbox" checked={filterDepartments.includes(dep)} onChange={(e) => { setFilterDepartments(prev => e.target.checked ? [...prev, dep] : prev.filter(x => x !== dep)); track('filter_change', { kind: 'department', value: dep, checked: e.target.checked }); }} />
                            <span className="truncate" title={dep}>{dep}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    {/* Location */}
                    <div>
                      <div className="font-medium text-sm text-text-900 mb-2">Location</div>
                      <div className="max-h-36 overflow-auto space-y-2 text-sm pr-1">
                        {allLocations.map(loc => (
                          <label key={loc} className="flex items-center gap-2">
            <input type="checkbox" checked={filterLocations.includes(loc)} onChange={(e) => { setFilterLocations(prev => e.target.checked ? [...prev, loc] : prev.filter(x => x !== loc)); track('filter_change', { kind: 'location', value: loc, checked: e.target.checked }); }} />
                            <span className="truncate" title={loc}>{loc}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="pt-2">
          <Button variant="outline" size="sm" onClick={() => { setFilterOnline(false); setFilterInPerson(false); setFilterTime([]); setFilterDepartments([]); setFilterLocations([]); setSelectedCategory('all'); track('filter_change', { kind: 'clear_all' }); }}>Clear filters</Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Services Grid */}
            <div className="lg:w-3/4">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-text-900">
                    {selectedCategory === 'all' ? 'All Services' : categories.find(c => c.id === selectedCategory)?.name}
                  </h2>
                  <p className="text-text-600 mt-1">
                    {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} available
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-text-700">Sort by</label>
                  <select value={sortBy} onChange={(e) => { const v = e.target.value as SortKey; setSortBy(v); track('sort_change', { value: v }); }} className="text-sm border border-border rounded-md px-2 py-1">
                    <option value="relevance">Relevance</option>
                    <option value="popularity">Popularity</option>
                    <option value="soonest">Soonest appointment</option>
                    <option value="shortest">Shortest processing time</option>
                    <option value="recent">Recently updated</option>
                  </select>
                </div>
              </div>

              {/* Loading skeletons */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="p-6 border border-border rounded-lg bg-white animate-pulse">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-bg-200 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-bg-200 rounded w-2/3" />
                          <div className="h-3 bg-bg-200 rounded w-5/6" />
                          <div className="h-3 bg-bg-200 rounded w-1/2" />
                          <div className="h-8" />
                          <div className="flex gap-2">
                            <div className="h-8 bg-bg-200 rounded w-24" />
                            <div className="h-8 bg-bg-200 rounded w-24" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredServices.map((service) => (
                    <Card key={service.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                          <service.icon className="w-6 h-6 text-primary-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-text-900 group-hover:text-primary-700 transition-colors">
                            {service.title}
                          </h3>
                          <div className="flex gap-1">
                            {service.isOnline && (
                              <Badge tone="success" className="text-xs">Online</Badge>
                            )}
                            {service.popularity === 'high' && (
                              <Badge tone="warning" className="text-xs">Popular</Badge>
                            )}
                          </div>
                        </div>

                        <p className="text-sm text-text-600 mb-4 line-clamp-2">
                          {service.description}
                        </p>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-4 text-xs text-text-500">
                            <div className="flex items-center gap-1">
                              <BuildingOfficeIcon className="w-4 h-4" />
                              <span className="truncate" title={service.department}>{service.department}</span>
                            </div>
                            <span className="text-text-300">•</span>
                            <div className="flex items-center gap-1">
                              <MapPinIcon className="w-4 h-4" />
                              <span>{service.location}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-text-500">
                            <div className="flex items-center gap-1">
                              <ClockIcon className="w-4 h-4" />
                              <span>{service.processingTime}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <CurrencyDollarIcon className="w-4 h-4" />
                              <span>{service.fee}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Button href={service.href} size="sm" className="flex items-center gap-2" onClick={() => track('service_book_click', { serviceId: service.id })}>
                            <CalendarDaysIcon className="w-4 h-4" />
                            Book
                          </Button>
                          <Button href={`/service/${service.id}`} variant="outline" size="sm" onClick={() => track('service_view_details', { serviceId: service.id })}>View details</Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                  ))}
                </div>
              )}

              {filteredServices.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-bg-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MagnifyingGlassIcon className="w-8 h-8 text-text-400" />
                  </div>
                  <h3 className="text-lg font-medium text-text-900 mb-2">No results? Try these popular services</h3>
                  <p className="text-text-600 mb-6">Try clearing filters, or pick one below:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    {popularServices.map(s => (
                      <a key={s.id} href={s.href} className="p-4 border border-border rounded-md text-left hover:bg-bg-100">
                        <div className="font-medium text-text-900">{s.title}</div>
                        <div className="text-xs text-text-600">{s.processingTime}</div>
                      </a>
                    ))}
                  </div>
                  <div className="mt-6">
                    <Button variant="outline" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setFilterOnline(false); setFilterInPerson(false); setFilterTime([]); setFilterDepartments([]); setFilterLocations([]); }}>
                      Clear all filters
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* Service Guide CTA */}
      <section className="py-12 sm:py-16 bg-bg-100">
        <Container>
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-900 mb-4">Need Help Choosing a Service?</h2>
            <p className="text-lg text-text-600 mb-8 max-w-2xl mx-auto">
              Our comprehensive service guide helps you understand requirements, procedures, and timelines 
              for all government services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button href="/help" size="lg">Service Guide</Button>
              <Button href="/contact" variant="outline" size="lg">Contact Support</Button>
            </div>
          </div>
        </Container>
      </section>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};

export default ServicesPage;
