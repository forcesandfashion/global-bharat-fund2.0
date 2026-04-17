'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { paymentApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get('token');      // PayPal order ID
    const payerId = searchParams.get('PayerID') || '';

    if (!token) {
      setStatus('error');
      setMessage('Invalid payment session. No order token found.');
      return;
    }

    paymentApi.capturePayment(token, payerId)
      .then(() => {
        setStatus('success');
        setMessage('Your payment was successful! Your plan is now active.');
        toast.success('Payment successful! 🎉');
        setTimeout(() => router.push('/dashboard'), 3000);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Payment capture failed. Please contact support.');
        toast.error('Payment failed');
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center max-w-md w-full shadow-sm">
        {status === 'loading' && (
          <>
            <Loader size={48} className="text-blue-500 animate-spin mx-auto mb-4" />
            <h2 className="font-display font-bold text-xl text-gray-900 mb-2">Processing Payment</h2>
            <p className="text-gray-500 text-sm">Please wait while we confirm your payment with PayPal…</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
            <h2 className="font-display font-bold text-2xl text-gray-900 mb-2">Payment Successful! 🚀</h2>
            <p className="text-gray-500 text-sm mb-6">{message}</p>
            <p className="text-xs text-gray-400 mb-4">Redirecting to your dashboard in 3 seconds…</p>
            <Link href="/dashboard" className="btn-primary px-6 py-2.5 rounded-xl text-sm inline-block">
              Go to Dashboard
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle size={56} className="text-red-400 mx-auto mb-4" />
            <h2 className="font-display font-bold text-xl text-gray-900 mb-2">Payment Failed</h2>
            <p className="text-gray-500 text-sm mb-6">{message}</p>
            <div className="flex gap-3 justify-center">
              <Link href="/payment" className="btn-cta px-5 py-2.5 rounded-xl text-sm">Try Again</Link>
              <Link href="/dashboard" className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                Skip for Now
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
