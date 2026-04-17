'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/store/auth';
import api from '@/lib/api';
import Link from 'next/link';
import { BookOpen, Clock, Link as LinkIcon, Search, Filter } from 'lucide-react';

interface Cohort {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  googleMeetLink?: string;
  startDate?: string;
  weeks?: { weekNumber: number; topic: string; description: string }[];
  status: string;
}

export default function CohortsPage() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [selected, setSelected] = useState<Cohort | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    api.get('/api/cohorts/active').then(res => setCohorts(res.data || []))
      .catch(() => setCohorts([]))
      .finally(() => setLoading(false));
  }, []);

  const isMentor = user?.userType === 'MENTOR';
  const canJoin = user?.paymentCompleted && user?.userType === 'FOUNDER';

  const filtered = cohorts.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">
          {isMentor ? 'Cohorts to Mentor' : 'Available Cohorts'}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {isMentor ? 'Express your interest to mentor a cohort' : 'Join a cohort to accelerate your startup journey'}
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cohorts..."
          className="input-field w-full pl-9 pr-4 py-2.5 rounded-xl text-sm" />
      </div>

      {loading ? (
        <div className="grid md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 animate-pulse">
              <div className="h-40 bg-gray-200 rounded-t-xl" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
                <div className="h-9 bg-gray-200 rounded-lg mt-3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
          <BookOpen size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No cohorts available</p>
          <p className="text-xs text-gray-400 mt-1">Check back soon — new cohorts are added regularly</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-5">
          {filtered.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5">
              {c.imageUrl ? (
                <img src={c.imageUrl} alt={c.title} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                  <BookOpen size={40} className="text-white/60" />
                </div>
              )}
              <div className="p-5">
                <h3 className="font-semibold text-gray-900 mb-1.5 leading-tight">{c.title}</h3>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">{c.description}</p>

                <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                  {c.weeks?.length ? (
                    <span className="flex items-center gap-1"><Clock size={11} />{c.weeks.length} weeks</span>
                  ) : null}
                  {c.googleMeetLink && (
                    <span className="flex items-center gap-1 text-blue-500"><LinkIcon size={11} />Meet link</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setSelected(c)}
                    className="flex-1 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50">
                    View Details
                  </button>
                  {isMentor ? (
                    <button className="flex-1 btn-primary py-2 rounded-lg text-xs">I will mentor it</button>
                  ) : canJoin ? (
                    <a href={c.googleMeetLink || '#'} target="_blank" rel="noopener noreferrer"
                      className="flex-1 btn-cta py-2 rounded-lg text-xs text-center">Join it</a>
                  ) : (
                    <Link href="/payment" className="flex-1 border border-orange-300 text-orange-600 text-xs font-semibold py-2 rounded-lg text-center hover:bg-orange-50 transition-colors">
                      Upgrade
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl my-8">
            {selected.imageUrl ? (
              <img src={selected.imageUrl} alt={selected.title} className="w-full h-48 object-cover rounded-t-2xl" />
            ) : (
              <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-blue-700 rounded-t-2xl flex items-center justify-center">
                <BookOpen size={48} className="text-white/60" />
              </div>
            )}
            <div className="p-6">
              <h2 className="font-display font-bold text-xl text-gray-900 mb-2">{selected.title}</h2>
              <p className="text-gray-500 text-sm mb-5 leading-relaxed">{selected.description}</p>

              {selected.weeks && selected.weeks.length > 0 && (
                <div className="mb-5">
                  <h3 className="font-semibold text-sm text-gray-900 mb-3">Program Schedule</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selected.weeks.map((week) => (
                      <div key={week.weekNumber} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">
                          W{week.weekNumber}
                        </div>
                        <div>
                          <div className="font-medium text-xs text-gray-900">{week.topic}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{week.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setSelected(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Close</button>
                {isMentor ? (
                  <button className="flex-1 btn-primary py-2.5 rounded-xl text-sm">I will mentor it</button>
                ) : canJoin ? (
                  <a href={selected.googleMeetLink || '#'} target="_blank" rel="noopener noreferrer"
                    className="flex-1 btn-cta py-2.5 rounded-xl text-sm text-center">Join Cohort</a>
                ) : (
                  <Link href="/payment" className="flex-1 btn-cta py-2.5 rounded-xl text-sm text-center">Upgrade to Join</Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
