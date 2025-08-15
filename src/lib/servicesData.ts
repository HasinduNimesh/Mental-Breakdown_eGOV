import { DocumentTextIcon, TruckIcon, ShieldCheckIcon, BuildingOfficeIcon, GlobeAltIcon, AcademicCapIcon, HeartIcon, CurrencyDollarIcon, MapPinIcon } from '@heroicons/react/24/outline';

export type ServiceDetail = {
  id: string;
  title: string;
  department: string;
  purpose: string;
  eligibility: string[]; // single-sentence bullets
  requirements: { label: string; example?: string }[]; // plain microcopy with examples
  fee: string;
  time: string;
  locations: { name: string; address?: string }[];
  faqs: { q: string; a: string }[];
  bookHref: string;
  icon: any;
};

export const SERVICES_DETAILS: ServiceDetail[] = [
  {
    id: 'passport-application',
    title: 'Passport Application',
    department: 'Department of Immigration & Emigration',
    purpose: 'Get a Sri Lankan passport for travel or renew an existing one.',
    eligibility: [
      'You are a Sri Lankan citizen aged 16+ for a full passport.',
      'For minors, a parent or legal guardian must apply.',
    ],
    requirements: [
      { label: 'National Identity Card (NIC)', example: 'Original + photocopy of both sides.' },
      { label: 'Birth Certificate', example: 'Certified copy issued by Registrar General.' },
      { label: 'Photographs', example: 'Two color photos, passport-size, white background.' },
      { label: 'Completed application form', example: 'Form KIM-1 available online.' },
    ],
    fee: 'LKR 3,500 – 9,000 (varies by processing speed)',
    time: '7–14 days (express options available)',
    locations: [
      { name: 'Head Office – Colombo' },
      { name: 'Regional Office – Matara' },
      { name: 'Regional Office – Kandy' },
    ],
    faqs: [
      { q: 'Can I apply online?', a: 'Yes. Start your application online and book an appointment for biometrics.' },
      { q: 'Do I need my old passport?', a: 'Yes, bring your current/expired passport if you are renewing.' },
    ],
    bookHref: '/book?service=passport',
    icon: DocumentTextIcon,
  },
  {
    id: 'driving-license',
    title: 'Driving License Services',
    department: 'Department of Motor Traffic',
    purpose: 'Apply for, renew, or replace your driving license.',
    eligibility: [
      'You are 18+ for most vehicle categories.',
      'Medically fit and passed required tests for new licenses.',
    ],
    requirements: [
      { label: 'NIC or Passport', example: 'Original + copy.' },
      { label: 'Medical certificate', example: 'Issued by an approved medical officer.' },
      { label: 'Old license (for renewal)', example: 'Bring existing license if renewing.' },
    ],
    fee: 'LKR 500 – 2,500',
    time: '1–3 days',
    locations: [
      { name: 'Werahera – Head Office' },
      { name: 'District DMT offices' },
    ],
    faqs: [
      { q: 'Can I renew online?', a: 'Yes. Upload documents and pick a slot for biometrics collection.' },
      { q: 'Is a medical required?', a: 'Yes for new and some renewal categories.' },
    ],
    bookHref: '/book?service=license',
    icon: TruckIcon,
  },
  {
    id: 'birth-certificate',
    title: 'Birth Certificate',
    department: 'Registrar General Department',
    purpose: 'Get a certified copy of a birth certificate for official use.',
    eligibility: [
      'You are the certificate holder or an authorized representative.',
    ],
    requirements: [
      { label: 'Application form', example: 'Include full name, date and place of birth.' },
      { label: 'NIC of applicant', example: 'Original + copy.' },
    ],
    fee: 'LKR 100 – 500',
    time: '2–5 days',
    locations: [
      { name: 'Any Divisional Secretariat' },
      { name: 'Registrar General counters' },
    ],
    faqs: [
      { q: 'Can I request by post?', a: 'Yes. Include return address and payment receipt.' },
    ],
    bookHref: '/book?service=birth-cert',
    icon: DocumentTextIcon,
  },
  {
    id: 'marriage-certificate',
    title: 'Marriage Certificate',
    department: 'Registrar General Department',
    purpose: 'Get a certified copy of a marriage certificate.',
    eligibility: [ 'One of the spouses or an authorized person may apply.' ],
    requirements: [
      { label: 'Application form', example: 'Include names, date and place of marriage.' },
      { label: 'NIC of applicant', example: 'Original + copy.' },
    ],
    fee: 'LKR 100 – 500',
    time: '1–3 days',
    locations: [ { name: 'Divisional Secretariat where marriage was registered' } ],
    faqs: [ { q: 'Is a witness needed?', a: 'Not for obtaining a copy.' } ],
    bookHref: '/book?service=marriage-cert',
    icon: DocumentTextIcon,
  },
  {
    id: 'police-clearance',
    title: 'Police Clearance Certificate',
    department: 'Sri Lanka Police',
    purpose: 'Prove your criminal record status for jobs, visas, or immigration.',
    eligibility: [ 'Available to Sri Lankan citizens and eligible residents.' ],
    requirements: [
      { label: 'NIC or Passport', example: 'Original + copy.' },
      { label: 'Fingerprints', example: 'Taken at police station or biometrics center.' },
      { label: 'Purpose letter', example: 'State reason: visa, work, or study.' },
    ],
    fee: 'LKR 500 – 1,000',
    time: '7–14 days',
    locations: [ { name: 'Police HQ – Colombo' }, { name: 'Designated regional stations' } ],
    faqs: [ { q: 'Can I track progress?', a: 'Yes. Use your reference number on the portal.' } ],
    bookHref: '/book?service=police-clearance',
    icon: ShieldCheckIcon,
  },
  {
    id: 'vehicle-registration',
    title: 'Vehicle Registration',
    department: 'Department of Motor Traffic',
    purpose: 'Register a new vehicle or transfer ownership.',
    eligibility: [ 'Vehicle owner or authorized agent applies.' ],
    requirements: [
      { label: 'Import permit or previous registration', example: 'If applicable for new or used vehicles.' },
      { label: 'Insurance', example: 'Valid insurance certificate.' },
      { label: 'Revenue license', example: 'Most recent license.' },
    ],
    fee: 'LKR 1,000 – 15,000',
    time: '3–7 days',
    locations: [ { name: 'DMT offices nationwide' } ],
    faqs: [ { q: 'Do I need inspection?', a: 'Yes for certain categories; you will be notified.' } ],
    bookHref: '/book?service=vehicle-reg',
    icon: TruckIcon,
  },
  {
    id: 'business-registration',
    title: 'Business Registration',
    department: 'Registrar of Companies',
    purpose: 'Register a new business or incorporate a company.',
    eligibility: [ 'Founder, director, or authorized agent applies.' ],
    requirements: [
      { label: 'Director details', example: 'Names, NIC/passport, addresses.' },
      { label: 'Registered address', example: 'Proof of address may be required.' },
      { label: 'Articles of Association', example: 'For companies under Companies Act.' },
    ],
    fee: 'LKR 2,000 – 25,000',
    time: '5–10 days',
    locations: [ { name: 'Registrar of Companies – Colombo' } ],
    faqs: [ { q: 'Name search needed?', a: 'Yes. Reserve your business name before applying.' } ],
    bookHref: '/book?service=business-reg',
    icon: BuildingOfficeIcon,
  },
  {
    id: 'consular-services',
    title: 'Consular Services',
    department: 'Ministry of Foreign Affairs',
    purpose: 'Attest documents and get consular support for overseas use.',
    eligibility: [ 'Holders of Sri Lankan documents requiring attestation.' ],
    requirements: [
      { label: 'Original documents', example: 'Bring originals and copies for attestation.' },
      { label: 'Application form', example: 'State country of use and purpose.' },
    ],
    fee: 'LKR 1,500 – 5,000',
    time: '3–7 days',
    locations: [ { name: 'Ministry of Foreign Affairs – Colombo' } ],
    faqs: [ { q: 'Apostille available?', a: 'Apostille applies for countries under the Hague Convention.' } ],
    bookHref: '/book?service=consular',
    icon: GlobeAltIcon,
  },
  {
    id: 'education-certificates',
    title: 'Education Certificates',
    department: 'Ministry of Education',
    purpose: 'Verify and certify educational qualifications and transcripts.',
    eligibility: [ 'Certificate holder or authorized person applies.' ],
    requirements: [
      { label: 'Original certificates', example: 'O/L, A/L, or university transcripts.' },
      { label: 'Student ID or NIC', example: 'To verify identity.' },
    ],
    fee: 'LKR 200 – 1,000',
    time: '5–10 days',
    locations: [ { name: 'Ministry of Education counters nationwide' } ],
    faqs: [ { q: 'Do I need to visit?', a: 'You can request online; collection may be in person.' } ],
    bookHref: '/book?service=education-cert',
    icon: AcademicCapIcon,
  },
  {
    id: 'health-services',
    title: 'Health Services',
    department: 'Ministry of Health',
    purpose: 'Get medical certificates or vaccination records for official use.',
    eligibility: [ 'Available to citizens and eligible residents.' ],
    requirements: [
      { label: 'Medical records', example: 'Clinic book or hospital discharge notes.' },
      { label: 'NIC', example: 'Original + copy.' },
    ],
    fee: 'LKR 100 – 2,000',
    time: '1–3 days',
    locations: [ { name: 'MOH offices and hospitals' } ],
    faqs: [ { q: 'Vaccination history?', a: 'Bring past vaccination card; hospital can re-issue.' } ],
    bookHref: '/book?service=health',
    icon: HeartIcon,
  },
  {
    id: 'tax-services',
    title: 'Tax & Revenue Services',
    department: 'Department of Inland Revenue',
    purpose: 'Register for tax, get tax clearance, or manage compliance.',
    eligibility: [ 'Businesses and individuals with taxable income.' ],
    requirements: [
      { label: 'Business registration', example: 'BR certificate for companies.' },
      { label: 'Financial records', example: 'Bank statements or audited accounts.' },
      { label: 'Taxpayer Identification Number (TIN)', example: 'If already registered.' },
    ],
    fee: 'LKR 500 – 2,000',
    time: '3–7 days',
    locations: [ { name: 'Inland Revenue offices – Colombo and regional' } ],
    faqs: [ { q: 'Do I need to visit?', a: 'Most services begin online; some require in-person verification.' } ],
    bookHref: '/book?service=tax',
    icon: CurrencyDollarIcon,
  },
  {
    id: 'land-registration',
    title: 'Land & Property Services',
    department: 'Survey Department',
    purpose: 'Register land, update deeds, or request surveys.',
    eligibility: [ 'Property owner or authorized representative applies.' ],
    requirements: [
      { label: 'Title deed', example: 'Original + certified copies.' },
      { label: 'Survey plan', example: 'Latest approved plan if available.' },
      { label: 'Tax clearance', example: 'From local authority if required.' },
    ],
    fee: 'LKR 2,000 – 50,000',
    time: '10–21 days',
    locations: [ { name: 'District Survey Offices' } ],
    faqs: [ { q: 'How long will it take?', a: 'Depends on property size and verification steps.' } ],
    bookHref: '/book?service=land',
    icon: MapPinIcon,
  },
];

export function getAllServiceIds() {
  return SERVICES_DETAILS.map(s => s.id);
}

export function getServiceById(id: string) {
  return SERVICES_DETAILS.find(s => s.id === id) || null;
}
