'use client';
import { useEffect, useState } from 'react';
import { founderApi } from '@/lib/api';
import { RefreshCw, TrendingUp } from 'lucide-react';

export default function AdminFoundersPage() {
  const [founders, setFounders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    founderApi.getAll().then(r => setFounders(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Founders</h1>
          <p className="text-gray-500 text-sm">{founders.length} founder profiles</p>
        </div>
        <button onClick={() => { setLoading(true); founderApi.getAll().then(r => setFounders(r.data || [])).finally(() => setLoading(false)); }} className="btn-primary px-4 py-2 rounded-xl text-sm flex items-center gap-2">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className="text-left px-5 py-3">Applicant</th>
                <th className="text-left px-5 py-3">Company</th>
                <th className="text-left px-5 py-3">Nationality</th>
                <th className="text-left px-5 py-3">Progress</th>
                <th className="text-left px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>{[...Array(5)].map((_, j) => <td key={j} className="px-5 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}</tr>
                ))
              ) : founders.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400 text-sm">No founder profiles yet</td></tr>
              ) : founders.map((f) => (
                <tr key={f.id} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {f.profilePictureUrl ? (
                        <img src={f.profilePictureUrl} className="w-8 h-8 rounded-full object-cover" alt="" />
                      ) : (
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <TrendingUp size={14} className="text-blue-600" />
                        </div>
                      )}
                      <div className="font-medium text-sm text-gray-900">{f.applicantName || '—'}</div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">{f.compnayName || '—'}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">{f.nationality || '—'}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full max-w-24">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${f.progressPercent || 0}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{f.progressPercent || 0}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`badge ${f.status === 'COMPLETED' ? 'badge-green' : f.status === 'IN_PROGRESS' ? 'badge-orange' : 'badge-gray'}`}>
                      {f.status || 'PENDING'}
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
