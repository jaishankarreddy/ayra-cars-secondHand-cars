export type BlogCategory = 'Buying Guide' | 'Maintenance' | 'Finance' | 'News' | 'Selling Guide';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // HTML string for detail rendering
  cover: string;
  category: BlogCategory;
  tags: string[];
  author: string;
  authorAvatar: string;
  date: string; // ISO
  readMinutes: number;
  featured?: boolean;
}

export const BLOG_CATEGORIES: BlogCategory[] = ['Buying Guide', 'Maintenance', 'Finance', 'News', 'Selling Guide'];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    slug: 'how-to-choose-used-car-bangalore-2026',
    title: 'How to Choose the Right Used Car in Bangalore: 2026 Buyer Checklist',
    excerpt: 'From 200-point inspection to RC transfer — the complete checklist every Bangalore buyer needs before paying a rupee.',
    content: `
      <p>Buying a used car in Bangalore is smart — but only if you verify what matters. At Ayra Cars every vehicle passes a 200-point inspection, yet you should still know the checklist.</p>
      <h2>1. Check service history & RC</h2><p>Ask for genuine service records, insurance history and NOC if out-of-state. A clean RC with matching engine/chassis builds trust.</p>
      <h2>2. Drive cold start</h2><p>Start the engine cold. Listen for knocks, check exhaust smoke and let the car idle for 2 minutes — cheap trick, big reveal.</p>
      <h2>3. City vs highway mileage</h2><p>Bangalore traffic wears clutches faster. Prefer cars with steady highway runs and documented mileage.</p>
      <h2>4. Price vs market</h2><p>Compare 5 similar listings on Ayra Cars. Our transparent pricing model shows fair value — if a deal looks too good, inspect twice.</p>
      <blockquote>Pro tip: Book a doorstep test drive via Ayra Cars — we bring the vehicle and the inspection report to your home.</blockquote>
      <p>Ready to browse? <a href="/cars">Explore verified used cars</a> or <a href="/sell">sell your car</a> in minutes.</p>
    `,
    cover: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&auto=format&fit=crop&q=60',
    category: 'Buying Guide',
    tags: ['used cars', 'Bangalore', 'inspection', 'budget'],
    author: 'Ayra Editorial',
    authorAvatar: 'https://i.pravatar.cc/100?img=12',
    date: '2026-04-12',
    readMinutes: 6,
    featured: true,
  },
  {
    id: '2',
    slug: 'used-car-loan-emi-guide-karnataka',
    title: 'Used Car Loan in Karnataka: EMI, Interest & CIBIL Tips That Save Lakhs',
    excerpt: 'Interest rates from 9.5% to 14%? Learn how to get the best EMI for your next pre-owned car without hurting your CIBIL.',
    content: `
      <p>Financing a second-hand car is different from a new one. Banks see more risk, but Ayra buyers get smoother approvals with the right prep.</p>
      <h2>EMI math simplified</h2><p>For a ₹6 lakh car at 11% for 5 years: EMI ≈ ₹13,029. Use our upcoming EMI calculator before you offer.</p>
      <h2>Improve approval odds</h2><ul><li>Keep CIBIL above 740</li><li>Show 6-month bank statements</li><li>Prefer salaried proofs or ITR for self-employed</li></ul>
      <p>Need help? Our <a href="/contact">support team</a> guides loan paperwork free.</p>
    `,
    cover: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=1200&auto=format&fit=crop&q=60',
    category: 'Finance',
    tags: ['loan', 'EMI', 'CIBIL', 'finance'],
    author: 'Rohan Mistry',
    authorAvatar: 'https://i.pravatar.cc/100?img=8',
    date: '2026-03-28',
    readMinutes: 5,
  },
  {
    id: '3',
    slug: 'monsoon-maintenance-used-cars-bikes',
    title: 'Monsoon Care for Used Cars & Bikes: 7 Checks Before Bangalore Rains',
    excerpt: 'Battery, brakes, wipers and underbody — a 15-minute routine that prevents ₹20k+ repairs.',
    content: `
      <p>Bangalore monsoon is brutal on second-hand vehicles. Do these 7 checks weekly:</p>
      <ol><li>Clean drains and sunroof channels</li><li>Test battery voltage >12.4V</li><li>Replace wipers every 11 months</li><li>Spray anti-rust on underbody</li></ol>
      <p>All Ayra vehicles include monsoon-ready checks. <a href="/bikes">Browse used bikes</a> that love rain.</p>
    `,
    cover: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200&auto=format&fit=crop&q=60',
    category: 'Maintenance',
    tags: ['monsoon', 'maintenance', 'tips'],
    author: 'Sneha Patil',
    authorAvatar: 'https://i.pravatar.cc/100?img=5',
    date: '2026-05-02',
    readMinutes: 4,
    featured: true,
  },
  {
    id: '4',
    slug: 'sell-car-quick-bangalore-best-price',
    title: 'Sell Your Car in Bangalore: How to Get the Best Offer in 48 Hours',
    excerpt: 'Clean photos, minor fixes and timing — 4 levers that lift your resale by 8-12%.',
    content: `
      <p>Planning to upgrade? Sell smart:</p>
      <h2>Photos that sell</h2><p>Shoot at golden hour, 8 angles, include odo and tyre tread. Ayra listings with 12+ photos sell 2.3x faster.</p>
      <h2>Fix the small stuff</h2><p>₹3k in denting + polish can add ₹25k to valuation. Never sell with a cracked windshield.</p>
      <p>Get an instant estimate on our <a href="/sell">Sell page</a>.</p>
    `,
    cover: 'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=1200&auto=format&fit=crop&q=60',
    category: 'Selling Guide',
    tags: ['sell car', 'valuation', 'Bangalore'],
    author: 'Ayra Editorial',
    authorAvatar: 'https://i.pravatar.cc/100?img=12',
    date: '2026-02-18',
    readMinutes: 5,
  },
  {
    id: '5',
    slug: 'cng-vs-petrol-used-cars-2026',
    title: 'CNG vs Petrol for Used Cars 2026: Real Cost per km in City Traffic',
    excerpt: 'Petrol at ₹102 vs CNG at ₹76 — but kits add weight and boot loss. We did the math.',
    content: `<p>CNG saves ~₹2.1/km but adds 80kg and halves boot. For Bangalore city 30km/day, payback is ~18 months. Hybrid buyers prefer petrol.</p>`,
    cover: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&auto=format&fit=crop&q=60',
    category: 'Buying Guide',
    tags: ['CNG', 'petrol', 'fuel'],
    author: 'Arjun Nair',
    authorAvatar: 'https://i.pravatar.cc/100?img=15',
    date: '2026-04-30',
    readMinutes: 4,
  },
  {
    id: '6',
    slug: 'top-5-used-suvs-under-10-lakh-karnataka',
    title: 'Top 5 Used SUVs Under ₹10 Lakh in Karnataka (Verified Picks)',
    excerpt: 'Creta, Brezza, Ecosport, XUV300 and Nexon — ranked by maintenance, mileage and resale.',
    content: `<p>We ranked 200+ Ayra inspections. Brezza wins low maintenance, Creta wins resale, Nexon wins safety.</p><p><a href="/cars">See live SUV listings</a></p>`,
    cover: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200&auto=format&fit=crop&q=60',
    category: 'News',
    tags: ['SUV', 'under 10 lakh', 'Karnataka'],
    author: 'Kavya Gowda',
    authorAvatar: 'https://i.pravatar.cc/100?img=9',
    date: '2026-05-10',
    readMinutes: 7,
  },
  {
    id: '7',
    slug: 'bike-buying-guide-royal-enfield-vs-apache',
    title: 'Royal Enfield vs Apache for Daily Commute: Used Bike Verdict',
    excerpt: 'Torque vs agility — which second-hand bike wins Hosur Road traffic?',
    content: `<p>Enfield shines on highways, Apache wins in stop-go traffic. We logged 120km in peak traffic — results inside.</p>`,
    cover: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1200&auto=format&fit=crop&q=60',
    category: 'Buying Guide',
    tags: ['bikes', 'Royal Enfield', 'Apache'],
    author: 'Imran Shaikh',
    authorAvatar: 'https://i.pravatar.cc/100?img=11',
    date: '2026-01-15',
    readMinutes: 4,
  },
  {
    id: '8',
    slug: 'ayra-200-point-inspection-explained',
    title: 'Inside Ayra 200-Point Inspection: What We Check Before Listing',
    excerpt: 'Engine, AC, accident history and 197 more points — see our buyer-trusted report.',
    content: `<p>From OBD scan to underbody rust check, we photograph every flaw. Transparency is why 500+ buyers rate us 4.8★.</p>`,
    cover: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1200&auto=format&fit=crop&q=60',
    category: 'News',
    tags: ['inspection', 'trust', 'Ayra'],
    author: 'Ayra Editorial',
    authorAvatar: 'https://i.pravatar.cc/100?img=12',
    date: '2026-05-15',
    readMinutes: 6,
  },
];
