'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { userApi, founderApi, investorApi, mentorApi, influencerApi, earningsApi } from '@/lib/api';
import api from '@/lib/api';
import {
  Users, TrendingUp, BookOpen, Package, ArrowRight,
  Activity, DollarSign, CreditCard, BarChart2
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name === 'revenue' ? `$${p.value.toLocaleString()}` : p.value}
        </p>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users:0, founders:0, investors:0, mentors:0, influencers:0, cohorts:0 });
  const [earningsData, setEarningsData] = useState<any>(null);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      userApi.getAllUsers(),
      founderApi.getAll(),
      investorApi.getAll(),
      mentorApi.getAll(),
      influencerApi.getAll(),
      api.get('/api/cohorts'),
      earningsApi.getSummary(),
    ]).then(([users, founders, investors, mentors, influencers, cohorts, earnings]) => {
      const allUsers: any[] = (users as any).value?.data || [];
      setStats({
        users: allUsers.length,
        founders: (founders as any).value?.data?.length || 0,
        investors: (investors as any).value?.data?.length || 0,
        mentors: (mentors as any).value?.data?.length || 0,
        influencers: (influencers as any).value?.data?.length || 0,
        cohorts: ((cohorts as any).value?.data || []).length,
      });
      setRecentUsers(allUsers.sort((a:any,b:any)=>b.createdAt-a.createdAt).slice(0,5));
      if ((earnings as any).value?.data) setEarningsData((earnings as any).value.data);
    }).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label:'Total Users', value:stats.users, icon:<Users size={20}/>, color:'bg-blue-500', href:'/admin/users' },
    { label:'Founders', value:stats.founders, icon:<TrendingUp size={20}/>, color:'bg-indigo-500', href:'/admin/founders' },
    { label:'Investors', value:stats.investors, icon:<DollarSign size={20}/>, color:'bg-green-500', href:'/admin/investors' },
    { label:'Mentors', value:stats.mentors, icon:<Activity size={20}/>, color:'bg-orange-500', href:'/admin/mentors' },
    { label:'Influencers', value:stats.influencers, icon:<Users size={20}/>, color:'bg-pink-500', href:'/admin/influencers' },
    { label:'Cohorts', value:stats.cohorts, icon:<BookOpen size={20}/>, color:'bg-purple-500', href:'/admin/cohorts' },
  ];

  const monthly = earningsData?.monthly || [];
  const totalRevenue = earningsData?.totalRevenue || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Admin Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Platform metrics and activity</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map(c => (
          <Link key={c.label} href={c.href}
            className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-all hover:-translate-y-0.5">
            <div className={`w-9 h-9 ${c.color} rounded-xl flex items-center justify-center mb-3 text-white`}>
              {c.icon}
            </div>
            {loading ? <div className="h-7 bg-gray-100 rounded animate-pulse mb-1 w-10"/> :
              <div className="font-display font-bold text-2xl text-gray-900">{c.value}</div>}
            <div className="text-xs text-gray-500 mt-0.5">{c.label}</div>
          </Link>
        ))}
      </div>

      {/* Revenue highlight */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white flex items-center justify-between">
        <div>
          <p className="text-blue-200 text-sm mb-1">Total Platform Revenue</p>
          <p className="font-display font-bold text-4xl">
            ${totalRevenue.toLocaleString('en-US', {maximumFractionDigits:0})}
          </p>
          <p className="text-blue-200 text-sm mt-1">{earningsData?.totalTransactions || 0} completed transactions</p>
        </div>
        <div className="hidden sm:block text-right">
          <p className="text-blue-200 text-sm">{earningsData?.pendingCount || 0} Pending</p>
          <p className="text-blue-200 text-sm">{earningsData?.failedCount || 0} Failed</p>
          <Link href="/admin/earnings" className="inline-flex items-center gap-1.5 mt-3 text-white bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            Full Report <ArrowRight size={14}/>
          </Link>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Revenue chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart2 size={16} className="text-blue-600"/> Monthly Revenue
          </h2>
          {loading || monthly.length === 0 ? (
            <div className="h-44 bg-gray-50 rounded-xl animate-pulse"/>
          ) : (
            <ResponsiveContainer width="100%" height={176}>
              <AreaChart data={monthly.slice(-6)} margin={{top:5,right:5,bottom:0,left:0}}>
                <defs>
                  <linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9"/>
                <XAxis dataKey="label" tick={{fontSize:10,fill:'#94A3B8'}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:'#94A3B8'}} axisLine={false} tickLine={false}
                  tickFormatter={v=>v>=1000?`$${(v/1000).toFixed(0)}k`:`$${v}`}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2}
                  fill="url(#ag1)" dot={{r:3,fill:'#2563EB',strokeWidth:0}}/>
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Transactions chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard size={16} className="text-orange-500"/> Monthly Transactions
          </h2>
          {loading || monthly.length === 0 ? (
            <div className="h-44 bg-gray-50 rounded-xl animate-pulse"/>
          ) : (
            <ResponsiveContainer width="100%" height={176}>
              <BarChart data={monthly.slice(-6)} margin={{top:5,right:5,bottom:0,left:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9"/>
                <XAxis dataKey="label" tick={{fontSize:10,fill:'#94A3B8'}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:'#94A3B8'}} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Bar dataKey="transactions" fill="#F97316" radius={[4,4,0,0]} maxBarSize={28}/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/admin/cohorts/new" className="bg-blue-600 text-white rounded-2xl p-5 hover:bg-blue-700 transition-colors flex items-center justify-between">
          <div><BookOpen size={22} className="mb-2"/><div className="font-semibold">New Cohort</div><div className="text-blue-200 text-xs">Add a program</div></div>
          <ArrowRight size={18}/>
        </Link>
        <Link href="/admin/earnings" className="bg-green-600 text-white rounded-2xl p-5 hover:bg-green-700 transition-colors flex items-center justify-between">
          <div><DollarSign size={22} className="mb-2"/><div className="font-semibold">View Earnings</div><div className="text-green-200 text-xs">Full revenue report</div></div>
          <ArrowRight size={18}/>
        </Link>
        <Link href="/admin/users" className="bg-gray-800 text-white rounded-2xl p-5 hover:bg-gray-900 transition-colors flex items-center justify-between">
          <div><Users size={22} className="mb-2"/><div className="font-semibold">Manage Users</div><div className="text-gray-400 text-xs">Block, verify, promote</div></div>
          <ArrowRight size={18}/>
        </Link>
      </div>

      {/* Recent users */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Registrations</h2>
          <Link href="/admin/users" className="text-sm text-blue-600 hover:underline">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className="text-left px-5 py-3">User</th>
                <th className="text-left px-5 py-3">Role</th>
                <th className="text-left px-5 py-3">Payment</th>
                <th className="text-left px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(5)].map((_,i)=>(
                <tr key={i}>{[...Array(4)].map((_,j)=>(
                  <td key={j} className="px-5 py-3.5"><div className="h-4 bg-gray-100 rounded animate-pulse"/></td>
                ))}</tr>
              )) : recentUsers.map(u=>(
                <tr key={u.id} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3.5">
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
                  <td className="px-5 py-3.5">
                    <span className={`badge text-xs ${u.userType==='FOUNDER'?'badge-blue':u.userType==='INVESTOR'?'badge-green':u.userType==='MENTOR'?'badge-orange':'badge-gray'}`}>
                      {u.userType}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`badge text-xs ${u.paymentCompleted?'badge-green':'badge-gray'}`}>
                      {u.paymentCompleted?'Paid':'Free'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`badge text-xs ${u.blocked?'badge-red':u.active?'badge-green':'badge-gray'}`}>
                      {u.blocked?'Blocked':u.active?'Active':'Inactive'}
                    </span>
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
