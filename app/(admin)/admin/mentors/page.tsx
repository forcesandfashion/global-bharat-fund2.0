'use client';
import { useEffect, useState } from 'react';
import { mentorApi } from '@/lib/api';
import { RefreshCw, Award } from 'lucide-react';

export default function AdminMentorsPage() {
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    mentorApi.saveAll().then(r => setMentors(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Mentors</h1>
          <p className="text-gray-500 text-sm">{mentors.length} mentor profiles</p>
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
                <th className="text-left px-5 py-3">Mentor</th>
                <th className="text-left px-5 py-3">Title</th>
                <th className="text-left px-5 py-3">Company</th>
                <th className="text-left px-5 py-3">Nationality</th>
                <th className="text-left px-5 py-3">Progress</th>
                <th className="text-left px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>{[...Array(6)].map((_, j) => <td key={j} className="px-5 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}</tr>
                ))
              ) : mentors.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400 text-sm">No mentor profiles yet</td></tr>
              ) : mentors.map((m) => (
                <tr key={m.mentorId} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {m.profilePictureUrl ? (
                        <img src={m.profilePictureUrl} className="w-8 h-8 rounded-full object-cover" alt="" />
                      ) : (
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <Award size={14} className="text-orange-600" />
                        </div>
                      )}
                      <div className="font-medium text-sm text-gray-900">{m.applicantName || '—'}</div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">{m.professionalTitle || '—'}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">{m.companyName || '—'}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">{m.nation || '—'}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full max-w-24">
                        <div className="h-full bg-orange-500 rounded-full" style={{ width: `${m.progressPercent || 0}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{m.progressPercent || 0}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`badge ${m.status === 'COMPLETED' ? 'badge-green' : m.status === 'IN_PROGRESS' ? 'badge-orange' : 'badge-gray'}`}>
                      {m.status || 'PENDING'}
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
