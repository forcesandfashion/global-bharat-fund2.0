'use client';
import { useEffect, useState } from 'react';
import { investorApi } from '@/lib/api';
import { RefreshCw, TrendingUp, DollarSign } from 'lucide-react';

export default function AdminInvestorsPage() {
  const [investors, setInvestors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    investorApi.getAll().then(r => setInvestors(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Investors</h1>
          <p className="text-gray-500 text-sm">{investors.length} investor profiles</p>
        </div>
        <button onClick={load} className="btn-primary px-4 py-2 rounded-xl text-sm flex items-center gap-2">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className="text-left px-5 py-3">Applicant</th>
                <th className="text-left px-5 py-3">Type</th>
                <th className="text-left px-5 py-3">Category</th>
                <th className="text-left px-5 py-3">Company</th>
                <th className="text-left px-5 py-3">Progress</th>
                <th className="text-left px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>{[...Array(6)].map((_, j) => <td key={j} className="px-5 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}</tr>
                ))
              ) : investors.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400 text-sm">No investor profiles yet</td></tr>
              ) : investors.map((inv) => (
                <tr key={inv.investorId} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <DollarSign size={14} className="text-green-600" />
                      </div>
                      <div className="font-medium text-sm text-gray-900">{inv.applicantName || '—'}</div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">{inv.investorType || '—'}</td>
                  <td className="px-5 py-3">
                    {inv.investorCategory ? (
                      <span className="badge badge-blue">{inv.investorCategory}</span>
                    ) : '—'}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">{inv.companyName || '—'}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full max-w-24">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${inv.progressPercent || 0}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{inv.progressPercent || 0}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`badge ${inv.status === 'COMPLETED' ? 'badge-green' : inv.status === 'IN_PROGRESS' ? 'badge-orange' : 'badge-gray'}`}>
                      {inv.status || 'PENDING'}
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
