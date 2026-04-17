'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { userApi } from '@/lib/api';
import { Search, Filter, Ban, Eye, RefreshCw } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [blockModal, setBlockModal] = useState<{ userId: string; name: string } | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const [permanent, setPermanent] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    let result = users;
    if (search) result = result.filter(u =>
      `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
    );
    if (roleFilter !== 'ALL') result = result.filter(u => u.userType === roleFilter);
    setFiltered(result);
  }, [search, roleFilter, users]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await userApi.getAllUsers();
      setUsers(res.data || []);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  const handleBlock = async () => {
    if (!blockModal || !blockReason) return;
    try {
      await userApi.blockUser(blockModal.userId, blockReason, permanent);
      toast.success(`User ${permanent ? 'permanently ' : ''}blocked`);
      setBlockModal(null);
      setBlockReason('');
      loadUsers();
    } catch { toast.error('Block failed'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 text-sm">{users.length} total registered users</p>
        </div>
        <button onClick={loadUsers} className="btn-primary px-4 py-2 rounded-xl text-sm flex items-center gap-2">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search users..."
            className="input-field pl-9 pr-4 py-2 rounded-lg text-sm w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-400" />
          {['ALL', 'FOUNDER', 'INVESTOR', 'MENTOR', 'INFLUENCER'].map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${roleFilter === r ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className="text-left px-5 py-3">User</th>
                <th className="text-left px-5 py-3">Phone</th>
                <th className="text-left px-5 py-3">Role</th>
                <th className="text-left px-5 py-3">Payment</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Onboarding</th>
                <th className="text-left px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="border-t border-gray-50">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-5 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-gray-400 py-10 text-sm">No users found</td></tr>
              ) : (
                filtered.map((u) => (
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
                    <td className="px-5 py-3 text-sm text-gray-500">{u.phoneNumber || '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`badge ${
                        u.userType === 'FOUNDER' ? 'badge-blue' :
                        u.userType === 'INVESTOR' ? 'badge-green' :
                        u.userType === 'MENTOR' ? 'badge-orange' : 'badge-gray'
                      }`}>{u.userType}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`badge ${u.paymentCompleted ? 'badge-green' : 'badge-gray'}`}>
                        {u.paymentCompleted ? 'Paid' : 'Free'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`badge ${u.blocked ? 'badge-red' : u.active ? 'badge-green' : 'badge-gray'}`}>
                        {u.blocked ? 'Blocked' : u.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`badge ${u.onboardingStatus === 'COMPLETED' ? 'badge-green' : u.onboardingStatus === 'IN_PROGRESS' ? 'badge-orange' : 'badge-gray'}`}>
                        {u.onboardingStatus || 'PENDING'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors">
                          <Eye size={14} />
                        </button>
                        {!u.blocked && (
                          <button
                            onClick={() => setBlockModal({ userId: u.id, name: `${u.firstName} ${u.lastName}` })}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                          >
                            <Ban size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Block modal */}
      {blockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="font-display font-bold text-lg text-gray-900 mb-1">Block User</h3>
            <p className="text-gray-500 text-sm mb-4">Blocking <strong>{blockModal.name}</strong></p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason *</label>
                <textarea
                  value={blockReason}
                  onChange={e => setBlockReason(e.target.value)}
                  rows={3}
                  className="input-field w-full px-4 py-3 rounded-xl text-sm resize-none"
                  placeholder="Why are you blocking this user?"
                />
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={permanent} onChange={e => setPermanent(e.target.checked)} className="w-4 h-4 accent-red-600" />
                <span className="text-sm text-gray-700">Permanent block</span>
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setBlockModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleBlock} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700">Block User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
