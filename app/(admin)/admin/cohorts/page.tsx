'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Eye, EyeOff, BookOpen, Link as LinkIcon, X, Calendar } from 'lucide-react';
import api from '@/lib/api';
import FileUpload from '@/components/ui/FileUpload';

interface Week {
  weekNumber: number;
  topic: string;
  description: string;
}

interface Cohort {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  googleMeetLink?: string;
  startDate?: string;
  weeks?: Week[];
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  createdAt?: string;
}

type CohortStatus = Cohort['status'];

interface CohortForm {
  title: string;
  description: string;
  imageUrl: string;
  googleMeetLink: string;
  startDate: string;
  weeks: Week[];
  status: CohortStatus;
}

const EMPTY_COHORT: CohortForm = {
  title: '',
  description: '',
  imageUrl: '',
  googleMeetLink: '',
  startDate: '',
  weeks: [],
  status: 'DRAFT',
};

export default function AdminCohortsPage() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Cohort | null>(null);
  const [form, setForm] = useState<CohortForm>(EMPTY_COHORT);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'weeks'>('details');

  useEffect(() => {
    loadCohorts();
  }, []);

  const loadCohorts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/cohorts');
      setCohorts(res.data || []);
    } catch {
      toast.error('Failed to load cohorts');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_COHORT);
    setActiveTab('details');
    setShowModal(true);
  };

  const openEdit = (c: Cohort) => {
    setEditing(c);
    setForm({
      title: c.title,
      description: c.description,
      imageUrl: c.imageUrl || '',
      googleMeetLink: c.googleMeetLink || '',
      startDate: c.startDate || '',
      weeks: c.weeks || [],
      status: c.status,
    });
    setActiveTab('details');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.description) {
      toast.error('Title and description required');
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await api.put(`/api/cohorts/${editing.id}`, form);
        toast.success('Cohort updated');
      } else {
        await api.post('/api/cohorts', form);
        toast.success('Cohort created');
      }
      setShowModal(false);
      loadCohorts();
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (c: Cohort) => {
    try {
      const newStatus: CohortStatus = c.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await api.put(`/api/cohorts/${c.id}`, { ...c, status: newStatus });
      toast.success(`Cohort ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'}`);
      loadCohorts();
    } catch {
      toast.error('Status update failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this cohort? This cannot be undone.')) return;
    try {
      await api.delete(`/api/cohorts/${id}`);
      toast.success('Cohort deleted');
      loadCohorts();
    } catch {
      toast.error('Delete failed');
    }
  };

  const addWeek = () => {
    const nextNum = (form.weeks?.length || 0) + 1;
    setForm((f) => ({
      ...f,
      weeks: [...f.weeks, { weekNumber: nextNum, topic: '', description: '' }],
    }));
  };

  const updateWeek = (i: number, field: keyof Week, value: string | number) => {
    const weeks = [...form.weeks];
    weeks[i] = { ...weeks[i], [field]: value } as Week;
    setForm((f) => ({ ...f, weeks }));
  };

  const removeWeek = (i: number) => {
    setForm((f) => ({
      ...f,
      weeks: f.weeks.filter((_, idx) => idx !== i),
    }));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Cohorts</h1>
          <p className="text-gray-500 text-sm">{cohorts.length} cohorts total</p>
        </div>
        <button onClick={openCreate} className="btn-cta px-5 py-2.5 rounded-xl text-sm flex items-center gap-2">
          <Plus size={16} /> Create Cohort
        </button>
      </div>

      {/* Cohort cards */}
      {loading ? (
        <div className="grid md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
              <div className="h-36 bg-gray-200 rounded-lg mb-4" />
              <div className="h-5 bg-gray-200 rounded mb-2" />
              <div className="h-3 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : cohorts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
          <BookOpen size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No cohorts yet</p>
          <button onClick={openCreate} className="btn-primary px-5 py-2.5 rounded-xl text-sm mt-4">Create your first cohort</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {cohorts.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {c.imageUrl ? (
                <img src={c.imageUrl} alt={c.title} className="w-full h-36 object-cover" />
              ) : (
                <div className="h-36 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                  <BookOpen size={36} className="text-white/50" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight">{c.title}</h3>
                  <span className={`badge ml-2 flex-shrink-0 ${c.status === 'ACTIVE' ? 'badge-green' : c.status === 'DRAFT' ? 'badge-gray' : 'badge-red'}`}>
                    {c.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">{c.description}</p>

                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
                  <Calendar size={11} />
                  {c.weeks?.length || 0} weeks
                  {c.googleMeetLink && <><span className="mx-1">·</span><LinkIcon size={10} className="text-blue-500" /><span className="text-blue-500">Meet link</span></>}
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(c)} className="flex-1 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1">
                    <Edit size={12} /> Edit
                  </button>
                  <button onClick={() => handleToggleStatus(c)} className={`p-1.5 rounded-lg border text-xs ${c.status === 'ACTIVE' ? 'border-red-200 text-red-500 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}>
                    {c.status === 'ACTIVE' ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-display font-bold text-xl text-gray-900">{editing ? 'Edit Cohort' : 'Create Cohort'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 px-6">
              {(['details', 'weeks'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`py-3 px-4 text-sm font-medium border-b-2 -mb-px capitalize transition-colors ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  {tab === 'weeks' ? `Week Program (${form.weeks?.length || 0})` : 'Cohort Details'}
                </button>
              ))}
            </div>

            <div className="p-6 space-y-4">
              {activeTab === 'details' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
                    <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input-field w-full px-4 py-2.5 rounded-xl text-sm" placeholder="Cohort title" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
                    <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="input-field w-full px-4 py-2.5 rounded-xl text-sm resize-none" placeholder="What will founders learn?" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
                    <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="input-field w-full px-4 py-2.5 rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Google Meet Link</label>
                    <input value={form.googleMeetLink} onChange={e => setForm(f => ({ ...f, googleMeetLink: e.target.value }))} className="input-field w-full px-4 py-2.5 rounded-xl text-sm" placeholder="https://meet.google.com/xxx-xxxx-xxx" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))} className="input-field w-full px-4 py-2.5 rounded-xl text-sm">
                      <option value="DRAFT">Draft</option>
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                  <FileUpload label="Cohort Cover Image" fieldName={`cohort_${editing?.id || 'new'}`} value={form.imageUrl} onChange={url => setForm(f => ({ ...f, imageUrl: url }))} accept="image/*" helpText="Recommended: 1200×630px" />
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">Define week-by-week content for this cohort</p>
                    <button onClick={addWeek} className="btn-primary px-3 py-1.5 rounded-lg text-xs flex items-center gap-1">
                      <Plus size={13} /> Add Week
                    </button>
                  </div>

                  {(form.weeks || []).length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
                      No weeks yet. Click "Add Week" to start.
                    </div>
                  ) : (
                    (form.weeks || []).map((week, i) => (
                      <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-blue-600">Week {week.weekNumber}</span>
                          <button onClick={() => removeWeek(i)} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Topic</label>
                          <input value={week.topic} onChange={e => updateWeek(i, 'topic', e.target.value)} className="input-field w-full px-3 py-2 rounded-lg text-sm" placeholder="e.g. Product-Market Fit" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                          <textarea value={week.description} onChange={e => updateWeek(i, 'description', e.target.value)} rows={2} className="input-field w-full px-3 py-2 rounded-lg text-sm resize-none" placeholder="What will be covered this week?" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 btn-cta py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (editing ? 'Save Changes' : 'Create Cohort')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
