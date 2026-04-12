'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { AuthProvider } from '@/store/auth';
import { ArrowRight, Star, Zap, Users, TrendingUp, Award } from 'lucide-react';

function HomePageInner() {
  const [rocketLaunched, setRocketLaunched] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setRocketLaunched(true), 300);
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => { clearTimeout(timer); window.removeEventListener('scroll', handleScroll); };
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-white">
        {/* Background stars */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="star absolute rounded-full bg-blue-400"
              style={{
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${Math.random() * 1.5 + 1}s`,
                opacity: 0.2,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-6 lg:px-16 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left content */}
            <div className={`transition-all duration-700 ${rocketLaunched ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-6">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-sm text-blue-700 font-medium">Applications Open 2025</span>
              </div>

              <h1 className="font-display text-5xl lg:text-7xl font-bold text-gray-900 leading-tight mb-4">
                Kickstart your
                <br />
                <span className="text-primary-600">company</span>
              </h1>

              <p className="text-blue-600 italic text-xl font-medium mb-6">
                ~ And launch within minutes
              </p>

              <p className="text-gray-500 text-lg mb-8 max-w-md leading-relaxed">
                Join the ecosystem of founders, investors, mentors and influencers 
                building the next generation of world-changing startups.
              </p>

              <div className="flex flex-wrap gap-4 mb-12">
                <Link
                  href="/register"
                  className="btn-cta px-8 py-3.5 rounded-xl text-base flex items-center gap-2"
                >
                  Get started <ArrowRight size={18} />
                </Link>
                <Link
                  href="/about"
                  className="px-8 py-3.5 rounded-xl text-base border-2 border-gray-200 text-gray-700 font-semibold hover:border-blue-300 hover:text-blue-600 transition-all"
                >
                  Learn more
                </Link>
              </div>

              {/* Stats */}
              <div className="flex gap-8">
                {[
                  { value: '500+', label: 'Founders' },
                  { value: '$2M+', label: 'Raised' },
                  { value: '50+', label: 'Mentors' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="font-display text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Rocket + Info cards */}
            <div className="relative flex justify-center items-center">
              {/* Info cards (right side) */}
              <div className="absolute right-0 top-0 flex flex-col gap-6 z-10">
                {[
                  {
                    title: 'Who we are',
                    desc: 'A platform to manage contracts, set up your cap table and keep your company compliant.',
                  },
                  {
                    title: 'What we do',
                    desc: 'Nebula exists to help bring creative projects to life. A home for founders, investors, mentors, and more.',
                  },
                  {
                    title: 'What you get',
                    desc: "We'll create the legal documents, file the paperwork, and get your business running within days.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className={`bg-white border border-gray-100 rounded-xl p-4 w-56 shadow-sm transition-all duration-700 ${rocketLaunched ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
                    style={{ transitionDelay: '0.4s' }}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-sm text-gray-900">{item.title}</h3>
                      <div className="grid grid-cols-2 gap-0.5 opacity-30">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="w-1 h-1 bg-gray-400 rounded-full" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              {/* Rocket SVG */}
              <div
                className={`relative transition-all duration-1000 ${rocketLaunched ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}
                style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
              >
                <RocketSVG />
              </div>
            </div>
          </div>

          {/* Scroll nav */}
          <div className="absolute bottom-8 left-6 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center">
                <span className="text-xs">↑</span>
              </div>
              Kickstart your company
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
              <div className="w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center">
                <span className="text-xs text-blue-500">↓</span>
              </div>
              What we offer
            </div>
          </div>
        </div>
      </section>

      {/* WHAT WE OFFER */}
      <section id="what-we-offer" className="py-24 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Built for every <span className="text-primary-600">stakeholder</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Whether you're building, investing, guiding, or amplifying — Nebula has a place for you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Zap className="w-6 h-6" />,
                role: 'Founders',
                color: 'bg-blue-50 text-blue-600',
                desc: 'Access cohorts, mentors, funding, and resources to scale your startup from idea to launch.',
                features: ['Cohort programs', 'Mentor matching', 'Investor access'],
              },
              {
                icon: <TrendingUp className="w-6 h-6" />,
                role: 'Investors',
                color: 'bg-orange-50 text-orange-600',
                desc: 'Discover high-potential startups, manage your portfolio, and connect with top founders.',
                features: ['Deal flow', 'Due diligence', 'Portfolio tracking'],
              },
              {
                icon: <Award className="w-6 h-6" />,
                role: 'Mentors',
                color: 'bg-green-50 text-green-600',
                desc: 'Share your expertise, mentor cohorts, and earn while making a real difference.',
                features: ['Cohort mentorship', 'Flexible schedule', 'Impact tracking'],
              },
              {
                icon: <Users className="w-6 h-6" />,
                role: 'Influencers',
                color: 'bg-purple-50 text-purple-600',
                desc: 'Partner with innovative startups, grow your brand, and earn through collaborations.',
                features: ['Brand deals', 'Startup access', 'Content tools'],
              },
            ].map((item) => (
              <div
                key={item.role}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-4`}>
                  {item.icon}
                </div>
                <h3 className="font-display font-bold text-xl text-gray-900 mb-2">{item.role}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{item.desc}</p>
                <ul className="space-y-1">
                  {item.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Launch in <span className="text-accent-500">3 steps</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-0.5 bg-blue-100" />
            {[
              { step: '01', title: 'Create Account', desc: 'Sign up with your role and complete your profile to join the Nebula ecosystem.' },
              { step: '02', title: 'Choose Your Plan', desc: 'Select a plan that fits your goals. Skip payment for now and upgrade anytime.' },
              { step: '03', title: 'Join & Launch', desc: 'Access cohorts, connect with mentors, and start building your success story.' },
            ].map((item) => (
              <div key={item.step} className="text-center relative">
                <div className="w-20 h-20 rounded-2xl bg-blue-600 text-white font-display font-bold text-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
                  {item.step}
                </div>
                <h3 className="font-display font-bold text-xl text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-white"
              style={{
                width: `${(i + 1) * 100}px`,
                height: `${(i + 1) * 100}px`,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="text-6xl mb-6">🚀</div>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-white mb-4">
            Ready for launch?
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-md mx-auto">
            Join thousands of founders who've already started their journey with Nebula.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-blue-600 font-bold px-8 py-4 rounded-xl text-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            Get started free <ArrowRight size={20} />
          </Link>
          <p className="text-blue-200 text-sm mt-4">No credit card required · Free to join</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default function HomePage() {
  return (
    <AuthProvider>
      <HomePageInner />
    </AuthProvider>
  );
}

function RocketSVG() {
  return (
    <div className="relative w-80 h-96 animate-float">
      <svg viewBox="0 0 300 420" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Rocket body */}
        <ellipse cx="150" cy="160" rx="55" ry="120" fill="#F1F5F9" />
        {/* Rocket tip */}
        <path d="M150 10 C150 10 110 60 110 100 L190 100 C190 60 150 10 150 10Z" fill="white" stroke="#E2E8F0" strokeWidth="1" />
        {/* Windows */}
        <circle cx="150" cy="150" r="22" fill="white" stroke="#E2E8F0" strokeWidth="2" />
        <circle cx="150" cy="150" r="16" fill="#DBEAFE" />
        {/* Lightning bolt */}
        <path d="M155 138 L143 152 L152 152 L145 166 L162 148 L151 148 Z" fill="#2563EB" />
        {/* Wings */}
        <path d="M110 200 L80 240 L110 240 Z" fill="#E2E8F0" />
        <path d="M190 200 L220 240 L190 240 Z" fill="#E2E8F0" />
        {/* Rocket bottom */}
        <rect x="110" y="250" width="80" height="20" rx="4" fill="#CBD5E1" />
        {/* Exhaust nozzle */}
        <ellipse cx="150" cy="270" rx="30" ry="8" fill="#94A3B8" />

        {/* Flame - animated */}
        <g className="animate-flame" style={{ transformOrigin: '150px 280px' }}>
          {/* Main flame - blue/purple */}
          <ellipse cx="150" cy="310" rx="40" ry="50" fill="#2563EB" opacity="0.9" />
          {/* Inner flame - lighter blue */}
          <ellipse cx="150" cy="315" rx="25" ry="35" fill="#60A5FA" opacity="0.8" />
          {/* Core flame - white */}
          <ellipse cx="150" cy="318" rx="12" ry="20" fill="#BFDBFE" opacity="0.9" />
        </g>

        {/* Cloud puffs at bottom */}
        <g opacity="0.6">
          <ellipse cx="100" cy="380" rx="45" ry="28" fill="#2563EB" />
          <ellipse cx="155" cy="390" rx="55" ry="32" fill="#1D4ED8" />
          <ellipse cx="210" cy="380" rx="45" ry="28" fill="#2563EB" />
          <ellipse cx="80" cy="395" rx="35" ry="20" fill="#3B82F6" opacity="0.7" />
          <ellipse cx="220" cy="395" rx="35" ry="20" fill="#3B82F6" opacity="0.7" />
        </g>

        {/* Stars around rocket */}
        <circle cx="50" cy="80" r="4" fill="#2563EB" opacity="0.6" />
        <circle cx="250" cy="120" r="3" fill="#2563EB" opacity="0.4" />
        <circle cx="60" cy="180" r="2" fill="#F97316" opacity="0.5" />
        <circle cx="260" cy="70" r="5" fill="#2563EB" opacity="0.3" />
        <circle cx="30" cy="250" r="3" fill="#F97316" opacity="0.4" />
      </svg>
    </div>
  );
}
