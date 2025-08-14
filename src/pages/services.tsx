import React from 'react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { Layout } from '@/components/layout/Layout';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
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
  processingTime: string;
  fee: string;
  popularity: 'high' | 'medium' | 'low';
  icon: React.ElementType;
  href: string;
  isOnline: boolean;
  requirements: string[];
}

const ServicesPage: React.FC = () => {
  const { t } = useTranslation('common');
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('');

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
      processingTime: '7-14 days',
      fee: 'LKR 3,500 - 9,000',
      popularity: 'high',
      icon: DocumentTextIcon,
      href: '/book?service=passport',
      isOnline: true,
      requirements: ['National ID', 'Birth Certificate', 'Photographs', 'Application Form'],
    },
    {
      id: 'driving-license',
      title: 'Driving License Services',
      description: 'Apply for new driving license, renewal, duplicate, or international driving permit.',
      category: 'transport',
      department: 'Department of Motor Traffic',
      processingTime: '1-3 days',
      fee: 'LKR 500 - 2,500',
      popularity: 'high',
      icon: TruckIcon,
      href: '/book?service=license',
      isOnline: true,
      requirements: ['Medical Certificate', 'National ID', 'Previous License (for renewal)'],
    },
    {
      id: 'birth-certificate',
      title: 'Birth Certificate',
      description: 'Obtain certified copies of birth certificates for official purposes.',
      category: 'documents',
      department: 'Registrar General Department',
      processingTime: '2-5 days',
      fee: 'LKR 100 - 500',
      popularity: 'high',
      icon: DocumentTextIcon,
      href: '/book?service=birth-cert',
      isOnline: true,
      requirements: ['Application Form', 'Parent\'s ID', 'Hospital Records'],
    },
    {
      id: 'marriage-certificate',
      title: 'Marriage Certificate',
      description: 'Register marriage and obtain certified marriage certificates.',
      category: 'documents',
      department: 'Registrar General Department',
      processingTime: '1-3 days',
      fee: 'LKR 100 - 500',
      popularity: 'medium',
      icon: DocumentTextIcon,
      href: '/book?service=marriage-cert',
      isOnline: true,
      requirements: ['Marriage Registration', 'Both Parties\' ID', 'Witnesses\' Details'],
    },
    {
      id: 'police-clearance',
      title: 'Police Clearance Certificate',
      description: 'Obtain police clearance certificate for employment, visa, or immigration purposes.',
      category: 'documents',
      department: 'Sri Lanka Police',
      processingTime: '7-14 days',
      fee: 'LKR 500 - 1,000',
      popularity: 'high',
      icon: ShieldCheckIcon,
      href: '/book?service=police-clearance',
      isOnline: true,
      requirements: ['National ID', 'Fingerprints', 'Purpose Declaration', 'Application Form'],
    },
    {
      id: 'vehicle-registration',
      title: 'Vehicle Registration',
      description: 'Register new vehicles, transfer ownership, or update registration details.',
      category: 'transport',
      department: 'Department of Motor Traffic',
      processingTime: '3-7 days',
      fee: 'LKR 1,000 - 15,000',
      popularity: 'medium',
      icon: TruckIcon,
      href: '/book?service=vehicle-reg',
      isOnline: true,
      requirements: ['Import Permit', 'Insurance', 'Revenue License', 'Technical Inspection'],
    },
    {
      id: 'business-registration',
      title: 'Business Registration',
      description: 'Register new business, company incorporation, or business name reservation.',
      category: 'business',
      department: 'Registrar of Companies',
      processingTime: '5-10 days',
      fee: 'LKR 2,000 - 25,000',
      popularity: 'medium',
      icon: BuildingOfficeIcon,
      href: '/book?service=business-reg',
      isOnline: true,
      requirements: ['Business Plan', 'Director Details', 'Registered Address', 'Articles of Association'],
    },
    {
      id: 'consular-services',
      title: 'Consular Services',
      description: 'Document attestation, visa assistance, and consular support services.',
      category: 'immigration',
      department: 'Ministry of Foreign Affairs',
      processingTime: '3-7 days',
      fee: 'LKR 1,500 - 5,000',
      popularity: 'medium',
      icon: GlobeAltIcon,
      href: '/book?service=consular',
      isOnline: true,
      requirements: ['Original Documents', 'Application Form', 'Purpose Declaration'],
    },
    {
      id: 'education-certificates',
      title: 'Education Certificates',
      description: 'Verification and certification of educational qualifications and transcripts.',
      category: 'education',
      department: 'Ministry of Education',
      processingTime: '5-10 days',
      fee: 'LKR 200 - 1,000',
      popularity: 'medium',
      icon: AcademicCapIcon,
      href: '/book?service=education-cert',
      isOnline: true,
      requirements: ['Original Certificates', 'Application Form', 'Student ID'],
    },
    {
      id: 'health-services',
      title: 'Health Services',
      description: 'Medical certificates, vaccination records, and health department services.',
      category: 'health',
      department: 'Ministry of Health',
      processingTime: '1-3 days',
      fee: 'LKR 100 - 2,000',
      popularity: 'low',
      icon: HeartIcon,
      href: '/book?service=health',
      isOnline: true,
      requirements: ['Medical Records', 'National ID', 'Doctor\'s Recommendation'],
    },
    {
      id: 'tax-services',
      title: 'Tax & Revenue Services',
      description: 'Tax registration, clearance certificates, and revenue department services.',
      category: 'business',
      department: 'Department of Inland Revenue',
      processingTime: '3-7 days',
      fee: 'LKR 500 - 2,000',
      popularity: 'medium',
      icon: CurrencyDollarIcon,
      href: '/book?service=tax',
      isOnline: true,
      requirements: ['Business Registration', 'Financial Records', 'Tax ID', 'Application Form'],
    },
    {
      id: 'land-registration',
      title: 'Land & Property Services',
      description: 'Land registration, property transfers, and survey department services.',
      category: 'documents',
      department: 'Survey Department',
      processingTime: '10-21 days',
      fee: 'LKR 2,000 - 50,000',
      popularity: 'low',
      icon: MapPinIcon,
      href: '/book?service=land',
      isOnline: false,
      requirements: ['Title Deeds', 'Survey Reports', 'Tax Clearance', 'Legal Documentation'],
    },
  ];

  const filteredServices = services.filter(service => {
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const popularServices = services.filter(s => s.popularity === 'high').slice(0, 4);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-900 via-primary-800 to-primary-900 text-white py-16 sm:py-20">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black/10" />
        </div>

        <Container className="relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Government Services
              <span className="block text-blue-200">Find & Access Public Services</span>
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Browse and book appointments for over 500+ government services across all departments. 
              Fast, secure, and accessible online.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-200" />
                <input
                  type="text"
                  placeholder="Search services, departments, or documents..."
                  className="w-full pl-12 pr-4 py-4 rounded-xl text-text-900 placeholder-text-500 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="lg">Book Appointment</Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:text-primary-900">
                Service Guide
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Popular Services Quick Access */}
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

      {/* Service Categories & Filters */}
      <section className="py-12 sm:py-16 bg-white">
        <Container>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Categories Sidebar */}
            <div className="lg:w-1/4">
              <div className="sticky top-6">
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <FunnelIcon className="w-5 h-5 text-text-600" />
                    <h3 className="font-semibold text-text-900">Filter by Category</h3>
                  </div>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                          selectedCategory === category.id
                            ? 'bg-primary-100 text-primary-700'
                            : 'hover:bg-bg-100 text-text-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <category.icon className="w-5 h-5" />
                          <span className="font-medium text-sm">{category.name}</span>
                        </div>
                        <Badge tone="neutral" className="text-xs">{category.count}</Badge>
                      </button>
                    ))}
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
              </div>

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
                          <div className="flex items-center gap-2 text-xs text-text-500">
                            <BuildingOfficeIcon className="w-4 h-4" />
                            <span>{service.department}</span>
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

                        <div className="flex items-center justify-between">
                          <Button href={service.href} size="sm" className="flex items-center gap-2">
                            <CalendarDaysIcon className="w-4 h-4" />
                            Book Now
                          </Button>
                          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {filteredServices.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-bg-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MagnifyingGlassIcon className="w-8 h-8 text-text-400" />
                  </div>
                  <h3 className="text-lg font-medium text-text-900 mb-2">No services found</h3>
                  <p className="text-text-600 mb-4">
                    Try adjusting your search or selecting a different category.
                  </p>
                  <Button variant="outline" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
                    Clear Filters
                  </Button>
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
