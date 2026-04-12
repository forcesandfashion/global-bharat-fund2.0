import Link from 'next/link';
import { Rocket,  Send } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-6 lg:px-16">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Rocket size={16} className="text-white" />
              </div>
              <span className="font-display font-bold text-lg">Nebula</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              The premier accelerator platform for the next generation of world-changing startups.
            </p>
            <div className="flex gap-3">
              {/* <a href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Github size={14} />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Twitter size={14} />
              </a> */}
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Send size={14} />
              </a>
            </div>
          </div>

          {[
            {
              title: 'Platform',
              links: [
                { label: 'For Founders', href: '/register?role=FOUNDER' },
                { label: 'For Investors', href: '/register?role=INVESTOR' },
                { label: 'For Mentors', href: '/register?role=MENTOR' },
                { label: 'For Influencers', href: '/register?role=INFLUENCER' },
              ],
            },
            {
              title: 'Company',
              links: [
                { label: 'About', href: '/about' },
                { label: 'Pricing', href: '/pricing' },
                { label: 'Blog', href: '/blog' },
                { label: 'Contact', href: '/#contact' },
              ],
            },
            {
              title: 'Legal',
              links: [
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
                { label: 'Cookie Policy', href: '/cookies' },
              ],
            },
          ].map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-sm text-gray-300 uppercase tracking-wider mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">© 2025 Nebula Accelerator. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="https://github.com" className="text-gray-500 hover:text-white text-sm transition-colors">Github</a>
            <a href="#" className="text-gray-500 hover:text-white text-sm transition-colors">Telegram</a>
            <a href="#" className="text-gray-500 hover:text-white text-sm transition-colors">Twitter</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
