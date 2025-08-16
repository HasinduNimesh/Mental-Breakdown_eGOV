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
import { fetchServices, ServiceRow } from '@/lib/servicesApi';
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
  href: string;
  isOnline: boolean;
  requirements: string[];
  nextAvailableDays: number; // for "Soonest appointment" sorting
  updatedAt: string; // ISO date string for "Recently updated"
}

type Props = { initialServices: Service[] };

const ServicesPage: React.FC<Props> = ({ initialServices }) => {
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
  const searchRef = React.useRef<HTMLInputElement>(null);

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

  const services = React.useMemo(() => initialServices, [initialServices]);
  const iconForCategory = (category: string): React.ElementType => {
    switch (category) {
      case 'documents': return DocumentTextIcon;
      case 'transport': return TruckIcon;
      case 'immigration': return UserIcon;
      case 'business': return BuildingOfficeIcon;
      case 'education': return AcademicCapIcon;
      case 'health': return HeartIcon;
      default: return DocumentTextIcon;
    }
  };

  const allDepartments = React.useMemo(() => Array.from(new Set(services.map(s => s.department))).sort(), [services]);
  const allLocations = React.useMemo(() => Array.from(new Set(services.map(s => s.location))).sort(), [services]);

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
          ref={searchRef}
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
                    <Button size="lg" variant="secondary" onClick={() => { searchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); searchRef.current?.focus(); }}>Search</Button>
                  ) : (
                    <>
                      <Button size="lg" variant="secondary" onClick={() => { searchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); searchRef.current?.focus(); }}>Search</Button>
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
                      {React.createElement(iconForCategory(service.category), { className: 'w-8 h-8 text-primary-600' })}
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
                          {React.createElement(iconForCategory(service.category), { className: 'w-6 h-6 text-primary-600' })}
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
  try {
    const rows = await fetchServices();
    const formatDays = (min: number | null, max: number | null) => {
      if (min == null && max == null) return 'Varies';
      if (min != null && max != null) return `${min}-${max} days`;
      const d = (min ?? max) as number;
      if (d === 0) return 'Same-day';
      return `${d} day${d === 1 ? '' : 's'}`;
    };

    const formatFee = (min: number | null, max: number | null) => {
      if (min == null && max == null) return 'N/A';
      if (min != null && max != null) return `LKR ${min.toLocaleString()} - ${max.toLocaleString()}`;
      const v = (min ?? max) as number;
      return `LKR ${v.toLocaleString()}`;
    };

  const initialServices: Service[] = rows.map((r) => ({
      id: r.slug,
      title: r.title,
      description: r.short_description ?? '',
      category: r.category,
      department: r.department ?? '—',
      location: r.default_location ?? 'Nationwide',
      processingTime: formatDays(r.processing_time_days_min, r.processing_time_days_max),
      fee: formatFee(r.fee_min, r.fee_max),
      popularity: r.popularity,
      href: `/book?service=${encodeURIComponent(r.slug)}`,
      isOnline: r.is_online,
      requirements: [],
      nextAvailableDays: 7,
      updatedAt: r.updated_at,
    }));

    return {
      props: {
        ...(await serverSideTranslations(locale ?? 'en', ['common'])),
        initialServices,
      },
      revalidate: 60,
    };
  } catch (e) {
    console.error('Failed to fetch services', e);
    return {
      props: {
        ...(await serverSideTranslations(locale ?? 'en', ['common'])),
        initialServices: [],
      },
      revalidate: 60,
    };
  }
};

export default ServicesPage;
