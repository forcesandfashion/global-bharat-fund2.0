'use client';
import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { connectionApi, userApi } from '@/lib/api';
import { useAuth } from '@/store/auth';
import Link from 'next/link';
import {
  Search, Users, Clock, Check, X, UserPlus, MessageSquare,
  Zap, TrendingUp, Award, Star, Globe, Filter
} from 'lucide-react';

interface Member {
  id: string; firstName: string; lastName: string;
  email: string; userType: string; bio?: string; profileImageUrl?: string;
}
interface ConnReq {
  id: string; requesterId: string; recipientId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'; createdAt?: string;
}

const ROLE_CONFIG: Record<string, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
  FOUNDER:    { color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200',   icon: <Zap size={14} />,        label: 'Founder' },
  INVESTOR:   { color: 'text-green-700',  bg: 'bg-green-50 border-green-200', icon: <TrendingUp size={14} />, label: 'Investor' },
  MENTOR:     { color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200',icon: <Award size={14} />,     label: 'Mentor' },
  INFLUENCER: { color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200',icon: <Star size={14} />,      label: 'Influencer' },
};
const AVATAR_COLORS: Record<string, string> = {
  FOUNDER: 'from-blue-400 to-blue-600', INVESTOR: 'from-green-400 to-green-600',
  MENTOR: 'from-orange-400 to-orange-500', INFLUENCER: 'from-purple-400 to-purple-600',
};

const initials = (u?: Member) => `${u?.firstName?.[0] || ''}${u?.lastName?.[0] || ''}`.toUpperCase();
const fullName = (u?: Member) => u ? `${u.firstName} ${u.lastName}`.trim() : 'Unknown';

export default function ConnectionsPage() {
  const { user } = useAuth();
  const myId = user?.userId || '';
  const [tab, setTab] = useState<'discover' | 'network' | 'requests'>('discover');
  const [allUsers, setAllUsers] = useState<Member[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, Member>>({});
  const [connections, setConnections] = useState<ConnReq[]>([]);
  const [pending, setPending] = useState<ConnReq[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [uRes, cRes, pRes] = await Promise.allSettled([
        userApi.getAllUsers(),
        connectionApi.getConnections(),
        connectionApi.getPendingRequests(),
      ]);
      if (uRes.status === 'fulfilled') {
        const users: Member[] = uRes.value.data || [];
        setAllUsers(users);
        const map: Record<string, Member> = {};
        users.forEach(u => { map[u.id] = u; });
        setUsersMap(map);
      }
      if (cRes.status === 'fulfilled') setConnections(cRes.value.data || []);
      if (pRes.status === 'fulfilled') setPending(pRes.value.data || []);
    } catch { }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const sendReq = async (targetId: string) => {
    setActionLoading(targetId);
    try {
      await connectionApi.sendRequest(targetId);
      toast.success('Request sent!');
      setPending(p => [...p, {
        id: `tmp_${Date.now()}`, requesterId: myId,
        recipientId: targetId, status: 'PENDING',
      }]);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to send request');
    } finally { setActionLoading(null); }
  };

  const accept = async (id: string) => {
    setActionLoading(id);
    try {
      await connectionApi.acceptRequest(id);
      toast.success('Connected!');
      load();
    } catch { toast.error('Failed'); } finally { setActionLoading(null); }
  };

  const reject = async (id: string) => {
    setActionLoading(id);
    try {
      await connectionApi.rejectRequest(id);
      setPending(p => p.filter(r => r.id !== id));
      toast('Declined', { icon: '👋' });
    } catch { toast.error('Failed'); } finally { setActionLoading(null); }
  };

  const acceptedConns = connections.filter(c => c.status === 'ACCEPTED');
  const connectedIds = new Set(acceptedConns.map(c =>
    c.requesterId === myId ? c.recipientId : c.requesterId
  ));
  const sentIds = new Set(pending.filter(p => p.requesterId === myId).map(p => p.recipientId));
  const received = pending.filter(p => p.recipientId === myId && p.status === 'PENDING');

  const filtered = allUsers.filter(u => {
    if (u.id === myId) return false;
    if (roleFilter !== 'ALL' && u.userType !== roleFilter) return false;
    if (search) return fullName(u).toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return true;
  });

  const tabs = [
    { id: 'discover' as const, label: 'Discover', count: null },
    { id: 'network' as const, label: 'My Network', count: acceptedConns.length || null },
    { id: 'requests' as const, label: 'Requests', count: received.length || null },
  ];

  return (
    <div className="space-y-6">
      {/* ── Hero header ── */}
      <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full border border-white"
              style={{ width: `${(i+1)*80}px`, height: `${(i+1)*80}px`, right: `${i*20-40}px`, top: `${i*10-40}px` }} />
          ))}
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold mb-1">Your Network</h1>
            <p className="text-blue-200 text-sm">Build meaningful connections in the Nebula ecosystem</p>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-center">
           {[
            { v: acceptedConns.length, l: 'Connected' },
            { v: sentIds.size, l: 'Sent' },
            { v: received.length, l: 'Pending' },
          ].map(({ v, l }) => (
            <div key={l}>
              <div className="font-display font-bold text-2xl">{v}</div>
              <div className="text-xs text-blue-300">{l}</div>
            </div>
          ))}
          </div>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1 w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              tab === t.id ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t.label}
            {t.count ? (
              <span className="w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">{t.count}</span>
            ) : null}
          </button>
        ))}
      </div>

      {/* ── DISCOVER ── */}
      {tab === 'discover' && (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-64">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search founders, investors, mentors..."
                className="input-field w-full pl-10 pr-4 py-2.5 rounded-xl text-sm" />
            </div>
            <div className="flex items-center gap-1.5 bg-gray-100 rounded-xl p-1">
              <Filter size={13} className="text-gray-400 ml-2" />
              {['ALL', 'FOUNDER', 'INVESTOR', 'MENTOR', 'INFLUENCER'].map(r => (
                <button key={r} onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    roleFilter === r ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  }`}>{r === 'ALL' ? 'All' : r.charAt(0) + r.slice(1).toLowerCase()}</button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                  <div className="w-14 h-14 bg-gray-200 rounded-2xl mb-4 mx-auto" />
                  <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto mb-4" />
                  <div className="h-9 bg-gray-200 rounded-xl" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
              <Globe size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-semibold">No members found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your filter</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(u => {
                const cfg = ROLE_CONFIG[u.userType] || ROLE_CONFIG.FOUNDER;
                const avColor = AVATAR_COLORS[u.userType] || 'from-gray-400 to-gray-600';
                const isConnected = connectedIds.has(u.id);
                const isSent = sentIds.has(u.id);
                return (
                  <div key={u.id}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col group">
                    {/* Card top gradient strip */}
                    <div className={`h-1.5 bg-gradient-to-r ${avColor}`} />
                    <div className="p-5 flex flex-col flex-1">
                      {/* Avatar */}
                      <div className="flex flex-col items-center mb-4">
                        {u.profileImageUrl ? (
                          <img src={u.profileImageUrl} className="w-16 h-16 rounded-2xl object-cover shadow-sm" alt="" />
                        ) : (
                          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${avColor} flex items-center justify-center text-white font-bold text-lg shadow-sm`}>
                            {initials(u)}
                          </div>
                        )}
                        <h3 className="font-semibold text-gray-900 text-sm mt-3 text-center leading-tight">{fullName(u)}</h3>
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border mt-1.5 ${cfg.bg} ${cfg.color}`}>
                          {cfg.icon}{cfg.label}
                        </span>
                      </div>
                      {u.bio && (
                        <p className="text-xs text-gray-500 text-center line-clamp-2 leading-relaxed mb-3 flex-1">{u.bio}</p>
                      )}
                      {/* Action */}
                      <div className="mt-auto">
                        {isConnected ? (
                          <div className="flex gap-2">
                            <div className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-50 text-green-700 rounded-xl text-xs font-semibold border border-green-200">
                              <Check size={12} /> Connected
                            </div>
                            <Link href={`/chat?userId=${u.id}`}
                              className="p-2 bg-blue-50 text-blue-600  border border-blue-200 hover:bg-blue-100 transition-colors">
                              <MessageSquare size={14} />
                            </Link>
                          </div>
                        ) : isSent ? (
                          <div className="w-full flex items-center justify-center gap-1.5 py-2 bg-gray-50 text-gray-500 text-xs font-medium border border-gray-200">
                            <Clock size={12} /> Pending
                          </div>
                        ) : (
                          <button onClick={() => sendReq(u.id)} disabled={actionLoading === u.id}
                            className="w-full btn-primary py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 disabled:opacity-60">
                            {actionLoading === u.id
                              ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent  animate-spin" />
                              : <><UserPlus size={13} /> Connect</>}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── MY NETWORK ── */}
      {tab === 'network' && (
        <div>
          {loading ? (
            <div className="grid md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                  <div className="flex gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-9 bg-gray-200 rounded-xl" />
                </div>
              ))}
            </div>
          ) : acceptedConns.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
              <Users size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-semibold">Your network is empty</p>
              <p className="text-gray-400 text-sm mt-1">Start by discovering people in the ecosystem</p>
              <button onClick={() => setTab('discover')}
                className="btn-primary px-5 py-2.5 rounded-xl text-sm mt-4">
                Discover People
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {acceptedConns.map(c => {
                const otherId = c.requesterId === myId ? c.recipientId : c.requesterId;
                const other = usersMap[otherId];
                const cfg = ROLE_CONFIG[other?.userType] || ROLE_CONFIG.FOUNDER;
                const avColor = AVATAR_COLORS[other?.userType] || 'from-gray-400 to-gray-600';
                return (
                  <div key={c.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                    <div className={`h-1.5 bg-gradient-to-r ${avColor}`} />
                    <div className="p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${avColor} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                          {initials(other)}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-gray-900">{fullName(other)}</div>
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                            {cfg.icon}{cfg.label}
                          </span>
                        </div>
                      </div>
                      <Link href={`/chat?userId=${otherId}`}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors">
                        <MessageSquare size={13} /> Message
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── REQUESTS ── */}
      {tab === 'requests' && (
        <div className="space-y-5">
          {received.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Received Requests ({received.length})</p>
              <div className="space-y-2">
                {received.map(req => {
                  const sender = usersMap[req.requesterId];
                  const cfg = ROLE_CONFIG[sender?.userType] || ROLE_CONFIG.FOUNDER;
                  const avColor = AVATAR_COLORS[sender?.userType] || 'from-gray-400 to-gray-600';
                  return (
                    <div key={req.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 hover:shadow-sm transition-all">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${avColor} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                        {initials(sender)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-gray-900">{fullName(sender)}</div>
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color} mt-0.5`}>
                          {cfg.icon}{cfg.label}
                        </span>
                        <p className="text-xs text-gray-400 mt-0.5">Wants to connect with you</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => accept(req.id)} disabled={actionLoading === req.id}
                          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors disabled:opacity-60">
                          {actionLoading === req.id
                            ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            : <><Check size={13} /> Accept</>}
                        </button>
                        <button onClick={() => reject(req.id)} disabled={actionLoading === req.id}
                          className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-500 rounded-xl text-xs hover:bg-gray-50 disabled:opacity-60">
                          <X size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {sentIds.size > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Sent Requests ({sentIds.size})</p>
              <div className="space-y-2">
                {pending.filter(p => p.requesterId === myId).map(req => {
                  const recipient = usersMap[req.recipientId];
                  const cfg = ROLE_CONFIG[recipient?.userType] || ROLE_CONFIG.FOUNDER;
                  const avColor = AVATAR_COLORS[recipient?.userType] || 'from-gray-400 to-gray-600';
                  return (
                    <div key={req.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${avColor} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                        {initials(recipient)}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-gray-900">{fullName(recipient)}</div>
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                          {cfg.icon}{cfg.label}
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                        <Clock size={11} /> Awaiting reply
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {received.length === 0 && sentIds.size === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
              <Clock size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-semibold">No pending requests</p>
              <p className="text-gray-400 text-sm mt-1">Connection requests you send or receive appear here</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
