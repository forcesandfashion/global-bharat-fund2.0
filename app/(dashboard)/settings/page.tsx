'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth';
import { userApi, otpApi } from '@/lib/api';
import { setupRecaptcha, sendPhoneSmsOtp, verifyPhoneSmsOtp } from '@/lib/firebase';
import toast from 'react-hot-toast';
import {
  Bell, Lock, User, Shield, Eye, EyeOff,
  Mail, Phone, CheckCircle, Trash2, AlertTriangle,
  RefreshCw, Check
} from 'lucide-react';

type Tab = 'profile' | 'security' | 'notifications' | 'danger';

/* ── Reusable 6-box OTP input ────────────────────────────────────────────── */
function OtpBoxes({
  id, value, onChange,
}: { id: string; value: string[]; onChange: (v: string[]) => void }) {
  const ch = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return;
    const n = [...value]; n[i] = v.slice(-1); onChange(n);
    if (v && i < 5) document.getElementById(`${id}-${i + 1}`)?.focus();
  };
  const kd = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[i] && i > 0)
      document.getElementById(`${id}-${i - 1}`)?.focus();
  };
  const paste = (e: React.ClipboardEvent) => {
    const d = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (d.length === 6) { onChange(d.split('')); document.getElementById(`${id}-5`)?.focus(); }
    e.preventDefault();
  };
  return (
    <div className="flex gap-2 my-3" onPaste={paste}>
      {value.map((d, i) => (
        <input key={i} id={`${id}-${i}`} type="text" inputMode="numeric"
          maxLength={1} value={d}
          onChange={e => ch(i, e.target.value)} onKeyDown={e => kd(i, e)}
          className={`w-11 text-center text-xl font-bold rounded-xl border-2 outline-none
            transition-all ${d ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-gray-50'}
            focus:border-blue-500`}
          style={{ height: 48 }}
        />
      ))}
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────────── */
export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('profile');
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);

  /* profile */
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName,  setLastName]  = useState(user?.lastName  || '');

  /* password change */
  const [newPw, setNewPw]         = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  /* email OTP */
  const [emailOtpSent,   setEmailOtpSent]   = useState(false);
  const [emailOtp,       setEmailOtp]        = useState<string[]>(['','','','','','']);
  const [sendingEOtp,    setSendingEOtp]     = useState(false);
  const [verifyingEmail, setVerifyingEmail]  = useState(false);

  /* phone OTP via Firebase SMS */
  const [phoneOtpSent,    setPhoneOtpSent]    = useState(false);
  const [phoneOtp,        setPhoneOtp]        = useState<string[]>(['','','','','','']);
  const [sendingPhoneOtp, setSendingPhoneOtp] = useState(false);
  const [verifyingPhone,  setVerifyingPhone]  = useState(false);
  const [confirmResult,   setConfirmResult]   = useState<any>(null);
  const recaptchaRef = useRef<HTMLDivElement>(null);

  /* delete account */
  const [deleteOtpSent,  setDeleteOtpSent]  = useState(false);
  const [deleteOtp,      setDeleteOtp]      = useState<string[]>(['','','','','','']);
  const [sendingDOtp,    setSendingDOtp]    = useState(false);
  const [deleting,       setDeleting]       = useState(false);
  const [deleteConfirm,  setDeleteConfirm]  = useState('');

  const inp = 'input-field w-full px-4 py-2.5 rounded-xl text-sm';

  /* ── handlers ─────────────────────────────────────────────────────────── */
  const saveProfile = async () => {
    setSaving(true);
    try { await userApi.updateProfile({ firstName, lastName }); toast.success('Saved!'); }
    catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  /* Email OTP */
  const sendEmailOtp = async () => {
    setSendingEOtp(true);
    try { await otpApi.sendEmailVerify(); setEmailOtpSent(true); toast.success('Code sent to your email!'); }
    catch { toast.error('Failed to send OTP'); }
    finally { setSendingEOtp(false); }
  };
  const verifyEmail = async () => {
    const code = emailOtp.join('');
    if (code.length !== 6) { toast.error('Enter 6-digit code'); return; }
    setVerifyingEmail(true);
    try {
      await otpApi.verifyEmail(code);
      toast.success('Email verified ✅');
      setEmailOtpSent(false); setEmailOtp(['','','','','','']);
    } catch (e: any) { toast.error(e.response?.data?.message || 'Invalid OTP'); }
    finally { setVerifyingEmail(false); }
  };

  /* Phone OTP via Firebase SMS */
  const sendPhoneOtp = async () => {
    setSendingPhoneOtp(true);
    try {
      const verifier = setupRecaptcha('settings-recaptcha');
      let phone = (user as any)?.phoneNumber || '';
      if (phone && !phone.startsWith('+')) phone = '+91' + phone.replace(/\D/g, '');
      if (!phone) { toast.error('No phone number on your account'); setSendingPhoneOtp(false); return; }
      const result = await sendPhoneSmsOtp(phone);
      setConfirmResult(result);
      setPhoneOtpSent(true);
      toast.success('SMS sent to ' + phone);
    } catch (err: any) {
      console.error('[Firebase phone]', err);
      toast.error(err.message || 'Failed to send SMS. Check your phone number includes country code.');
    } finally { setSendingPhoneOtp(false); }
  };
  const verifyPhone = async () => {
    if (!confirmResult) { toast.error('Request a code first'); return; }
    const code = phoneOtp.join('');
    if (code.length !== 6) { toast.error('Enter 6-digit code'); return; }
    setVerifyingPhone(true);
    try {
      const idToken = await verifyPhoneSmsOtp(confirmResult, code);
      await otpApi.verifyFirebasePhone(idToken);
      toast.success('Phone number verified ✅');
      setPhoneOtpSent(false); setPhoneOtp(['','','','','','']);
    } catch (e: any) {
      toast.error(e.response?.data?.message || e.message || 'Invalid code');
    } finally { setVerifyingPhone(false); }
  };

  /* Delete account */
  const sendDeleteOtp = async () => {
    setSendingDOtp(true);
    try { await otpApi.sendDeleteAccount(); setDeleteOtpSent(true); toast('Code sent to email', { icon: '⚠️' }); }
    catch { toast.error('Failed to send code'); }
    finally { setSendingDOtp(false); }
  };
  const deleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') { toast.error('Type DELETE to confirm'); return; }
    const code = deleteOtp.join('');
    if (code.length !== 6) { toast.error('Enter 6-digit code'); return; }
    setDeleting(true);
    try {
      await otpApi.confirmDelete(code);
      toast.success('Account deleted. Goodbye! 👋');
      logout(); router.push('/');
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setDeleting(false); }
  };

  /* ── Tabs config ──────────────────────────────────────────────────────── */
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile',       label: 'Profile',       icon: <User size={15}  /> },
    { id: 'security',      label: 'Security',      icon: <Lock size={15}  /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={15}  /> },
    { id: 'danger',        label: 'Danger Zone',   icon: <Trash2 size={15}/> },
  ];

  /* ── Render ───────────────────────────────────────────────────────────── */
  return (
    <div className="max-w-2xl space-y-6">
      {/* invisible recaptcha container */}
      <div id="settings-recaptcha" ref={recaptchaRef} />

      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account and preferences</p>
      </div>

      {/* Tab bar */}
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
              whitespace-nowrap transition-all flex-shrink-0 ${
              tab === t.id
                ? t.id === 'danger' ? 'bg-red-600 text-white shadow' : 'bg-white shadow-sm text-gray-900'
                : t.id === 'danger' ? 'text-red-500 hover:text-red-600' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* ── PROFILE TAB ─────────────────────────────────────────────────── */}
      {tab === 'profile' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Profile Information</h2>

          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600
              flex items-center justify-center text-white font-bold text-xl">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
              <p className="text-sm text-gray-500 capitalize">
                {user?.userType?.toLowerCase()} · {user?.email}
              </p>
            </div>
          </div>

          {/* Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
              <input value={firstName} onChange={e => setFirstName(e.target.value)} className={inp} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
              <input value={lastName} onChange={e => setLastName(e.target.value)} className={inp} />
            </div>
          </div>

          {/* ── Email verification ────────────────────────────────────────── */}
          <div className="border border-blue-200 bg-blue-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Mail size={16} className="text-blue-600" />
              <p className="text-sm font-semibold text-blue-800">Verify Your Email</p>
            </div>
            <p className="text-xs text-blue-600 mb-3">
              We&apos;ll send a 6-digit code to <strong>{user?.email}</strong>
            </p>
            {!emailOtpSent ? (
              <button onClick={sendEmailOtp} disabled={sendingEOtp}
                className="btn-primary px-4 py-2 rounded-xl text-xs flex items-center gap-2 disabled:opacity-60">
                {sendingEOtp && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                Send Email Code
              </button>
            ) : (
              <div>
                <OtpBoxes id="settings-email-otp" value={emailOtp} onChange={setEmailOtp} />
                <div className="flex gap-2">
                  <button onClick={verifyEmail}
                    disabled={verifyingEmail || emailOtp.join('').length !== 6}
                    className="btn-primary px-4 py-2 rounded-xl text-xs flex items-center gap-2 disabled:opacity-60">
                    {verifyingEmail && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    Verify Email
                  </button>
                  <button onClick={sendEmailOtp} disabled={sendingEOtp}
                    className="px-3 py-2 border border-blue-300 text-blue-600 rounded-xl
                      text-xs hover:bg-blue-100 flex items-center gap-1 disabled:opacity-50">
                    <RefreshCw size={11} className={sendingEOtp ? 'animate-spin' : ''} /> Resend
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Phone verification via Firebase SMS ──────────────────────── */}
          <div className="border border-orange-200 bg-orange-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Phone size={16} className="text-orange-600" />
              <p className="text-sm font-semibold text-orange-800">Verify Your Phone</p>
            </div>
            <p className="text-xs text-orange-600 mb-3">
              A real SMS will be sent to your registered phone via Firebase.
            </p>
            {!phoneOtpSent ? (
              <button onClick={sendPhoneOtp} disabled={sendingPhoneOtp}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl
                  text-xs font-semibold flex items-center gap-2 disabled:opacity-60 transition-colors">
                {sendingPhoneOtp
                  ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Phone size={13} />}
                Send SMS Code
              </button>
            ) : (
              <div>
                <p className="text-xs text-orange-600 mb-1">Enter the 6-digit SMS code:</p>
                <OtpBoxes id="settings-phone-otp" value={phoneOtp} onChange={setPhoneOtp} />
                <div className="flex gap-2">
                  <button onClick={verifyPhone}
                    disabled={verifyingPhone || phoneOtp.join('').length !== 6}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl
                      text-xs font-semibold flex items-center gap-2 disabled:opacity-60 transition-colors">
                    {verifyingPhone && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    Verify Phone
                  </button>
                  <button onClick={sendPhoneOtp} disabled={sendingPhoneOtp}
                    className="px-3 py-2 border border-orange-300 text-orange-600 rounded-xl
                      text-xs hover:bg-orange-100 flex items-center gap-1 disabled:opacity-50">
                    <RefreshCw size={11} /> Resend SMS
                  </button>
                </div>
              </div>
            )}
          </div>

          <button onClick={saveProfile} disabled={saving}
            className="btn-primary px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 disabled:opacity-60">
            {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            Save Changes
          </button>
        </div>
      )}

      {/* ── SECURITY TAB ─────────────────────────────────────────────────── */}
      {tab === 'security' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Change Password</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  className={inp + ' pr-10'} placeholder="Min. 8 characters" />
                <button onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
              <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                className={inp} placeholder="Repeat password" />
              {confirmPw && newPw !== confirmPw &&
                <p className="text-red-500 text-xs mt-1">Passwords don&apos;t match</p>}
            </div>
            <div className="space-y-1.5">
              {[
                { l: '8+ characters', ok: newPw.length >= 8 },
                { l: 'Contains number', ok: /\d/.test(newPw) },
                { l: 'Uppercase letter', ok: /[A-Z]/.test(newPw) },
              ].map(r => (
                <div key={r.l} className={`flex items-center gap-2 text-xs ${r.ok ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px]
                    ${r.ok ? 'bg-green-100' : 'bg-gray-100'}`}>{r.ok ? '✓' : '·'}</div>
                  {r.l}
                </div>
              ))}
            </div>
          </div>
          <button disabled={newPw !== confirmPw || newPw.length < 8}
            className="btn-primary px-6 py-2.5 rounded-xl text-sm disabled:opacity-50">
            Update Password
          </button>

          <div className="border-t border-gray-100 pt-4">
            <h3 className="font-semibold text-gray-700 text-sm mb-3">Active Sessions</h3>
            <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-900">Current Session</p>
                <p className="text-xs text-gray-400">Active now · Web browser</p>
              </div>
              <span className="badge badge-green text-xs">Active</span>
            </div>
          </div>
        </div>
      )}

      {/* ── NOTIFICATIONS TAB ───────────────────────────────────────────── */}
      {tab === 'notifications' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-5">Notification Preferences</h2>
          <div className="space-y-1">
            {[
              'New cohort announcements',
              'Connection requests',
              'New messages',
              'Payment confirmations',
              'Platform announcements',
              'Login alerts',
            ].map(item => (
              <div key={item}
                className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <p className="text-sm font-medium text-gray-800">{item}</p>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-10 h-5 bg-gray-200 rounded-full peer
                    peer-checked:after:translate-x-5
                    after:content-[''] after:absolute after:top-0.5 after:left-0.5
                    after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all
                    peer-checked:bg-blue-600" />
                </label>
              </div>
            ))}
          </div>
          <div className="pt-4">
            <button className="btn-primary px-6 py-2.5 rounded-xl text-sm">Save Preferences</button>
          </div>
        </div>
      )}

      {/* ── DANGER ZONE TAB ─────────────────────────────────────────────── */}
      {tab === 'danger' && (
        <div className="bg-white rounded-2xl border-2 border-red-200 p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle size={20} className="text-red-600" />
            </div>
            <div>
              <h2 className="font-semibold text-red-800">Danger Zone</h2>
              <p className="text-xs text-red-500">Irreversible actions — proceed with caution</p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-5 space-y-4">
            <div>
              <h3 className="font-semibold text-red-800 text-sm mb-1">Delete Account</h3>
              <p className="text-xs text-red-600 leading-relaxed">
                Permanently deactivates your account. All data, connections, and memberships
                will be removed. <strong>Cannot be undone.</strong>
              </p>
            </div>

            {!deleteOtpSent ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-red-700 mb-1.5">
                    Type <code className="bg-red-100 px-1 rounded font-mono">DELETE</code> to confirm
                  </label>
                  <input value={deleteConfirm}
                    onChange={e => setDeleteConfirm(e.target.value.toUpperCase())}
                    placeholder="DELETE"
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-red-200 bg-white
                      text-sm font-mono focus:border-red-400 focus:outline-none" />
                </div>
                <button onClick={sendDeleteOtp}
                  disabled={deleteConfirm !== 'DELETE' || sendingDOtp}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl
                    text-sm font-semibold disabled:opacity-50 flex items-center gap-2 transition-colors">
                  {sendingDOtp
                    ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <Trash2 size={15} />}
                  Send Deletion Code
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-red-600">
                  Enter the 6-digit code sent to <strong>{user?.email}</strong>:
                </p>
                <OtpBoxes id="settings-delete-otp" value={deleteOtp} onChange={setDeleteOtp} />
                <div className="flex gap-2">
                  <button onClick={deleteAccount}
                    disabled={deleting || deleteOtp.join('').length !== 6}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl
                      text-sm font-semibold disabled:opacity-50 flex items-center gap-2 transition-colors">
                    {deleting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    Permanently Delete Account
                  </button>
                  <button onClick={() => { setDeleteOtpSent(false); setDeleteOtp(['','','','','','']); }}
                    className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
