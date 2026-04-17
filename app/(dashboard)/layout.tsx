'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Rocket, LayoutDashboard, User, BookOpen, Settings,
  Bell, LogOut, Menu, X, ChevronDown, CreditCard, Users, Link2, MessageSquare
} from 'lucide-react';
import { useAuth } from '@/store/auth';
import { AuthProvider } from '@/store/auth';

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading]);

  // Poll unread notification count
  useEffect(() => {
    if (!user) return;
    const fetchCount = () => {
      import('@/lib/api').then(({ notificationApi }) => {
        notificationApi.getUnreadCount()
          .then(r => setUnreadCount(r.data?.count || 0))
          .catch(() => {});
      });
    };
    fetchCount();
    const timer = setInterval(fetchCount, 60000); // every 60s
    return () => clearInterval(timer);
  }, [user]);

  const navItems = [
    { href: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { href: '/profile', icon: <User size={18} />, label: 'My Profile' },
    { href: '/cohorts', icon: <BookOpen size={18} />, label: 'Cohorts' },
    { href: '/connections', icon: <Link2 size={18} />, label: 'Connections' },
    { href: '/chat', icon: <MessageSquare size={18} />, label: 'Messages' },
    { href: '/notifications', icon: <Bell size={18} />, label: 'Notifications' },
    { href: '/settings', icon: <Settings size={18} />, label: 'Settings' },
  ];

  if (user?.roles?.includes('ADMIN') || user?.roles?.includes('SUPER_ADMIN')) {
    navItems.push({ href: '/admin', icon: <Users size={18} />, label: 'Admin Panel' });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" style={{ borderWidth: '3px' }} />
          <span className="text-gray-500 text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full bg-white border-r border-gray-100 z-40 transition-all duration-300 ${sidebarOpen ? 'w-56' : 'w-16'} hidden lg:flex flex-col`}>
        <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Rocket size={16} className="text-white" />
          </div>
          {sidebarOpen && <span className="font-display font-bold text-gray-900">Nebula</span>}
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${pathname === item.href || pathname.startsWith(item.href + '/') ? 'active' : ''}`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <button
            onClick={logout}
            className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} className="flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">Sign out</span>}
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="sidebar-link w-full mt-1"
          >
            <ChevronDown size={18} className={`flex-shrink-0 transition-transform ${sidebarOpen ? 'rotate-90' : '-rotate-90'}`} />
            {sidebarOpen && <span className="text-sm text-gray-400">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setMobileSidebarOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 z-40 transition-transform duration-300 lg:hidden ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Rocket size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-gray-900">Nebula</span>
          </div>
          <button onClick={() => setMobileSidebarOpen(false)}><X size={18} /></button>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={`sidebar-link ${pathname === item.href ? 'active' : ''}`} onClick={() => setMobileSidebarOpen(false)}>
              {item.icon}
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <button onClick={logout} className="sidebar-link w-full text-red-500 hover:bg-red-50">
            <LogOut size={18} />
            <span className="text-sm">Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? 'lg:ml-56' : 'lg:ml-16'}`}>
        {/* Top bar */}
        <header className="sticky top-0 bg-white border-b border-gray-100 z-20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setMobileSidebarOpen(true)}>
              <Menu size={18} />
            </button>
            <div>
              <h1 className="font-semibold text-gray-900 text-base leading-none">
                {navItems.find(n => pathname.startsWith(n.href))?.label || 'Dashboard'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a href="/notifications" className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold leading-none">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </span>
              )}
            </a>
            <div className="flex items-center gap-2 pl-3 border-l border-gray-100">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-700 font-bold text-xs">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-semibold text-gray-900">{user?.firstName} {user?.lastName}</div>
                <div className="text-xs text-gray-400 capitalize">{user?.userType?.toLowerCase()}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </AuthProvider>
  );
}
