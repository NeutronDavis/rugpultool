/**
 * Single source of truth for package pricing. Everything is denominated in SOL.
 * Used by the pricing section and by the subscription gate, so a price change
 * only has to happen here.
 */

export type PlanFeature = { label: string; included: boolean };

export type Plan = {
  name: string;
  price: string;
  was: string;
  badge?: string;
  highlight?: boolean;
  features: PlanFeature[];
};

export const TESTER = {
  name: "Tester",
  price: "2.8",
  was: "4",
  access: "1 week access",
  tags: [
    "Market cap based strategy",
    "Basic market simulation",
    "Automatic liquidity control",
  ],
  extra: 3,
};

export const PLANS: Plan[] = [
  {
    name: "Basic",
    price: "4.9",
    was: "7",
    features: [
      { label: "Market cap based strategy", included: true },
      { label: "Automatic liquidity control", included: true },
      { label: "Basic market simulation", included: true },
      { label: "Token promotion tools", included: false },
      { label: "Custom website", included: false },
      { label: "AI generated content", included: false },
    ],
  },
  {
    name: "Advanced",
    price: "7.7",
    was: "11",
    badge: "Most popular",
    highlight: true,
    features: [
      { label: "All basic features", included: true },
      { label: "Advanced market simulation", included: true },
      { label: "Token promotion tools", included: true },
      { label: "AI generated website & domain", included: true },
      { label: "Priority support", included: true },
      { label: "Social media ad automation", included: false },
    ],
  },
  {
    name: "Premium",
    price: "9.8",
    was: "14",
    badge: "Most profitable",
    features: [
      { label: "All advanced features", included: true },
      { label: "Handcrafted professional website", included: true },
      { label: "Full marketing package", included: true },
      { label: "Social media ad automation", included: true },
      { label: "Telegram & Twitter adbots", included: true },
      { label: "24/7 priority support", included: true },
    ],
  },
];

/** Compact list for the paywall and other summaries. */
export const PLAN_PRICES: { name: string; price: string; note: string }[] = [
  { name: TESTER.name, price: TESTER.price, note: TESTER.access },
  ...PLANS.map((plan) => ({
    name: plan.name,
    price: plan.price,
    note: "lifetime access",
  })),
];
