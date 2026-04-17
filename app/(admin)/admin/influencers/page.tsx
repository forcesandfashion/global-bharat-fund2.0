'use client';
import { useEffect, useState } from 'react';
import { influencerApi } from '@/lib/api';
import { RefreshCw, Users } from 'lucide-react';

export default function AdminInfluencersPage() {
  const [influencers, setInfluencers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    influencerApi.getAll().then(r => setInfluencers(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Influencers</h1>
          <p className="text-gray-500 text-sm">{influencers.length} influencer profiles</p>
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
                <th className="text-left px-5 py-3">Influencer</th>
                <th className="text-left px-5 py-3">Stage Name</th>
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
              ) : influencers.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400 text-sm">No influencer profiles yet</td></tr>
              ) : influencers.map((inf) => (
                <tr key={inf.influencerId} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {inf.profilePictureUrl ? (
                        <img src={inf.profilePictureUrl} className="w-8 h-8 rounded-full object-cover" alt="" />
                      ) : (
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <Users size={14} className="text-purple-600" />
                        </div>
                      )}
                      <div className="font-medium text-sm text-gray-900">{inf.applicantName || '—'}</div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">{inf.stageName || '—'}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">{inf.nation || '—'}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full max-w-24">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${inf.progressPercent || 0}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{inf.progressPercent || 0}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`badge ${inf.status === 'COMPLETED' ? 'badge-green' : inf.status === 'IN_PROGRESS' ? 'badge-orange' : 'badge-gray'}`}>
                      {inf.status || 'PENDING'}
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
