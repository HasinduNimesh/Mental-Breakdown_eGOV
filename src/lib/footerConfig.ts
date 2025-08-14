export interface NavigationItem {
  label: string;
  href: string;
}

export const FOOTER_DETAILS = {
  orgName: 'Ministry of Education, Higher Education and Vocational Education',
  address: 'Isurupaya, Battaramulla, Sri Lanka',
  phones: ['+94 11 2 784 755', '+94 11 2 784 658'],
  email: 'info@moe.gov.lk',
  govLinkText: 'Gov.lk',
  govLinkHref: 'https://www.gov.lk',
  copyrightYear: '2024',
  copyrightOwner: 'Government of Sri Lanka',
};

export const FOOTER_COLUMNS: { title: string; items: NavigationItem[] }[] = [
  {
    title: 'About',
    items: [
      { label: 'About', href: '/about' },
      { label: 'Organization', href: '/organization' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Help',
    items: [
      { label: 'Service Guide', href: '/help' },
      { label: 'Find Offices', href: '/help#offices' },
      { label: 'FAQs', href: '/help#faq' },
    ],
  },
  {
    title: 'Resources',
    items: [
      { label: 'Services', href: '/services' },
      { label: 'News & Notices', href: '/news' },
      { label: 'Downloads', href: '/downloads' },
    ],
  },
];
