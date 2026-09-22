export interface NavLink {
  label: string;
  path: string;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

export interface Testimonial {
  name: string;
  role: string;
  quote: string;
  rating: number;
  color: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FooterLink {
  label: string;
  path: string;
}

export const NAV_LINKS: NavLink[] = [
  { label: 'Cars', path: '/cars' },
  { label: 'Bikes', path: '/bikes' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' }
];

export const HERO_STATS: StatItem[] = [
  { value: '500+', label: 'Cars' },
  { value: '300+', label: 'Bikes' },
  { value: '25+', label: 'Brands' },
  { value: '31', label: 'Districts' }
];

export const SECTION_STATS: StatItem[] = [
  { value: '1000+', label: 'Vehicles' },
  { value: '500+', label: 'Happy Buyers' },
  { value: '30+', label: 'Brands' },
  { value: '31', label: 'Districts' }
];

export const WHY_CHOOSE_US: FeatureItem[] = [
  {
    icon: 'badgeCheck',
    title: 'Verified Listings',
    description: 'Every vehicle passes a 200-point inspection before it is listed, so you only see quality rides.'
  },
  {
    icon: 'banknote',
    title: 'Transparent Pricing',
    description: 'Fair, data-driven prices with no hidden charges. What you see is exactly what you pay.'
  },
  {
    icon: 'shieldCheck',
    title: 'Trusted Vehicles',
    description: 'Geniune RC, clean history and zero-accident checks ensure every deal is completely safe.'
  },
  {
    icon: 'messageCircle',
    title: 'Quick WhatsApp Support',
    description: 'Our experts are one message away. Get answers, video calls and test drives instantly.'
  },
  {
    icon: 'handCoins',
    title: 'Easy Offer System',
    description: 'Sell your vehicle in minutes. Get a fair offer, doorstep pickup and instant payment.'
  },
  {
    icon: 'truck',
    title: 'Doorstep Delivery',
    description: 'Choose home delivery or pick up from our experience centres across Karnataka. Additional delivery charges may apply based on your location.'
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Ravi Kumar',
    role: 'Bought Hyundai Creta · Bengaluru',
    quote: 'The 200-point inspection report gave me total confidence. Got a spotless Creta in three days with zero hassle.',
    rating: 5,
    color: '#4f46e5'
  },
  {
    name: 'Sneha Patil',
    role: 'Bought Honda City · Mysuru',
    quote: 'Transparent pricing with no negotiation drama. The team handled all the paperwork while I relaxed at home.',
    rating: 5,
    color: '#0ea5e9'
  },
  {
    name: 'Arjun Nair',
    role: 'Sold Royal Enfield · Mangaluru',
    quote: 'I sold my Classic 350 within 24 hours. Fair offer, doorstep pickup and instant payment. Could not ask for more.',
    rating: 5,
    color: '#f59e0b'
  },
  {
    name: 'Kavya Gowda',
    role: 'Bought Brezza · Hubballi',
    quote: 'WhatsApp support is genuinely quick. They sent detailed videos before I even visited the centre.',
    rating: 5,
    color: '#16a34a'
  },
  {
    name: 'Imran Shaikh',
    role: 'Bought XUV700 · Kalaburagi',
    quote: 'Cleanest used car I have ever bought. The RC transfer and transparent history feel like buying brand new.',
    rating: 4,
    color: '#7c3aed'
  },
  {
    name: 'Divya Rao',
    role: 'Bought Apache 200 · Belagavi',
    quote: 'As a first-time buyer I was nervous, but Ayra Cars made everything simple, safe and stress-free.',
    rating: 5,
    color: '#dc2626'
  }
];

export const FAQS: FaqItem[] = [
  {
    question: 'How are vehicles inspected and verified?',
    answer:
      'Every vehicle goes through a rigorous 200-point inspection covering the engine, body, tyres, brakes, electronics and service history. Certified reports are attached to each listing so you can buy with complete confidence.'
  },
  {
    question: 'Can I get a test drive before buying?',
    answer:
      'Absolutely. You can book a doorstep test drive or visit one of our experience centres. Our team also arranges video calls and detailed walkthroughs for out-of-town buyers.'
  },
  {
    question: 'What is included in the price?',
    answer:
      'The displayed price is all-inclusive with transparent pricing. It covers inspection, RTO transfer and roadworthiness. There are no hidden charges or surprise fees.'
  },
  {
    question: 'How do I sell my current car or bike?',
    answer:
      'Share a few details and get an instant fair offer. We arrange free doorstep inspection and pickup, handle the paperwork, and pay you the agreed amount quickly.'
  },
  {
    question: 'Do you deliver outside my city?',
    answer:
      'Yes, we deliver vehicles across all 31 districts of Karnataka. Select home delivery at checkout and we will manage the safe transport for you.'
  },
  {
    question: 'How do I get support after purchase?',
    answer:
      'Our support team is with you after delivery — for RC transfer, service history and any questions. Contact us in your language and we will resolve it promptly.'
  }
];

export const FOOTER_EXPLORE_LINKS: FooterLink[] = [
  { label: 'Find a Vehicle', path: '/search' },
  { label: 'Cars', path: '/cars' },
  { label: 'Bikes', path: '/bikes' },
   { label: 'Blog', path: '/blog' },
  { label: 'Popular Brands', path: '/brands' },
  { label: 'Compare Vehicles', path: '/compare' },
  { label: 'Favourites', path: '/wishlist' }
];

export const FOOTER_BUY_SELL_LINKS: FooterLink[] = [
  { label: 'Buy a Car', path: '/cars' },
  { label: 'Buy a Bike', path: '/bikes' },
  { label: 'Sell Your Vehicle', path: '/sell' },
  { label: 'Vehicle Valuation', path: '/sell' },
  { label: 'Buying Guide', path: '/about' },
  { label: 'Selling Guide', path: '/about' }
];

export const FOOTER_COMPANY_LINKS: FooterLink[] = [
  { label: 'Why Ayra Cars', path: '/about' },
  { label: 'About Us', path: '/about' },
  { label: 'FAQs', path: '/about' },
  { label: 'Contact Us', path: '/contact' },
  { label: 'Terms & Conditions', path: '/terms' },
  { label: 'Privacy Policy', path: '/privacy' }
];

export const FOOTER_LEGAL_LINKS: FooterLink[] = [
  { label: 'Privacy Policy', path: '/privacy' },
  { label: 'Terms & Conditions', path: '/terms' }
];
