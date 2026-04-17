'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Rocket, Check, ArrowRight, Clock, CreditCard, Shield, Zap, TrendingUp, Award, Star, AlertCircle } from 'lucide-react';
import { planApi, paymentApi } from '@/lib/api';
import { useAuth } from '@/store/auth';

interface BackendPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  durationMonths: number;
  features: string[];
  active: boolean;
}

// Static display config — prices come from backend
const PLAN_DISPLAY: Record<string, { icon: React.ReactNode; badge: string | null; color: string }> = {
  Starter:    { icon: <Zap size={22} className="text-blue-600"/>,       badge: null,           color: 'border-gray-200' },
  Growth:     { icon: <TrendingUp size={22} className="text-white"/>,   badge: 'Most Popular',  color: 'border-blue-500' },
  Pro:        { icon: <Award size={22} className="text-orange-600"/>,   badge: null,           color: 'border-gray-200' },
  Enterprise: { icon: <Star size={22} className="text-orange-600"/>,    badge: null,           color: 'border-gray-200' },
};

export default function PaymentPage() {
  const [plans, setPlans] = useState<BackendPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(true);
  const [skipping, setSkipping] = useState(false);
  const [plansError, setPlansError] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  // Redirect non-founders
  useEffect(() => {
    if (user && user.userType !== 'FOUNDER') {
      router.replace('/dashboard');
    }
  }, [user]);

  // Load plans from backend
  useEffect(() => {
    planApi.getAll()
      .then(res => {
        const activePlans: BackendPlan[] = (res.data || []).filter((p: BackendPlan) => p.active);
        setPlans(activePlans);
        // Pre-select Growth (or second plan, or first)
        const growth = activePlans.find(p => p.name.toLowerCase() === 'growth');
        if (growth) setSelectedPlanId(growth.id);
        else if (activePlans.length > 0) setSelectedPlanId(activePlans[0].id);
      })
      .catch(() => {
        setPlansError('Could not load plans. Please ensure the backend is running and plans are configured in the admin panel.');
      })
      .finally(() => setPlansLoading(false));
  }, []);

  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  const handlePayWithPayPal = async () => {
    if (!selectedPlanId || !selectedPlan) {
      toast.error('Please select a plan first');
      return;
    }
    setLoading(true);
    try {
      const res = await paymentApi.createOrder(selectedPlanId);
      const { approvalUrl } = res.data;
      if (approvalUrl) {
        // Redirect to PayPal checkout
        window.location.href = approvalUrl;
      } else {
        toast.error('PayPal did not return a checkout URL. Check backend configuration.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to initiate payment';
      toast.error(msg);
      console.error('[PayPal] createOrder error:', err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setSkipping(true);
    toast('You can upgrade anytime from your dashboard', { icon: '💡' });
    await new Promise(r => setTimeout(r, 400));
    router.push('/profile');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Rocket size={16} className="text-white"/>
            </div>
            <span className="font-display font-bold text-lg text-gray-900">Nebula</span>
          </Link>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Shield size={14} className="text-green-500"/>
            Secured by PayPal
          </div>
        </div>
      </div>

      {/* Progress steps */}
      <div className="bg-white border-b border-gray-100 py-4">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-3">
            {['Create Account', 'Verify Identity', 'Choose Plan', 'Complete Profile'].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  i < 2 ? 'bg-green-500 text-white' : i === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {i < 2 ? <Check size={14}/> : i + 1}
                </div>
                <span className={`text-sm font-medium ${i === 2 ? 'text-gray-900' : i < 2 ? 'text-green-600' : 'text-gray-400'}`}>{s}</span>
                {i < 3 && <div className="w-8 h-0.5 bg-gray-200 mx-1"/>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-gray-900 mb-3">Choose your plan</h1>
          <p className="text-gray-500 text-lg">Unlock the full Nebula experience. Cancel or change anytime.</p>
        </div>

        {/* Plans error */}
        {plansError && (
          <div className="max-w-lg mx-auto mb-8 bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle size={18} className="text-orange-500 flex-shrink-0 mt-0.5"/>
            <div>
              <p className="text-sm font-semibold text-orange-800">Plans not available</p>
              <p className="text-xs text-orange-600 mt-0.5">{plansError}</p>
            </div>
          </div>
        )}

        {/* Plans grid */}
        {plansLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                <div className="h-8 bg-gray-100 rounded mb-3 w-1/2"/>
                <div className="h-10 bg-gray-100 rounded mb-4 w-2/3"/>
                <div className="space-y-2">
                  {[...Array(4)].map((_, j) => <div key={j} className="h-3 bg-gray-100 rounded"/>)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {plans.map(plan => {
              const display = PLAN_DISPLAY[plan.name] || { icon: <Zap size={22}/>, badge: null, color: 'border-gray-200' };
              const isSelected = selectedPlanId === plan.id;
              const isPopular = display.badge === 'Most Popular';
              return (
                <div key={plan.id} onClick={() => setSelectedPlanId(plan.id)}
                  className={`relative bg-white rounded-2xl border-2 p-6 cursor-pointer transition-all duration-200 ${
                    isSelected ? 'border-blue-500 shadow-lg shadow-blue-100 scale-[1.02]' :
                    display.color + ' hover:border-blue-300 hover:shadow-md'
                  }`}>
                  {display.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {display.badge}
                    </div>
                  )}
                  {isSelected && (
                    <div className="absolute top-4 right-4 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check size={12} className="text-white"/>
                    </div>
                  )}
                  <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${isPopular ? 'bg-blue-600' : 'bg-gray-100'}`}>
                    {display.icon}
                  </div>
                  <h3 className="font-display font-bold text-xl text-gray-900 mb-1">{plan.name}</h3>
                  <div className="font-display text-3xl font-bold text-gray-900 mb-1">
                    ${plan.price}<span className="text-sm font-normal text-gray-500">/year</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-5 leading-relaxed">{plan.description}</p>
                  <ul className="space-y-2">
                    {(plan.features || []).map(f => (
                      <li key={f} className="flex items-start gap-2 text-xs text-gray-600">
                        <Check size={12} className="text-blue-500 mt-0.5 flex-shrink-0"/>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}

        {/* Payment box */}
        <div className="max-w-md mx-auto">
          {selectedPlan && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-700">Selected Plan</span>
                <span className="font-bold text-gray-900">{selectedPlan.name}</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium text-gray-700">Annual Total</span>
                <span className="font-display font-bold text-2xl text-gray-900">${selectedPlan.price}/yr</span>
              </div>
              <div className="h-px bg-gray-100 mb-4"/>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-5">
                <Shield size={12} className="text-green-500"/>
                Secured payment via PayPal · Cancel anytime
              </div>
              <button onClick={handlePayWithPayPal} disabled={loading || plans.length === 0}
                className="w-full bg-[#0070ba] hover:bg-[#005ea6] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-3 transition-all disabled:opacity-60">
                {loading
                  ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                  : <><CreditCard size={18}/>Pay with PayPal</>}
              </button>
            </div>
          )}

          {/* Skip */}
          <div className="text-center">
            <button onClick={handleSkip} disabled={skipping}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium mx-auto transition-colors">
              <Clock size={14}/>
              {skipping ? 'Redirecting...' : "Skip for now — I'll pay later"}
            </button>
            <p className="text-xs text-gray-400 mt-2">
              You can still explore Nebula on the free plan and upgrade anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
