'use client';
import { useEffect, useState } from 'react';
import { earningsApi } from '@/lib/api';
import {
  TrendingUp, DollarSign, CreditCard, Clock, XCircle,
  RefreshCw, Download, ArrowUpRight, Package
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';

interface MonthData { label: string; revenue: number; transactions: number; }
interface PlanData { name: string; count: number; revenue: number; }
interface Transaction {
  id: string; amount: number; currency: string; planName: string;
  userName: string; userEmail: string; userType: string;
  transactionId: string; createdAt: number;
}

const COLORS = ['#2563EB', '#F97316', '#10B981', '#8B5CF6', '#F59E0B'];
const fmtCurrency = (v: number) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const fmtDate = (ms: number) => ms ? new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg">
      <p className="text-xs font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="text-xs" style={{ color: p.color }}>
          {p.name}: {p.name === 'revenue' ? fmtCurrency(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

export default function AdminEarningsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [txPage, setTxPage] = useState(0);
  const TX_PER_PAGE = 10;

  const load = async () => {
    setLoading(true);
    try {
      const res = await earningsApi.getSummary();
      setData(res.data);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const monthly: MonthData[] = data?.monthly || [];
  const byPlan: PlanData[] = data?.byPlan
    ? Object.entries(data.byPlan).map(([name, v]: any) => ({ name, count: v.count, revenue: v.revenue }))
    : [];
  const transactions: Transaction[] = data?.recentTransactions || [];
  const paged = transactions.slice(txPage * TX_PER_PAGE, (txPage + 1) * TX_PER_PAGE);

  const stats = [
    {
      label: 'Total Revenue',
      value: fmtCurrency(data?.totalRevenue || 0),
      icon: <DollarSign size={22} className="text-green-600" />,
      bg: 'bg-green-50',
      change: '+12% this month',
      up: true,
    },
    {
      label: 'Transactions',
      value: (data?.totalTransactions || 0).toString(),
      icon: <CreditCard size={22} className="text-blue-600" />,
      bg: 'bg-blue-50',
      change: `${data?.pendingCount || 0} pending`,
      up: null,
    },
    {
      label: 'Pending',
      value: (data?.pendingCount || 0).toString(),
      icon: <Clock size={22} className="text-orange-600" />,
      bg: 'bg-orange-50',
      change: 'Awaiting capture',
      up: null,
    },
    {
      label: 'Failed',
      value: (data?.failedCount || 0).toString(),
      icon: <XCircle size={22} className="text-red-500" />,
      bg: 'bg-red-50',
      change: 'Needs attention',
      up: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Earnings & Revenue</h1>
          <p className="text-gray-500 text-sm mt-1">Platform-wide financial overview</p>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className={`w-11 h-11 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              {s.icon}
            </div>
            {loading ? (
              <div className="h-8 bg-gray-100 rounded animate-pulse w-24 mb-1" />
            ) : (
              <div className="font-display font-bold text-3xl text-gray-900">{s.value}</div>
            )}
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            {s.change && (
              <div className={`flex items-center gap-1 text-xs mt-2 font-medium ${
                s.up === true ? 'text-green-600' : s.up === false ? 'text-red-500' : 'text-gray-400'
              }`}>
                {s.up === true && <ArrowUpRight size={12} />}
                {s.change}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Revenue area chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-lg text-gray-900">Revenue Over Time</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">Last 12 months</span>
          </div>
          {loading ? (
            <div className="h-56 bg-gray-50 rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthly} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2.5}
                  fill="url(#revenueGrad)" dot={{ r: 3, fill: '#2563EB', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#2563EB' }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart - by plan */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-display font-bold text-lg text-gray-900 mb-5">Revenue by Plan</h2>
          {loading || byPlan.length === 0 ? (
            <div className="h-56 bg-gray-50 rounded-xl animate-pulse" />
          ) : (
            <div>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={byPlan} cx="50%" cy="50%" innerRadius={52} outerRadius={80}
                    dataKey="revenue" paddingAngle={3}>
                    {byPlan.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: ValueType, name: NameType) => {
                      if (typeof value === 'number') {
                        return [fmtCurrency(value), name];
                      }
                      return [value ?? '', name];
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {byPlan.map((p, i) => (
                  <div key={p.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-gray-700 font-medium">{p.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">{fmtCurrency(p.revenue)}</span>
                      <span className="text-gray-400 ml-1">({p.count})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transactions bar chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-lg text-gray-900">Monthly Transactions</h2>
        </div>
        {loading ? (
          <div className="h-48 bg-gray-50 rounded-xl animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthly} margin={{ top: 0, right: 5, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="transactions" fill="#F97316" radius={[4, 4, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Recent transactions table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-display font-bold text-lg text-gray-900">Recent Transactions</h2>
          <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">
            <Download size={12} /> Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className="text-left px-5 py-3">Customer</th>
                <th className="text-left px-5 py-3">Plan</th>
                <th className="text-left px-5 py-3">Amount</th>
                <th className="text-left px-5 py-3">Transaction ID</th>
                <th className="text-left px-5 py-3">Date</th>
                <th className="text-left px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-t border-gray-50">
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-5 py-3.5">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paged.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-gray-400 py-10 text-sm">No transactions yet</td></tr>
              ) : (
                paged.map(tx => (
                  <tr key={tx.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-700 font-bold text-xs">
                            {tx.userName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '?'}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-sm text-gray-900">{tx.userName || 'Unknown'}</div>
                          <div className="text-xs text-gray-400">{tx.userEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Package size={13} className="text-gray-400" />
                        <span className="text-sm text-gray-700 font-medium">{tx.planName || '—'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-green-700 text-sm">{fmtCurrency(tx.amount)}</span>
                      <span className="text-xs text-gray-400 ml-1">{tx.currency}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-600">
                        {tx.transactionId?.slice(0, 16)}…
                      </code>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{fmtDate(tx.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <span className="badge badge-green text-xs">Completed</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {transactions.length > TX_PER_PAGE && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">
              Showing {txPage * TX_PER_PAGE + 1}–{Math.min((txPage + 1) * TX_PER_PAGE, transactions.length)} of {transactions.length}
            </span>
            <div className="flex gap-2">
              <button onClick={() => setTxPage(p => Math.max(p - 1, 0))} disabled={txPage === 0}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs hover:bg-gray-50 disabled:opacity-40">
                ← Prev
              </button>
              <button
                onClick={() => setTxPage(p => Math.min(p + 1, Math.floor(transactions.length / TX_PER_PAGE)))}
                disabled={(txPage + 1) * TX_PER_PAGE >= transactions.length}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs hover:bg-gray-50 disabled:opacity-40">
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
