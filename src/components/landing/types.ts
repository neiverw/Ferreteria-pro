export type BillingCycle = 'monthly' | 'annual';

export interface PlanFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

export interface PricingPlan {
  id: 'basico' | 'pro' | 'empresarial';
  name: string;
  badge?: string;
  tagline: string;
  priceMonthly: number;
  priceAnnual: number;
  popular?: boolean;
  features: PlanFeature[];
  ctaText: string;
  ctaVariant: 'default' | 'outline';
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  iconName: 'Package' | 'FileText' | 'Users' | 'BarChart3' | 'ShieldCheck' | 'Zap' | 'Boxes' | 'Cloud';
  badge?: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  storeName: string;
  location: string;
  quote: string;
  rating: number;
  avatarUrl?: string;
  initials: string;
  growthMetric: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export type AuthModalMode = 'login' | 'register';

export interface AuthModalState {
  isOpen: boolean;
  mode: AuthModalMode;
  selectedPlan?: 'basico' | 'pro' | 'empresarial';
}
