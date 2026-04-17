'use client';
import { useEffect, useState } from 'react';
import { planApi } from '@/lib/api';
import { RefreshCw, Check, Package } from 'lucide-react';

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    planApi.getAll().then(r => setPlans(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Plans</h1>
          <p className="text-gray-500 text-sm">View subscription plans (manage in Super Admin)</p>
        </div>
        <button onClick={load} className="btn-primary px-4 py-2 rounded-xl text-sm flex items-center gap-2">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-8 bg-gray-200 rounded w-2/3 mb-3" />
              <div className="h-3 bg-gray-200 rounded mb-2" />
              <div className="h-3 bg-gray-200 rounded w-3/4" />
            </div>
          ))
        ) : plans.length === 0 ? (
          <div className="col-span-4 bg-white rounded-xl border border-gray-100 p-16 text-center">
            <Package size={36} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No plans configured. Add them in the Super Admin panel.</p>
          </div>
        ) : plans.map((plan) => (
          <div key={plan.id} className={`bg-white rounded-xl border-2 p-5 ${plan.active ? 'border-blue-200' : 'border-dashed border-gray-200 opacity-60'}`}>
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-display font-bold text-gray-900">{plan.name}</h3>
              <span className={`badge ${plan.active ? 'badge-green' : 'badge-gray'}`}>{plan.active ? 'Active' : 'Off'}</span>
            </div>
            <div className="font-display text-2xl font-bold text-blue-600 mb-1">
              ${plan.price}<span className="text-sm font-normal text-gray-400">/yr</span>
            </div>
            <p className="text-xs text-gray-500 mb-3 leading-relaxed">{plan.description}</p>
            {(plan.features || []).map((f: string) => (
              <div key={f} className="flex items-center gap-1.5 text-xs text-gray-600 mb-1">
                <Check size={11} className="text-green-500 flex-shrink-0" />{f}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
