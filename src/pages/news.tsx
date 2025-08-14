import React from 'react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { Layout } from '@/components/layout/Layout';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import {
  NewspaperIcon,
  MegaphoneIcon,
  InformationCircleIcon,
  ShieldExclamationIcon,
  CalendarDaysIcon,
  ClockIcon,
  BuildingOfficeIcon,
  TagIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  category: 'Announcement' | 'Advisory' | 'Policy' | 'Event';
  department: string;
  publishedAt: string; // ISO date
  readTime: string; // e.g., '3 min read'
  href: string;
}

const allNews: NewsItem[] = [
  {
    id: 'curfew-lifted-2025-08-10',
    title: 'Temporary Traffic Diversions for Independence Day Rehearsals',
    excerpt:
      'Colombo Metro Police announces planned traffic diversions on select routes for rehearsal activities ahead of National Day events. Public advised to use alternative routes.',
    category: 'Announcement',
    department: 'Sri Lanka Police',
    publishedAt: '2025-08-10T06:00:00+05:30',
    readTime: '2 min read',
    href: '/news/traffic-diversions-independence-day',
  },
  {
    id: 'passport-backlog-2025-08-01',
    title: 'Extended Service Hours at Immigration for Passport Applications',
    excerpt:
      'To address increased demand, the Department of Immigration & Emigration will operate extended service hours during weekdays and selected Saturdays.',
    category: 'Advisory',
    department: 'Department of Immigration & Emigration',
    publishedAt: '2025-08-01T09:00:00+05:30',
    readTime: '3 min read',
    href: '/news/extended-immigration-hours',
  },
  {
    id: 'fuel-policy-2025-07-22',
    title: 'Revised Fuel Subsidy Policy for Low-Income Households',
    excerpt:
      'The Ministry of Finance announces policy changes to targeted fuel subsidies with digitized eligibility verification through the citizen portal.',
    category: 'Policy',
    department: 'Ministry of Finance',
    publishedAt: '2025-07-22T12:00:00+05:30',
    readTime: '4 min read',
    href: '/news/revised-fuel-subsidy-policy',
  },
  {
    id: 'egov-day-2025-09-05',
    title: 'National e-Government Services Day — Public Awareness Event',
    excerpt:
      'Join us for workshops and demonstrations on accessing government services online securely, including digital identity and document verification.',
    category: 'Event',
    department: 'Ministry of Technology',
    publishedAt: '2025-09-05T10:00:00+05:30',
    readTime: '2 min read',
    href: '/news/national-egov-day',
  },
  {
    id: 'health-advisory-heat-2025-08-12',
    title: 'Public Health Advisory: Heat Safety Measures',
    excerpt:
      'With rising temperatures, the Ministry of Health recommends staying hydrated, avoiding peak sunlight hours, and checking on vulnerable individuals.',
    category: 'Advisory',
    department: 'Ministry of Health',
    publishedAt: '2025-08-12T08:30:00+05:30',
    readTime: '2 min read',
    href: '/news/heat-safety-measures',
  },
];

const categories = [
  { id: 'all', name: 'All', icon: NewspaperIcon },
  { id: 'Announcement', name: 'Announcements', icon: MegaphoneIcon },
  { id: 'Advisory', name: 'Advisories', icon: InformationCircleIcon },
  { id: 'Policy', name: 'Policies', icon: ShieldExclamationIcon },
  { id: 'Event', name: 'Events', icon: CalendarDaysIcon },
] as const;

type CategoryId = typeof categories[number]['id'];

const NewsPage: React.FC = () => {
  const { t } = useTranslation('common');
  const [selectedCategory, setSelectedCategory] = React.useState<CategoryId>('all');
  const [searchQuery, setSearchQuery] = React.useState('');

  const filtered = allNews.filter((n) => {
    const catOk = selectedCategory === 'all' || n.category === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    const queryOk = !q ||
      n.title.toLowerCase().includes(q) ||
      n.excerpt.toLowerCase().includes(q) ||
      n.department.toLowerCase().includes(q);
    return catOk && queryOk;
  });

  const featured = allNews[0];

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white">
        {/* Background pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black/10" />
          {/* Government-style pattern */}
          <svg className="absolute right-0 top-0 h-full w-1/2 opacity-10" viewBox="0 0 400 400" aria-hidden="true">
            <defs>
              <pattern id="news-govt-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M20 0L30 10L20 20L10 10Z" fill="white" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#news-govt-pattern)" />
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
                Government News & Notices
              </h1>
              <p className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8 max-w-xl">
                "Public service should be the birthright of every citizen"
              </p>
              <p className="text-base sm:text-lg text-blue-200 mb-6 sm:mb-8 max-w-xl">
                Official announcements, advisories, policy updates, and events from government departments.
              </p>

              {/* Search */}
              <div className="max-w-xl mb-6 sm:mb-8">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-200" />
                  <input
                    type="text"
                    placeholder="Search news, departments, or topics..."
                    className="w-full pl-12 pr-4 py-4 rounded-xl text-text-900 placeholder-text-500 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                <Button size="lg" variant="secondary">Latest Updates</Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:text-blue-900">Subscribe to News</Button>
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

      {/* Featured */}
      <section className="relative -mt-10 z-10">
        <Container>
          <Card className="p-4 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="hidden sm:flex w-14 h-14 rounded-lg bg-gradient-to-br from-primary-600 to-primary-500 items-center justify-center text-white">
                <NewspaperIcon className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge tone="brand">Featured</Badge>
                  <Badge tone="info" className="flex items-center gap-1">
                    <TagIcon className="w-3.5 h-3.5" />
                    {featured.category}
                  </Badge>
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-text-900 mb-1">{featured.title}</h2>
                <p className="text-text-600 text-sm sm:text-base mb-3">{featured.excerpt}</p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-text-500">
                  <span className="inline-flex items-center gap-1">
                    <BuildingOfficeIcon className="w-4 h-4" /> {featured.department}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" /> {new Date(featured.publishedAt).toLocaleDateString()}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CalendarDaysIcon className="w-4 h-4" /> {featured.readTime}
                  </span>
                </div>
                <div className="mt-4">
                  <Button href={featured.href} size="sm" trailingIcon={<ChevronRightIcon className="w-4 h-4" />}>Read more</Button>
                </div>
              </div>
            </div>
          </Card>
        </Container>
      </section>

      {/* List & Filters */}
      <section className="py-12 sm:py-16 bg-white">
        <Container>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="lg:w-1/4">
              <div className="sticky top-6 space-y-6">
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FunnelIcon className="w-5 h-5 text-text-600" />
                    <h3 className="font-semibold text-text-900">Filter by category</h3>
                  </div>
                  <div className="space-y-2">
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedCategory(c.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                          selectedCategory === c.id ? 'bg-primary-100 text-primary-700' : 'hover:bg-bg-100 text-text-700'
                        }`}
                        aria-pressed={selectedCategory === c.id}
                      >
                        <span className="flex items-center gap-3">
                          <c.icon className="w-5 h-5" />
                          <span className="font-medium text-sm">{c.name}</span>
                        </span>
                        <Badge tone="neutral" className="text-xs">
                          {c.id === 'all' ? allNews.length : allNews.filter((n) => n.category === c.id).length}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold text-text-900 mb-2">Government notice</h3>
                  <p className="text-sm text-text-600">
                    Only official statements from verified government departments are published here. Beware of misinformation shared on social media.
                  </p>
                </Card>
              </div>
            </aside>

            {/* News list */}
            <main className="lg:w-3/4">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-text-900">Latest updates</h2>
                  <p className="text-text-600 mt-1">{filtered.length} item{filtered.length !== 1 ? 's' : ''}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filtered.map((n) => (
                  <Card key={n.id} className="p-5 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col h-full">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <Badge tone="info">{n.category}</Badge>
                          <span className="text-xs text-text-500 inline-flex items-center gap-1">
                            <ClockIcon className="w-4 h-4" /> {new Date(n.publishedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <Badge tone="neutral" className="text-xs">{n.readTime}</Badge>
                      </div>

                      <h3 className="font-semibold text-text-900 text-base sm:text-lg mb-1 line-clamp-2">{n.title}</h3>
                      <p className="text-sm text-text-600 line-clamp-3 mb-3">{n.excerpt}</p>

                      <div className="mt-auto flex items-center justify-between pt-2">
                        <span className="text-xs text-text-500 inline-flex items-center gap-1">
                          <BuildingOfficeIcon className="w-4 h-4" /> {n.department}
                        </span>
                        <Button href={n.href} variant="ghost" size="sm" trailingIcon={<ChevronRightIcon className="w-4 h-4" />}>Read</Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-bg-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <NewspaperIcon className="w-8 h-8 text-text-400" />
                  </div>
                  <h3 className="text-lg font-medium text-text-900 mb-2">No news found</h3>
                  <p className="text-text-600 mb-4">Try adjusting your search or filters.</p>
                  <Button variant="outline" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>Clear filters</Button>
                </div>
              )}
            </main>
          </div>
        </Container>
      </section>

      {/* Subscribe CTA */}
      <section className="py-12 sm:py-16 bg-bg-100">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-900 mb-3">Stay informed</h2>
            <p className="text-text-600 mb-6">Subscribe to receive official updates and advisories from government departments.</p>
            <div className="max-w-xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input type="email" placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary-600" />
                <Button>Subscribe</Button>
              </div>
              <p className="text-xs text-text-500 mt-2">We respect your privacy. Unsubscribe anytime.</p>
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

export default NewsPage;
