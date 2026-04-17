'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Rocket, Eye, EyeOff, Phone, Mail } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuth } from '@/store/auth';
import type { JwtResponse } from '@/lib/api';

type LoginMode = 'phone' | 'email';

interface FormData {
  identifier: string;
  password: string;
}

export default function LoginPage() {
  const [mode, setMode] = useState<LoginMode>('phone');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

    const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const loginPayload = mode === 'phone'
        ? { identifier: data.identifier, password: data.password }
        : { identifier: data.identifier, password: data.password };

      const res = await authApi.login(loginPayload);
      const jwtData: JwtResponse = res.data;

      // Fetch full user profile to get firstName/lastName
      let firstName = '';
      let lastName = '';
      try {
        const profileRes = await import('@/lib/api').then(m =>
          m.default.get('/api/users/profile', {
            headers: { Authorization: `Bearer ${jwtData.token}` }
          })
        );
        firstName = profileRes.data?.firstName || '';
        lastName = profileRes.data?.lastName || '';
      } catch { /* profile fetch optional */ }

      setUser({
        token: jwtData.token,
        userId: jwtData.id,
        email: jwtData.email,
        firstName,
        lastName,
        userType: jwtData.userType,
        roles: Array.isArray(jwtData.roles) ? jwtData.roles : [],
        onboardingStatus: jwtData.onboardingStatus,
        paymentCompleted: jwtData.paymentCompleted || false,
      });
      toast.success(`Welcome back!`);

      // Redirect based on roles
      const roles = Array.isArray(jwtData.roles) ? jwtData.roles : [];
      if (roles.includes('ROLE_SUPER_ADMIN')) router.push('/superadmin');
      else if (roles.includes('ROLE_ADMIN')) router.push('/admin');
      else router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Rocket size={20} className="text-white" />
            </div>
            <span className="font-display font-bold text-2xl text-gray-900">Nebula</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-500">Sign in to your account</p>
        </div>

        {/* Login mode toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => setMode('phone')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              mode === 'phone' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Phone size={15} />
            Mobile Number
          </button>
          <button
            onClick={() => setMode('email')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              mode === 'email' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Mail size={15} />
            Email
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {mode === 'phone' ? 'Mobile Number' : 'Email Address'}
            </label>
            <input
              {...register('identifier', { required: true })}
              type={mode === 'email' ? 'email' : 'tel'}
              className="input-field w-full px-4 py-3 rounded-xl text-sm"
              placeholder={mode === 'phone' ? '+91 98765 43210' : 'john@example.com'}
            />
            {errors.identifier && <p className="text-red-500 text-xs mt-1">This field is required</p>}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <Link href="/forgot-password" className="text-xs text-blue-600 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                {...register('password', { required: true })}
                type={showPassword ? 'text' : 'password'}
                className="input-field w-full px-4 py-3 rounded-xl text-sm pr-10"
                placeholder="Your password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">Password is required</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3.5 rounded-xl text-base flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4 text-xs text-gray-400">or</span>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-blue-600 font-semibold hover:underline">Sign up for free</Link>
        </p>

        <p className="text-center text-xs text-gray-400 mt-6">
          By signing in, you agree to our{' '}
          <Link href="/terms" className="hover:underline">Terms</Link> and{' '}
          <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
