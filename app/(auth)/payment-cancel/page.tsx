'use client';
import Link from 'next/link';
import { XCircle } from 'lucide-react';

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center max-w-md w-full shadow-sm">
        <XCircle size={56} className="text-orange-400 mx-auto mb-4" />
        <h2 className="font-display font-bold text-2xl text-gray-900 mb-2">Payment Cancelled</h2>
        <p className="text-gray-500 text-sm mb-6">
          You cancelled the PayPal checkout. No charge has been made.
          You can still access Nebula on the free plan.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/payment" className="btn-cta px-5 py-2.5 rounded-xl text-sm">Choose a Plan</Link>
          <Link href="/dashboard" className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
            Continue Free
          </Link>
        </div>
      </div>
    </div>
  );
}
