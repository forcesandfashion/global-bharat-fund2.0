import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { Check, Zap, TrendingUp, Award, Star } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: '$99',
    period: '/year',
    description: 'Perfect for solo founders building their first product',
    features: [
      'Priority access to startup resources',
      'Curated opportunities for early founders',
      '1 cohort program access',
      'Community forum & networking',
      'Basic mentor Q&A sessions',
    ],
    cta: 'Get Started',
    ctaStyle: 'border-2 border-gray-200 text-gray-800 hover:border-blue-400 hover:text-blue-600',
    icon: <Zap size={24} className="text-blue-600" />,
    highlight: false,
  },
  {
    name: 'Growth',
    price: '$399',
    period: '/year',
    description: 'Comprehensive support for scaling teams',
    features: [
      'Comprehensive access for teams',
      'Guidance through Series A',
      'Unlimited cohort access',
      'Priority mentor matching',
      'Investor introductions',
      'Monthly 1:1 mentor session',
    ],
    cta: 'Get Started',
    ctaStyle: 'btn-primary',
    icon: <TrendingUp size={24} className="text-white" />,
    highlight: true,
  },
  {
    name: 'Pro',
    price: '$699',
    period: '/year',
    description: 'Tailored for high-growth professionals',
    features: [
      'Tailored professional offerings',
      'High-potential workshops',
      'Dedicated mentor',
      '1:1 investor access',
      'PR & media exposure',
      'Priority cohort placement',
    ],
    cta: 'Get Started',
    ctaStyle: 'border-2 border-gray-200 text-gray-800 hover:border-blue-400 hover:text-blue-600',
    icon: <Award size={24} className="text-orange-600" />,
    highlight: false,
  },
  {
    name: 'Enterprise',
    price: '$999',
    period: '/year',
    description: 'Designed for angel investors & VCs',
    features: [
      'Designed for angel investors',
      'Direct VC network access',
      'High-potential workshops',
      'Deal flow priority',
      'White-glove onboarding',
      'Custom cohort creation',
      'Dedicated account manager',
    ],
    cta: 'Get Started',
    ctaStyle: 'btn-cta',
    icon: <Star size={24} className="text-orange-600" />,
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-32 pb-16 bg-gradient-to-b from-blue-50 to-white text-center">
        <div className="container mx-auto px-6">
          <h1 className="font-display text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            Simple, transparent <span className="text-blue-600">pricing</span>
          </h1>
          <p className="text-gray-500 text-xl max-w-xl mx-auto">
            Choose the plan that fits your ambition. Upgrade or downgrade anytime.
          </p>
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 rounded-full px-4 py-1.5 mt-4 text-sm font-medium">
            <Check size={14} /> Annual billing — save up to 20%
          </div>
        </div>
      </section>

      <section className="py-12 pb-24">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border-2 p-7 flex flex-col relative ${
                  plan.highlight ? 'border-blue-500 shadow-xl shadow-blue-100 scale-105' : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                } transition-all bg-white`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}

                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${plan.highlight ? 'bg-blue-600' : 'bg-gray-100'}`}>
                  {plan.icon}
                </div>

                <h3 className="font-display font-bold text-xl text-gray-900 mb-1">{plan.name}</h3>
                <div className="mb-2">
                  <span className="font-display text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500 text-sm">{plan.period}</span>
                </div>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">{plan.description}</p>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
                      <Check size={15} className="text-blue-500 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className={`${plan.ctaStyle} py-3 rounded-xl text-sm font-semibold text-center block transition-all`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* FAQ / note */}
          <div className="mt-16 text-center">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-3">Have questions?</h2>
            <p className="text-gray-500 mb-5">We&apos;d love to help you find the right plan for your stage.</p>
            <Link href="mailto:contact@nebulaaccelerator.com" className="btn-primary px-6 py-3 rounded-xl text-sm" >Contact us</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
