interface NavigationItem {
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

export const FOOTER_NAV_LEFT: NavigationItem[] = [
  { label: 'About Us', href: '/about' },
  { label: 'Organization Chart', href: '/organization' },
  { label: 'Service Directory', href: '/citizen' },
  { label: 'News & Events', href: '/news' },
  { label: 'Publications', href: '/publications' },
  { label: 'Contact Us', href: '/contact' },
];

export const FOOTER_NAV_RIGHT: NavigationItem[] = [
  { label: 'Press Releases', href: '/press' },
  { label: 'Photo Gallery', href: '/gallery' },
  { label: 'Video Gallery', href: '/videos' },
  { label: 'Downloads', href: '/downloads' },
  { label: 'Special Notices', href: '/notices' },
  { label: 'Feedback', href: '/feedback' },
];
