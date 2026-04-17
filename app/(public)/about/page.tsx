import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { ArrowRight, Rocket, Target, Heart, Globe, Award} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-6 lg:px-16 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-4 py-1.5 mb-6 text-sm font-medium">
            <Rocket size={14} /> About Nebula
          </div>
          <h1 className="font-display text-5xl lg:text-6xl font-bold text-gray-900 mb-5 leading-tight">
            Building the future of <br />
            <span className="text-blue-600">startup ecosystems</span>
          </h1>
          <p className="text-gray-500 text-xl max-w-2xl mx-auto leading-relaxed">
            Nebula Accelerator is a strategic innovation ecosystem designed to support startups from concept to commercialization. We provide a comprehensive framework that integrates mentorship, incubation, acceleration, and investment access to help founders build scalable, high-impact ventures.

Our platform brings together entrepreneurs, industry leaders, government partners, investors, and academic institutions to create a collaborative environment where ideas can grow, technology can advance, and businesses can thrive globally.
</p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 mt-[-8rem]">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-display text-4xl font-bold text-gray-900 mb-5">Our Mission</h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-6">
                Our mission is to empower high-growth startups by offering world-class mentorship, structured program pathways, and strategic market access. We aim to bridge early-stage innovators with industry leadership, policy frameworks, advanced technology infrastructure, and global investment networks — unlocking real, measurable progress.
              </p>
              {/* <p className="text-gray-500 text-lg leading-relaxed">
                From first idea to funded company — Nebula is with you every step of the way.
              </p> */}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <Target size={24} />, title: 'Mission-Driven', desc: 'Empowering founders from day zero', color: 'text-blue-600 bg-blue-50' },
                { icon: <Heart size={24} />, title: 'Community First', desc: 'Building genuine connections', color: 'text-red-500 bg-red-50' },
                { icon: <Globe size={24} />, title: 'Global Reach', desc: 'Founders from 30+ countries', color: 'text-green-600 bg-green-50' },
                { icon: <Award size={24} />, title: 'Excellence', desc: 'Curated mentors & investors', color: 'text-orange-600 bg-orange-50' },
              ].map((v) => (
                <div key={v.title} className="bg-white border border-gray-100 rounded-2xl p-5">
                  <div className={`w-12 h-12 rounded-xl ${v.color} flex items-center justify-center mb-3`}>
                    {v.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{v.title}</h3>
                  <p className="text-sm text-gray-500">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gray-50 mt-[-8rem]">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {[
              { value: '500+', label: 'Founders Supported' },
              { value: '$2M+', label: 'Capital Raised' },
              { value: '50+', label: 'Expert Mentors' },
              { value: '20+', label: 'Cohort Programs' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="font-display text-4xl font-bold text-blue-600 mb-1">{s.value}</div>
                <div className="text-sm text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 mt-[-8rem]">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-display text-4xl font-bold text-gray-900 mb-4">Ready to join the journey?</h2>
          <p className="text-gray-500 mb-8">Join thousands of founders building with Nebula</p>
          <Link href="/register" className="btn-cta px-8 py-4 rounded-xl text-base inline-flex items-center gap-2">
            Get started for free <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
