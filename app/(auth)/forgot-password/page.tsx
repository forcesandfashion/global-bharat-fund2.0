'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Rocket, ArrowLeft, Eye, EyeOff, CheckCircle, RefreshCw, Mail } from 'lucide-react';
import axios from 'axios'; // Use raw axios — no auth header for public endpoints

type Step = 'request' | 'verify' | 'reset' | 'done';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

function OtpBoxes({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const change = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return;
    const n = [...value]; n[i] = v.slice(-1); onChange(n);
    if (v && i < 5) document.getElementById(`fp-otp-${i+1}`)?.focus();
  };
  const keydown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) document.getElementById(`fp-otp-${i-1}`)?.focus();
  };
  const paste = (e: React.ClipboardEvent) => {
    const d = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6);
    if (d.length === 6) { onChange(d.split('')); document.getElementById('fp-otp-5')?.focus(); }
    e.preventDefault();
  };
  return (
    <div className="flex gap-2 justify-center" onPaste={paste}>
      {value.map((d, i) => (
        <input key={i} id={`fp-otp-${i}`} type="text" inputMode="numeric" maxLength={1} value={d}
          onChange={e => change(i, e.target.value)} onKeyDown={e => keydown(i, e)}
          className={`w-12 text-center text-2xl font-bold rounded-xl border-2 outline-none transition-all ${
            d ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-gray-50'
          } focus:border-blue-500`}
          style={{ height: '56px' }}
          autoFocus={i === 0}
        />
      ))}
    </div>
  );
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('request');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState(['','','','','','']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // Use raw axios with NO Authorization header (public endpoints)
  const publicPost = (url: string, data: object) =>
    axios.post(`${API}${url}`, data, { headers: { 'Content-Type': 'application/json' } });

  const handleSendOtp = async () => {
    if (!identifier.trim()) { toast.error('Enter your email or phone number'); return; }
    setLoading(true);
    try {
      await publicPost('/api/otp/forgot-password', { identifier: identifier.trim() });
      toast.success('Reset code sent! Check your email.');
      setStep('verify');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send reset code. Please try again.');
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await publicPost('/api/otp/forgot-password', { identifier: identifier.trim() });
      toast.success('New code sent!');
    } catch { toast.error('Failed to resend'); }
    finally { setResending(false); }
  };

  const handleVerifyOtp = () => {
    const code = otp.join('');
    if (code.length !== 6) { toast.error('Enter the 6-digit code'); return; }
    setStep('reset');
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords don't match"); return; }
    setLoading(true);
    try {
      await publicPost('/api/otp/reset-password', {
        identifier: identifier.trim(),
        otp: otp.join(''),
        newPassword,
      });
      toast.success('Password reset successfully!');
      setStep('done');
      setTimeout(() => router.push('/login'), 2500);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Reset failed. The code may have expired.';
      toast.error(msg);
      // If OTP expired, go back to verify step
      if (msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('invalid')) {
        setStep('verify');
        setOtp(['','','','','','']);
      }
    } finally { setLoading(false); }
  };

  const steps = ['request', 'verify', 'reset'];
  const currentIdx = steps.indexOf(step);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-8 text-center">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Rocket size={28} className="text-white"/>
            </div>
            <h1 className="font-display font-bold text-2xl text-white">
              {step === 'request' ? 'Forgot Password' :
               step === 'verify' ? 'Enter Reset Code' :
               step === 'reset' ? 'New Password' :
               'Password Reset!'}
            </h1>
            <p className="text-blue-200 text-sm mt-1.5">
              {step === 'request' ? "Enter your email or phone number" :
               step === 'verify' ? `Code sent to ${identifier}` :
               step === 'reset' ? 'Choose a strong password' :
               'Redirecting to login…'}
            </p>
          </div>

          {/* Step progress */}
          <div className="flex items-center px-8 pt-5 gap-2">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                  currentIdx > i ? 'bg-green-500 text-white' :
                  step === s ? 'bg-blue-600 text-white' :
                  'bg-gray-200 text-gray-400'
                }`}>
                  {currentIdx > i ? <CheckCircle size={14}/> : i + 1}
                </div>
                {i < 2 && <div className={`flex-1 h-0.5 mx-1 ${currentIdx > i ? 'bg-green-400' : 'bg-gray-200'}`}/>}
              </div>
            ))}
          </div>

          <div className="px-8 py-6">
            {/* STEP 1 */}
            {step === 'request' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email or Phone Number</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input value={identifier} onChange={e => setIdentifier(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                      type="text" placeholder="you@example.com or +91..."
                      className="input-field w-full pl-10 pr-4 py-3 rounded-xl text-sm" autoFocus/>
                  </div>
                </div>
                <button onClick={handleSendOtp} disabled={loading}
                  className="btn-cta w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                  {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/> : 'Send Reset Code'}
                </button>
              </div>
            )}

            {/* STEP 2 */}
            {step === 'verify' && (
              <div className="space-y-5">
                <p className="text-sm text-gray-500 text-center">
                  Enter the 6-digit code we sent to <span className="font-semibold text-gray-800">{identifier}</span>
                </p>
                <OtpBoxes value={otp} onChange={setOtp}/>
                <button onClick={handleVerifyOtp} disabled={otp.join('').length !== 6}
                  className="btn-primary w-full py-3.5 rounded-xl font-semibold disabled:opacity-50">
                  Verify Code
                </button>
                <div className="flex items-center justify-center gap-2 text-sm">
                  <span className="text-gray-400">Didn't receive it?</span>
                  <button onClick={handleResend} disabled={resending}
                    className="text-blue-600 font-semibold hover:underline flex items-center gap-1 disabled:opacity-50">
                    {resending && <RefreshCw size={13} className="animate-spin"/>}
                    Resend code
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 'reset' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                  <div className="relative">
                    <input value={newPassword} onChange={e => setNewPassword(e.target.value)}
                      type={showPw ? 'text' : 'password'} placeholder="Min. 8 characters"
                      className="input-field w-full px-4 py-3 rounded-xl text-sm pr-10" autoFocus/>
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                  <input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    type="password" placeholder="Repeat password"
                    className="input-field w-full px-4 py-3 rounded-xl text-sm"/>
                  {confirmPassword && newPassword !== confirmPassword &&
                    <p className="text-red-500 text-xs mt-1">Passwords don't match</p>}
                </div>
                {/* Strength indicators */}
                <div className="space-y-1.5">
                  {[
                    { label: 'At least 8 characters', ok: newPassword.length >= 8 },
                    { label: 'Contains a number', ok: /\d/.test(newPassword) },
                    { label: 'Contains uppercase', ok: /[A-Z]/.test(newPassword) },
                  ].map(r => (
                    <div key={r.label} className={`flex items-center gap-2 text-xs ${r.ok ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${r.ok ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {r.ok ? '✓' : '·'}
                      </div>
                      {r.label}
                    </div>
                  ))}
                </div>
                <button onClick={handleResetPassword}
                  disabled={loading || newPassword.length < 8 || newPassword !== confirmPassword}
                  className="btn-cta w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                  {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/> : 'Reset Password'}
                </button>
              </div>
            )}

            {/* DONE */}
            {step === 'done' && (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-green-600"/>
                </div>
                <p className="font-semibold text-gray-900 text-lg mb-1">Password updated!</p>
                <p className="text-gray-500 text-sm">Redirecting to login…</p>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-5">
          <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1.5 justify-center">
            <ArrowLeft size={14}/> Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
