'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Rocket, LayoutDashboard, Users, BookOpen, Package, Shield, LogOut, Menu, X, BarChart2, DollarSign } from 'lucide-react';
import { useAuth } from '@/store/auth';
import { AuthProvider } from '@/store/auth';

const adminNav = [
  { href: '/admin', icon: <LayoutDashboard size={18} />, label: 'Overview' },
  { href: '/admin/users', icon: <Users size={18} />, label: 'All Users' },
  { href: '/admin/founders', icon: <BarChart2 size={18} />, label: 'Founders' },
  { href: '/admin/investors', icon: <BarChart2 size={18} />, label: 'Investors' },
  { href: '/admin/mentors', icon: <Users size={18} />, label: 'Mentors' },
  { href: '/admin/influencers', icon: <Users size={18} />, label: 'Influencers' },
  { href: '/admin/cohorts', icon: <BookOpen size={18} />, label: 'Cohorts' },
  { href: '/admin/plans', icon: <Package size={18} />, label: 'Plans' },
  { href: '/admin/earnings', icon: <DollarSign size={18} />, label: 'Earnings' },
];

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) router.push('/login');
  }, [user, loading, isAdmin]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-100 fixed top-0 left-0 h-full z-40 hidden lg:flex flex-col">
        <div className="flex items-center gap-2 px-4 py-5 border-b border-gray-100">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Rocket size={16} className="text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-sm text-gray-900">Nebula Admin</div>
            <div className="text-xs text-gray-400">{user?.isSuperAdmin ? 'Super Admin' : 'Admin'}</div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {adminNav.map((item) => (
            <Link key={item.href} href={item.href}
              className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}>
              {item.icon}
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100 space-y-1">
          <Link href="/dashboard" className="sidebar-link text-gray-500">
            <Shield size={18} />
            <span className="text-sm">User Dashboard</span>
          </Link>
          <button onClick={logout} className="sidebar-link w-full text-red-500 hover:bg-red-50">
            <LogOut size={18} />
            <span className="text-sm">Sign out</span>
          </button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white z-40 lg:hidden flex flex-col transition-transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100">
          <span className="font-display font-bold text-gray-900">Admin Panel</span>
          <button onClick={() => setMobileOpen(false)}><X size={18} /></button>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {adminNav.map((item) => (
            <Link key={item.href} href={item.href} className={`sidebar-link ${pathname === item.href ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
              {item.icon}<span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <div className="lg:ml-56 flex-1 flex flex-col">
        <header className="sticky top-0 bg-white border-b border-gray-100 z-20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setMobileOpen(true)}><Menu size={18} /></button>
            <h1 className="font-semibold text-gray-900">
              {adminNav.find(n => pathname === n.href || pathname.startsWith(n.href + '/'))?.label || 'Admin'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-700 font-bold text-xs">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.firstName}</span>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider><AdminLayoutInner>{children}</AdminLayoutInner></AuthProvider>;
}
