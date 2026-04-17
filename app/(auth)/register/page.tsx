'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  Rocket, Eye, EyeOff, ArrowRight, Zap, TrendingUp,
  Award, Users, Mail, Phone, CheckCircle, RefreshCw, Check
} from 'lucide-react';
import { authApi, otpApi } from '@/lib/api';
import { useAuth } from '@/store/auth';
import type { JwtResponse } from '@/lib/api';
import { setupRecaptcha, sendPhoneSmsOtp, verifyPhoneSmsOtp } from '@/lib/firebase';

type Step = 'form' | 'verify';

const ROLES = [
  { value:'FOUNDER',    label:'Founder',    icon:<Zap size={16}/>,        desc:'Building a startup',    color:'border-blue-200 bg-blue-50 text-blue-700' },
  { value:'INVESTOR',   label:'Investor',   icon:<TrendingUp size={16}/>,  desc:'Investing in startups', color:'border-green-200 bg-green-50 text-green-700' },
  { value:'MENTOR',     label:'Mentor',     icon:<Award size={16}/>,       desc:'Guiding founders',      color:'border-orange-200 bg-orange-50 text-orange-700' },
  { value:'INFLUENCER', label:'Influencer', icon:<Users size={16}/>,       desc:'Building audiences',    color:'border-purple-200 bg-purple-50 text-purple-700' },
];

function OtpBoxes({ id, value, onChange }: { id:string; value:string[]; onChange:(v:string[])=>void }) {
  const ch = (i:number, v:string) => {
    if(!/^\d*$/.test(v)) return;
    const n=[...value]; n[i]=v.slice(-1); onChange(n);
    if(v && i<5) document.getElementById(`${id}-${i+1}`)?.focus();
  };
  const kd = (i:number, e:React.KeyboardEvent) => {
    if(e.key==='Backspace' && !value[i] && i>0) document.getElementById(`${id}-${i-1}`)?.focus();
  };
  const paste = (e:React.ClipboardEvent) => {
    const d=e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6);
    if(d.length===6){onChange(d.split(''));document.getElementById(`${id}-5`)?.focus();}
    e.preventDefault();
  };
  return (
    <div className="flex gap-2" onPaste={paste}>
      {value.map((d,i)=>(
        <input key={i} id={`${id}-${i}`} type="text" inputMode="numeric" maxLength={1} value={d}
          onChange={e=>ch(i,e.target.value)} onKeyDown={e=>kd(i,e)}
          className={`w-11 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all ${
            d?'border-blue-500 bg-blue-50 text-blue-700':'border-gray-200 bg-gray-50'
          } focus:border-blue-500`} style={{height:'48px'}}/>
      ))}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [step, setStep] = useState<Step>('form');
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', phoneNumber:'', password:'', confirmPassword:'', userType:'' });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [loading, setLoading] = useState(false);

  // Email OTP state
  const [emailOtp, setEmailOtp] = useState(['','','','','','']);
  const [emailVerified, setEmailVerified] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);

  // Firebase Phone OTP state
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [phoneOtp, setPhoneOtp] = useState(['','','','','','']);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [sendingPhone, setSendingPhone] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [phoneSent, setPhoneSent] = useState(false);
  const recaptchaRef = useRef<HTMLDivElement>(null);

  const validate = () => {
    const e: Record<string,string> = {};
    if(!form.firstName.trim() || form.firstName.trim().length<2) e.firstName='At least 2 characters';
    if(!form.lastName.trim()  || form.lastName.trim().length<2)  e.lastName='At least 2 characters';
    if(!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email='Valid email required';
    if(!form.phoneNumber.trim() || form.phoneNumber.replace(/\D/g,'').length<10) e.phoneNumber='Valid phone number required';
    if(form.password.length<8) e.password='At least 8 characters';
    if(form.password!==form.confirmPassword) e.confirmPassword="Passwords don't match";
    if(!form.userType) e.userType='Please select your role';
    setErrors(e);
    return Object.keys(e).length===0;
  };

  const handleRegister = async () => {
    if(!validate()) return;
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      const res = await authApi.register({...payload, userType: form.userType as any});
      const jwt: JwtResponse = res.data;
      setUser({
        token: jwt.token, userId: jwt.id, email: form.email,
        firstName: form.firstName, lastName: form.lastName,
        userType: jwt.userType,
        roles: Array.isArray(jwt.roles) ? jwt.roles : [],
        onboardingStatus: jwt.onboardingStatus,
        paymentCompleted: false,
      });
      toast.success(`Welcome, ${form.firstName}! Check your email for verification codes 📧`);
      setStep('verify');
    } catch(err:any) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  // ── Email OTP ──────────────────────────────────────────────────────────────
  const handleVerifyEmail = async () => {
    const code = emailOtp.join('');
    if(code.length!==6){toast.error('Enter the 6-digit code');return;}
    setVerifyingEmail(true);
    try {
      await otpApi.verifyEmail(code);
      setEmailVerified(true);
      toast.success('Email verified ✅');
    } catch(e:any){toast.error(e.response?.data?.message||'Invalid email OTP');}
    finally{setVerifyingEmail(false);}
  };

  const handleResendEmail = async () => {
    setResendingEmail(true);
    try { await otpApi.sendEmailVerify(); toast.success('New code sent!'); }
    catch{toast.error('Failed to resend');}
    finally{setResendingEmail(false);}
  };

  // ── Firebase SMS OTP ───────────────────────────────────────────────────────
  const handleSendPhoneOtp = async () => {
    setSendingPhone(true);
    try {
      // Format phone number with country code if missing
      let phone = form.phoneNumber.trim();
      if (!phone.startsWith('+')) phone = '+91' + phone.replace(/\D/g,''); // default India
      const verifier = setupRecaptcha('recaptcha-container');
      const result = await sendPhoneSmsOtp(phone);
      setConfirmationResult(result);
      setPhoneSent(true);
      toast.success('SMS sent to ' + phone);
    } catch(err:any) {
      console.error('Firebase SMS error:', err);
      toast.error(err.message || 'Failed to send SMS. Check phone number format (+CountryCode...).');
    } finally { setSendingPhone(false); }
  };

  const handleVerifyPhone = async () => {
    if(!confirmationResult){toast.error('Request a code first');return;}
    const code = phoneOtp.join('');
    if(code.length!==6){toast.error('Enter the 6-digit code');return;}
    setVerifyingPhone(true);
    try {
      const idToken = await verifyPhoneSmsOtp(confirmationResult, code);
      // Verify with backend
      await otpApi.verifyFirebasePhone(idToken);
      setPhoneVerified(true);
      toast.success('Phone verified ✅');
    } catch(err:any) {
      const msg = err.response?.data?.message || err.message || 'Invalid code';
      toast.error(msg);
    } finally{setVerifyingPhone(false);}
  };

  const handleContinue = () => {
    if(!emailVerified || !phoneVerified){
      toast.error('Please verify both email and phone to continue');
      return;
    }
    router.push(form.userType==='FOUNDER' ? '/payment' : '/dashboard');
  };

  const inp = 'input-field w-full px-4 py-3 rounded-xl text-sm';

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 bg-gradient-to-br from-blue-600 to-blue-800 p-12 text-white">
        <div>
          <Link href="/" className="flex items-center gap-2 mb-16">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center"><Rocket size={18} className="text-white"/></div>
            <span className="font-display font-bold text-xl">Nebula</span>
          </Link>
          <h2 className="font-display text-4xl font-bold mb-4 leading-tight">Join the future of startups</h2>
          <p className="text-blue-100 text-lg leading-relaxed">Connect with founders, investors, mentors, and influencers all in one powerful platform.</p>
        </div>
        <div className="space-y-4">
          {[{s:'form',label:'Create Account',done:step!=='form'},{s:'verify',label:'Verify Identity',done:false},{s:'done',label:'Access Platform',done:false}].map((item,i)=>(
            <div key={item.s} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${item.done?'bg-green-400 text-white':step===item.s?'bg-white text-blue-600':'bg-white/20 text-white/60'}`}>
                {item.done?'✓':i+1}
              </div>
              <span className={`text-sm ${step===item.s?'text-white font-semibold':'text-blue-200'}`}>{item.label}</span>
            </div>
          ))}
        </div>
        <div className="text-blue-200 text-sm">© 2025 Nebula Accelerator</div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"><Rocket size={16} className="text-white"/></div>
            <span className="font-display font-bold text-lg text-gray-900">Nebula</span>
          </Link>

          {/* STEP 1: Form */}
          {step==='form' && (
            <>
              <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">Create account</h1>
              <p className="text-gray-500 mb-7">Start your journey with Nebula today</p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                    <input value={form.firstName} onChange={e=>setForm(f=>({...f,firstName:e.target.value}))} className={inp} placeholder="John"/>
                    {errors.firstName&&<p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                    <input value={form.lastName} onChange={e=>setForm(f=>({...f,lastName:e.target.value}))} className={inp} placeholder="Doe"/>
                    {errors.lastName&&<p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <input value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} type="email" className={inp} placeholder="john@example.com"/>
                  {errors.email&&<p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                  <input value={form.phoneNumber} onChange={e=>setForm(f=>({...f,phoneNumber:e.target.value}))} type="tel" className={inp} placeholder="+91 98765 43210"/>
                  {errors.phoneNumber&&<p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
                  <p className="text-xs text-gray-400 mt-1">Include country code e.g. +91 for India, +1 for US</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} type={showPw?'text':'password'} className={inp+' pr-10'} placeholder="Min. 8 characters"/>
                    <button type="button" onClick={()=>setShowPw(v=>!v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPw?<EyeOff size={15}/>:<Eye size={15}/>}
                    </button>
                  </div>
                  {errors.password&&<p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                  <input value={form.confirmPassword} onChange={e=>setForm(f=>({...f,confirmPassword:e.target.value}))} type="password" className={inp} placeholder="Repeat password"/>
                  {errors.confirmPassword&&<p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    {ROLES.map(role=>(
                      <button key={role.value} type="button" onClick={()=>setForm(f=>({...f,userType:role.value}))}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${form.userType===role.value?role.color+' border-current':'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
                        <div className="flex items-center gap-2 mb-0.5">{role.icon}<span className="font-semibold text-sm">{role.label}</span></div>
                        <div className="text-xs opacity-70">{role.desc}</div>
                      </button>
                    ))}
                  </div>
                  {errors.userType&&<p className="text-red-500 text-xs mt-1">{errors.userType}</p>}
                </div>
                <button onClick={handleRegister} disabled={loading} className="btn-cta w-full py-3.5 rounded-xl text-base flex items-center justify-center gap-2 disabled:opacity-60">
                  {loading?<span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>:<>Create Account <ArrowRight size={18}/></>}
                </button>
              </div>
              <p className="text-center text-sm text-gray-500 mt-6">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
              </p>
            </>
          )}

          {/* STEP 2: OTP Verification */}
          {step==='verify' && (
            <>
              <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">Verify your identity</h1>
              <p className="text-gray-500 mb-6">Enter the codes sent to your email and phone.</p>

              {/* Invisible reCAPTCHA for Firebase */}
              <div id="recaptcha-container" ref={recaptchaRef}/>

              <div className="space-y-5">
                {/* Email OTP */}
                <div className={`border-2 rounded-2xl p-5 transition-all ${emailVerified?'border-green-200 bg-green-50':'border-gray-200'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${emailVerified?'bg-green-500':'bg-blue-100'}`}>
                      {emailVerified?<Check size={16} className="text-white"/>:<Mail size={16} className="text-blue-600"/>}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900">Email Verification</p>
                      <p className="text-xs text-gray-500">{form.email}</p>
                    </div>
                    {emailVerified&&<span className="badge badge-green text-xs">Verified ✓</span>}
                  </div>
                  {!emailVerified&&(
                    <>
                      <p className="text-xs text-gray-500 mb-3">Enter the 6-digit code sent to your email:</p>
                      <OtpBoxes id="email-otp" value={emailOtp} onChange={setEmailOtp}/>
                      <div className="flex gap-2 mt-3">
                        <button onClick={handleVerifyEmail} disabled={verifyingEmail||emailOtp.join('').length!==6} className="btn-primary px-4 py-2 rounded-xl text-xs flex items-center gap-2 disabled:opacity-60">
                          {verifyingEmail&&<span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"/>}
                          Verify Email
                        </button>
                        <button onClick={handleResendEmail} disabled={resendingEmail} className="px-3 py-2 border border-gray-200 text-gray-500 rounded-xl text-xs hover:bg-gray-50 flex items-center gap-1 disabled:opacity-50">
                          <RefreshCw size={11} className={resendingEmail?'animate-spin':''}/>Resend
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Phone OTP (Firebase SMS) */}
                <div className={`border-2 rounded-2xl p-5 transition-all ${phoneVerified?'border-green-200 bg-green-50':'border-gray-200'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${phoneVerified?'bg-green-500':'bg-blue-100'}`}>
                      {phoneVerified?<Check size={16} className="text-white"/>:<Phone size={16} className="text-blue-600"/>}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900">Phone Verification</p>
                      <p className="text-xs text-gray-500">{form.phoneNumber} — SMS via Firebase</p>
                    </div>
                    {phoneVerified&&<span className="badge badge-green text-xs">Verified ✓</span>}
                  </div>
                  {!phoneVerified&&(
                    !phoneSent ? (
                      <button onClick={handleSendPhoneOtp} disabled={sendingPhone} className="btn-primary px-4 py-2 rounded-xl text-xs flex items-center gap-2 disabled:opacity-60">
                        {sendingPhone?<span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"/>:<Phone size={12}/>}
                        Send SMS Code
                      </button>
                    ) : (
                      <>
                        <p className="text-xs text-gray-500 mb-3">Enter the 6-digit SMS code:</p>
                        <OtpBoxes id="phone-otp" value={phoneOtp} onChange={setPhoneOtp}/>
                        <div className="flex gap-2 mt-3">
                          <button onClick={handleVerifyPhone} disabled={verifyingPhone||phoneOtp.join('').length!==6} className="btn-primary px-4 py-2 rounded-xl text-xs flex items-center gap-2 disabled:opacity-60">
                            {verifyingPhone&&<span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"/>}
                            Verify Phone
                          </button>
                          <button onClick={handleSendPhoneOtp} disabled={sendingPhone} className="px-3 py-2 border border-gray-200 text-gray-500 rounded-xl text-xs hover:bg-gray-50 flex items-center gap-1 disabled:opacity-50">
                            <RefreshCw size={11}/>Resend SMS
                          </button>
                        </div>
                      </>
                    )
                  )}
                </div>

                {/* Continue / Skip */}
                {emailVerified && phoneVerified ? (
                  <div className="text-center">
                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle size={28} className="text-green-600"/>
                    </div>
                    <p className="font-semibold text-gray-900 mb-1">All verified!</p>
                    <button onClick={handleContinue} className="btn-cta w-full py-3.5 rounded-xl text-base flex items-center justify-center gap-2">
                      {form.userType==='FOUNDER'?'Continue to Payment':'Go to Dashboard'} <ArrowRight size={18}/>
                    </button>
                  </div>
                ) : (
                  <div className="text-center pt-2 border-t border-gray-100">
                    <button onClick={()=>router.push(form.userType==='FOUNDER'?'/payment':'/dashboard')} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                      Skip for now — verify later in Settings
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
