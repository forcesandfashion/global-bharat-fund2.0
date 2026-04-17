'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  Rocket, Users, BarChart2, Shield, Settings, LogOut,
  TrendingUp, Package, BookOpen, Plus, Edit, Trash2,
  Check, X, RefreshCw, Crown, AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/store/auth';
import { AuthProvider } from '@/store/auth';
import { userApi, planApi } from '@/lib/api';
import api from '@/lib/api';

// ─── Layout ──────────────────────────────────────────────────────────────────
function SuperAdminInner() {
  const { user, logout, loading, isSuperAdmin } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<'overview' | 'users' | 'admins' | 'plans'>('overview');

  useEffect(() => {
    if (!loading && (!user || !isSuperAdmin)) router.push('/login');
  }, [user, loading, isSuperAdmin]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" style={{ borderWidth: '3px' }} />
    </div>
  );

  const navItems = [
    { id: 'overview', label: 'Overview', icon: <BarChart2 size={18} /> },
    { id: 'users', label: 'All Users', icon: <Users size={18} /> },
    { id: 'admins', label: 'Admin Management', icon: <Shield size={18} /> },
    { id: 'plans', label: 'Pricing Plans', icon: <Package size={18} /> },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-900 text-white fixed top-0 left-0 h-full z-40 flex flex-col">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-gray-800">
          <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
            <Crown size={18} className="text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-sm">Super Admin</div>
            <div className="text-xs text-gray-400">Nebula Platform</div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-all ${
                activeSection === item.id
                  ? 'bg-orange-500 text-white font-medium'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}

          <div className="pt-3 border-t border-gray-800 mt-2">
            <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-all">
              <Settings size={18} />
              Admin Panel
            </Link>
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-all">
              <Rocket size={18} />
              User Dashboard
            </Link>
          </div>
        </nav>

        <div className="p-3 border-t border-gray-800">
          <div className="flex items-center gap-2 px-3 mb-3">
            <div className="w-7 h-7 rounded-full bg-orange-500/20 flex items-center justify-center">
              <span className="text-orange-400 font-bold text-xs">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
            </div>
            <div>
              <div className="text-xs font-medium text-white">{user?.firstName} {user?.lastName}</div>
              <div className="text-xs text-gray-500">Super Admin</div>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-900/20 transition-all">
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="ml-60 flex-1 p-8">
        {activeSection === 'overview' && <SuperAdminOverview />}
        {activeSection === 'users' && <SuperAdminUsers />}
        {activeSection === 'admins' && <SuperAdminAdmins />}
        {activeSection === 'plans' && <SuperAdminPlans />}
      </div>
    </div>
  );
}

// ─── Overview Section ─────────────────────────────────────────────────────────
function SuperAdminOverview() {
  const [stats, setStats] = useState({ users: 0, founders: 0, investors: 0, mentors: 0, influencers: 0, cohorts: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      userApi.getAllUsers(),
      api.get('/api/cohorts'),
    ]).then(([users, cohorts]) => {
      const allUsers: any[] = (users as any).value?.data || [];
      const paidUsers = allUsers.filter((u: any) => u.paymentCompleted);
      setStats({
        users: allUsers.length,
        founders: allUsers.filter((u: any) => u.userType === 'FOUNDER').length,
        investors: allUsers.filter((u: any) => u.userType === 'INVESTOR').length,
        mentors: allUsers.filter((u: any) => u.userType === 'MENTOR').length,
        influencers: allUsers.filter((u: any) => u.userType === 'INFLUENCER').length,
        cohorts: ((cohorts as any).value?.data || []).length,
        revenue: paidUsers.length * 399, // estimate at Growth plan avg
      });
    }).finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Total Users', value: stats.users, icon: <Users size={20} />, color: 'bg-blue-500' },
    { label: 'Founders', value: stats.founders, icon: <TrendingUp size={20} />, color: 'bg-indigo-500' },
    { label: 'Investors', value: stats.investors, icon: <BarChart2 size={20} />, color: 'bg-green-500' },
    { label: 'Mentors', value: stats.mentors, icon: <Shield size={20} />, color: 'bg-orange-500' },
    { label: 'Influencers', value: stats.influencers, icon: <Users size={20} />, color: 'bg-pink-500' },
    { label: 'Total Cohorts', value: stats.cohorts, icon: <BookOpen size={20} />, color: 'bg-purple-500' },
    { label: 'Est. Revenue', value: `$${stats.revenue.toLocaleString()}`, icon: <TrendingUp size={20} />, color: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Platform Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Real-time stats for the entire Nebula platform</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center mb-3 text-white`}>
              {card.icon}
            </div>
            {loading ? (
              <div className="h-8 bg-gray-200 rounded animate-pulse w-16 mb-1" />
            ) : (
              <div className="font-display font-bold text-2xl text-gray-900">{card.value}</div>
            )}
            <div className="text-xs text-gray-500">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 flex items-start gap-3">
        <AlertTriangle size={20} className="text-orange-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-orange-800 text-sm">Super Admin Privileges</p>
          <p className="text-orange-600 text-xs mt-0.5">You have full platform access including the ability to promote users to admin, manage pricing plans, and view all data. Use with caution.</p>
        </div>
      </div>
    </div>
  );
}

// ─── Users Section ────────────────────────────────────────────────────────────
function SuperAdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userApi.getAllUsers().then(r => setUsers(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const promoteToAdmin = async (userId: string, name: string) => {
    if (!confirm(`Promote ${name} to Admin?`)) return;
    try {
      await api.post(`/api/users/${userId}/promote-admin`);
      toast.success(`${name} promoted to Admin`);
    } catch { toast.error('Failed to promote user'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">All Users</h1>
          <p className="text-gray-500 text-sm">{users.length} registered users</p>
        </div>
        <button onClick={() => userApi.getAllUsers().then(r => setUsers(r.data || []))} className="btn-primary px-4 py-2 rounded-xl text-sm flex items-center gap-2">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className="text-left px-5 py-3">User</th>
                <th className="text-left px-5 py-3">Role</th>
                <th className="text-left px-5 py-3">Joined</th>
                <th className="text-left px-5 py-3">Payment</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-5 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : users.map((u) => (
                <tr key={u.id} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-700 font-bold text-xs">{u.firstName?.[0]}{u.lastName?.[0]}</span>
                      </div>
                      <div>
                        <div className="font-medium text-sm text-gray-900">{u.firstName} {u.lastName}</div>
                        <div className="text-xs text-gray-400">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`badge ${u.userType === 'FOUNDER' ? 'badge-blue' : u.userType === 'INVESTOR' ? 'badge-green' : u.userType === 'MENTOR' ? 'badge-orange' : 'badge-gray'}`}>
                      {u.userType}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-400">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                  <td className="px-5 py-3"><span className={`badge ${u.paymentCompleted ? 'badge-green' : 'badge-gray'}`}>{u.paymentCompleted ? 'Paid' : 'Free'}</span></td>
                  <td className="px-5 py-3"><span className={`badge ${u.blocked ? 'badge-red' : 'badge-green'}`}>{u.blocked ? 'Blocked' : 'Active'}</span></td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => promoteToAdmin(u.id, `${u.firstName} ${u.lastName}`)}
                      className="px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-xs font-medium hover:bg-orange-100 transition-colors flex items-center gap-1"
                    >
                      <Crown size={11} /> Make Admin
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Admins Section ───────────────────────────────────────────────────────────
function SuperAdminAdmins() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userApi.getAllUsers().then(r => {
      const adminUsers = (r.data || []).filter((u: any) =>
        u.roles?.includes('ADMIN') || u.roles?.includes('SUPER_ADMIN')
      );
      setAdmins(adminUsers);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Admin Management</h1>
        <p className="text-gray-500 text-sm">Manage platform administrators and their privileges</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className="text-left px-5 py-3">Admin</th>
                <th className="text-left px-5 py-3">Role Level</th>
                <th className="text-left px-5 py-3">Email</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i}>{[...Array(5)].map((_, j) => (
                    <td key={j} className="px-5 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                  ))}</tr>
                ))
              ) : admins.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400 text-sm">No admins found. Promote a user from the Users tab.</td></tr>
              ) : admins.map((admin) => (
                <tr key={admin.id} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <Crown size={14} className="text-orange-600" />
                      </div>
                      <div className="font-medium text-sm text-gray-900">{admin.firstName} {admin.lastName}</div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`badge ${admin.roles?.includes('SUPER_ADMIN') ? 'badge-orange' : 'badge-blue'}`}>
                      {admin.roles?.includes('SUPER_ADMIN') ? 'Super Admin' : 'Admin'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">{admin.email}</td>
                  <td className="px-5 py-3"><span className="badge badge-green">Active</span></td>
                  <td className="px-5 py-3">
                    <button className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors">
                      Revoke Admin
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Plans Section ────────────────────────────────────────────────────────────
function SuperAdminPlans() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', durationMonths: '12', features: '', active: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadPlans(); }, []);

  const loadPlans = () => {
    setLoading(true);
    planApi.getAll().then(r => setPlans(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  const openCreate = () => {
    setEditingPlan(null);
    setForm({ name: '', description: '', price: '', durationMonths: '12', features: '', active: true });
    setShowModal(true);
  };

  const openEdit = (plan: any) => {
    setEditingPlan(plan);
    setForm({ name: plan.name, description: plan.description, price: String(plan.price), durationMonths: String(plan.durationMonths), features: (plan.features || []).join('\n'), active: plan.active });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) { toast.error('Name and price required'); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        durationMonths: parseInt(form.durationMonths),
        features: form.features.split('\n').filter(Boolean),
        active: form.active,
      };
      if (editingPlan) {
        await planApi.update(editingPlan.id, payload);
        toast.success('Plan updated');
      } else {
        await planApi.create(payload);
        toast.success('Plan created');
      }
      setShowModal(false);
      loadPlans();
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this plan?')) return;
    try { await planApi.delete(id); toast.success('Plan deleted'); loadPlans(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Pricing Plans</h1>
          <p className="text-gray-500 text-sm">Manage subscription plans and pricing</p>
        </div>
        <button onClick={openCreate} className="btn-cta px-5 py-2.5 rounded-xl text-sm flex items-center gap-2">
          <Plus size={16} /> New Plan
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-2 w-1/2" />
              <div className="h-8 bg-gray-200 rounded mb-3 w-2/3" />
              <div className="h-3 bg-gray-200 rounded mb-2" />
              <div className="h-3 bg-gray-200 rounded w-3/4" />
            </div>
          ))
        ) : plans.map((plan) => (
          <div key={plan.id} className={`bg-white rounded-xl border-2 p-5 ${plan.active ? 'border-gray-200' : 'border-dashed border-gray-200 opacity-60'}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-display font-bold text-gray-900">{plan.name}</h3>
                <div className="font-display text-2xl font-bold text-blue-600">${plan.price}<span className="text-sm font-normal text-gray-400">/yr</span></div>
              </div>
              <span className={`badge ${plan.active ? 'badge-green' : 'badge-gray'}`}>{plan.active ? 'Active' : 'Off'}</span>
            </div>
            <p className="text-xs text-gray-500 mb-3 leading-relaxed">{plan.description}</p>
            {plan.features?.slice(0, 3).map((f: string) => (
              <div key={f} className="flex items-center gap-1.5 text-xs text-gray-600 mb-1">
                <Check size={11} className="text-green-500" />{f}
              </div>
            ))}
            <div className="flex gap-2 mt-4">
              <button onClick={() => openEdit(plan)} className="flex-1 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1">
                <Edit size={11} /> Edit
              </button>
              <button onClick={() => handleDelete(plan.id)} className="py-1.5 px-2.5 border border-red-200 rounded-lg text-xs text-red-500 hover:bg-red-50">
                <Trash2 size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Plan modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-display font-bold text-lg text-gray-900">{editingPlan ? 'Edit Plan' : 'New Plan'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Plan Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field w-full px-4 py-2.5 rounded-xl text-sm" placeholder="e.g. Starter, Growth, Pro" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="input-field w-full px-4 py-2.5 rounded-xl text-sm resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (USD)</label>
                  <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} type="number" className="input-field w-full px-4 py-2.5 rounded-xl text-sm" placeholder="99" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration (months)</label>
                  <input value={form.durationMonths} onChange={e => setForm(f => ({ ...f, durationMonths: e.target.value }))} type="number" className="input-field w-full px-4 py-2.5 rounded-xl text-sm" placeholder="12" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Features (one per line)</label>
                <textarea value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))} rows={4} className="input-field w-full px-4 py-2.5 rounded-xl text-sm resize-none font-mono text-xs" placeholder={"Priority access to resources\nCohort program access\nMentor matching"} />
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="w-4 h-4 accent-blue-600" />
                <span className="text-sm text-gray-700">Plan is active (visible to users)</span>
              </label>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 btn-cta py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (editingPlan ? 'Save' : 'Create')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Export with AuthProvider ─────────────────────────────────────────────────
export default function SuperAdminPage() {
  return <AuthProvider><SuperAdminInner /></AuthProvider>;
}
