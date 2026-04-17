'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/store/auth';
import { founderApi, mentorApi, cohortApi } from '@/lib/api';
import {
  BookOpen, ArrowRight, Clock, Users, Zap, CheckCircle,
  AlertCircle, TrendingUp, Video, Calendar, ChevronRight, X
} from 'lucide-react';

interface Week { weekNumber: number; topic: string; description: string; }
interface Cohort {
  id: string; title: string; description: string;
  imageUrl?: string; googleMeetLink?: string;
  startDate?: string; weeks?: Week[]; status: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [detailCohort, setDetailCohort] = useState<Cohort | null>(null);
  const [joinedCohorts, setJoinedCohorts] = useState<Set<string>>(new Set());

  useEffect(() => { fetchData(); }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (user?.userType === 'FOUNDER') {
        const res = await founderApi.getProfile();
        setProfile(res.data);
      } else if (user?.userType === 'MENTOR') {
        const res = await mentorApi.getProfile();
        setProfile(res.data);
      }
      const res = await cohortApi.getActive();
      setCohorts(res.data || []);
      // Load joined cohorts from localStorage
      const stored = localStorage.getItem(`joined_cohorts_${user?.userId}`);
      if (stored) setJoinedCohorts(new Set(JSON.parse(stored)));
    } catch {}
    setLoading(false);
  };

  const joinCohort = (cohortId: string) => {
    const newSet = new Set(joinedCohorts).add(cohortId);
    setJoinedCohorts(newSet);
    localStorage.setItem(`joined_cohorts_${user?.userId}`, JSON.stringify([...newSet]));
  };

  const profilePercent = profile?.progressPercent || 0;
  const isPaymentDone = user?.paymentCompleted;
  const isFounder = user?.userType === 'FOUNDER';
  const isMentor = user?.userType === 'MENTOR';

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute right-16 bottom-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold mb-1">
              Welcome back, {user?.firstName}! 👋
            </h1>
            <p className="text-blue-100 text-sm">
              {profilePercent < 100
                ? `Profile ${profilePercent}% complete — finish it to unlock all features`
                : 'Your profile is complete. Keep exploring Nebula!'}
            </p>
            {profilePercent < 100 && (
              <div className="mt-3">
                <div className="h-1.5 bg-blue-500/50 rounded-full w-48">
                  <div className="h-full bg-white rounded-full" style={{ width: `${profilePercent}%` }} />
                </div>
                <Link href="/profile" className="inline-flex items-center gap-1 mt-2 text-xs text-white/80 hover:text-white font-medium">
                  Complete profile <ArrowRight size={12} />
                </Link>
              </div>
            )}
          </div>
          <div className="text-5xl hidden sm:block">🚀</div>
        </div>
      </div>

      {/* Payment banner — ONLY for founders who haven't paid */}
      {isFounder && !isPaymentDone && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-orange-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-orange-800">Upgrade to join cohorts</p>
              <p className="text-xs text-orange-600">You need an active plan to join cohort programs.</p>
            </div>
          </div>
          <Link href="/payment" className="btn-cta px-4 py-2 rounded-xl text-sm flex-shrink-0">
            Upgrade now
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Profile', value: `${profilePercent}%`, icon: <CheckCircle size={20} className="text-blue-600" />, color: 'bg-blue-50' },
          { label: 'Active Cohorts', value: String(cohorts.length), icon: <BookOpen size={20} className="text-orange-600" />, color: 'bg-orange-50' },
          { label: 'Plan', value: isPaymentDone ? 'Active' : 'Free', icon: <Zap size={20} className={isPaymentDone ? 'text-green-600' : 'text-gray-400'} />, color: isPaymentDone ? 'bg-green-50' : 'bg-gray-50' },
          { label: 'Role', value: user?.userType || '', icon: <Users size={20} className="text-purple-600" />, color: 'bg-purple-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>{s.icon}</div>
            <div className="font-display font-bold text-2xl text-gray-900 mb-0.5 capitalize">{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Cohorts section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-xl text-gray-900">
            {isMentor ? 'Cohorts to Mentor' : 'Available Cohorts'}
          </h2>
          <Link href="/cohorts" className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
                <div className="h-36 bg-gray-100 rounded-lg mb-4" />
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-full mb-4" />
                <div className="h-9 bg-gray-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : cohorts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <BookOpen size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No active cohorts yet</p>
            <p className="text-gray-400 text-xs mt-1">New cohorts are added regularly</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {cohorts.slice(0, 6).map(cohort => (
              <CohortCard
                key={cohort.id}
                cohort={cohort}
                isMentor={isMentor}
                isFounder={isFounder}
                isPaid={!!isPaymentDone}
                isJoined={joinedCohorts.has(cohort.id)}
                onJoin={() => joinCohort(cohort.id)}
                onViewDetail={() => setDetailCohort(cohort)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Cohort detail modal */}
      {detailCohort && (
        <CohortDetailModal
          cohort={detailCohort}
          isMentor={isMentor}
          isFounder={isFounder}
          isPaid={!!isPaymentDone}
          isJoined={joinedCohorts.has(detailCohort.id)}
          onJoin={() => joinCohort(detailCohort.id)}
          onClose={() => setDetailCohort(null)}
        />
      )}
    </div>
  );
}

// ── Cohort Card ───────────────────────────────────────────────────────────────
function CohortCard({ cohort, isMentor, isFounder, isPaid, isJoined, onJoin, onViewDetail }: {
  cohort: Cohort; isMentor: boolean; isFounder: boolean;
  isPaid: boolean; isJoined: boolean;
  onJoin: () => void; onViewDetail: () => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col">
      {cohort.imageUrl ? (
        <img src={cohort.imageUrl} alt={cohort.title} className="w-full h-36 object-cover" />
      ) : (
        <div className="w-full h-36 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
          <BookOpen size={36} className="text-white/60" />
        </div>
      )}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 mb-1 text-sm leading-tight">{cohort.title}</h3>
        <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed flex-1">{cohort.description}</p>

        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
          {cohort.weeks?.length ? <span className="flex items-center gap-1"><Clock size={11} />{cohort.weeks.length}w</span> : null}
          {cohort.startDate && <span className="flex items-center gap-1"><Calendar size={11} />{new Date(cohort.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
        </div>

        {/* Action buttons */}
        <div className="space-y-2">
          <button onClick={onViewDetail}
            className="w-full py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-1.5">
            View Details <ChevronRight size={12} />
          </button>

          {isMentor ? (
            <button className="w-full btn-primary py-2 rounded-xl text-xs">I will mentor it</button>
          ) : isFounder ? (
            isJoined ? (
              <a href={cohort.googleMeetLink || '#'} target="_blank" rel="noopener noreferrer"
                className="block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-xl text-xs text-center transition-colors flex items-center justify-center gap-1.5">
                <Video size={12} /> Join Meeting
              </a>
            ) : isPaid ? (
              <button onClick={onJoin}
                className="w-full btn-cta py-2 rounded-xl text-xs flex items-center justify-center gap-1.5">
                <Zap size={12} /> Join Cohort
              </button>
            ) : (
              <Link href="/payment"
                className="block w-full border-2 border-orange-300 text-orange-600 font-semibold py-2 rounded-xl text-xs text-center hover:bg-orange-50 transition-colors">
                Upgrade to Join
              </Link>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ── Cohort Detail Modal ───────────────────────────────────────────────────────
function CohortDetailModal({ cohort, isMentor, isFounder, isPaid, isJoined, onJoin, onClose }: {
  cohort: Cohort; isMentor: boolean; isFounder: boolean;
  isPaid: boolean; isJoined: boolean; onJoin: () => void; onClose: () => void;
}) {
  const [joined, setJoined] = useState(isJoined);

  const handleJoin = () => { onJoin(); setJoined(true); };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-8 overflow-hidden">
        {/* Cover image */}
        <div className="relative">
          {cohort.imageUrl ? (
            <img src={cohort.imageUrl} alt={cohort.title} className="w-full h-52 object-cover" />
          ) : (
            <div className="w-full h-52 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <BookOpen size={56} className="text-white/50" />
            </div>
          )}
          <button onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-colors">
            <X size={16} />
          </button>
          <div className="absolute bottom-3 left-4">
            <span className="bg-green-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">Active</span>
          </div>
        </div>

        <div className="p-6">
          <h2 className="font-display font-bold text-2xl text-gray-900 mb-2">{cohort.title}</h2>
          <p className="text-gray-500 leading-relaxed mb-5">{cohort.description}</p>

          {/* Meta info */}
          <div className="flex flex-wrap gap-4 mb-6">
            {cohort.weeks?.length && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock size={14} className="text-blue-600" />
                </div>
                <div><div className="font-semibold">{cohort.weeks.length} Weeks</div><div className="text-xs text-gray-400">Program duration</div></div>
              </div>
            )}
            {cohort.startDate && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Calendar size={14} className="text-orange-600" />
                </div>
                <div><div className="font-semibold">{new Date(cohort.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div><div className="text-xs text-gray-400">Start date</div></div>
              </div>
            )}
            {cohort.googleMeetLink && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Video size={14} className="text-green-600" />
                </div>
                <div><div className="font-semibold">Google Meet</div><div className="text-xs text-gray-400">Live sessions</div></div>
              </div>
            )}
          </div>

          {/* Weekly schedule */}
          {cohort.weeks && cohort.weeks.length > 0 && (
            <div className="mb-6">
              <h3 className="font-display font-bold text-lg text-gray-900 mb-3">Weekly Schedule</h3>
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {cohort.weeks.map((week) => (
                  <div key={week.weekNumber} className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors group">
                    <div className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0">
                      W{week.weekNumber}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-gray-900">{week.topic}</div>
                      <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{week.description}</div>
                    </div>
                    {cohort.googleMeetLink && (joined || isMentor) && (
                      <a href={cohort.googleMeetLink} target="_blank" rel="noopener noreferrer"
                        className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors opacity-0 group-hover:opacity-100">
                        <Video size={11} /> Join
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button onClick={onClose}
              className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
              Close
            </button>
            {isMentor ? (
              <button className="flex-1 btn-primary py-3 rounded-xl text-sm">I will mentor it</button>
            ) : isFounder ? (
              joined ? (
                <a href={cohort.googleMeetLink || '#'} target="_blank" rel="noopener noreferrer"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl text-sm text-center transition-colors flex items-center justify-center gap-2">
                  <Video size={16} /> Join Google Meet
                </a>
              ) : isPaid ? (
                <button onClick={handleJoin}
                  className="flex-1 btn-cta py-3 rounded-xl text-sm flex items-center justify-center gap-2">
                  <Zap size={16} /> Join This Cohort
                </button>
              ) : (
                <Link href="/payment" className="flex-1 btn-cta py-3 rounded-xl text-sm text-center">
                  Upgrade to Join
                </Link>
              )
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
