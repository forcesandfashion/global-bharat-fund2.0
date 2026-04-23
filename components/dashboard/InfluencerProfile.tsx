'use client';
import { JSX, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { influencerApi } from '@/lib/api';
import ProfileStepper from './ProfileStepper';
import FileUpload from '../ui/FileUpload';

const STEPS = [
  { label: 'Personal Info', bit: 0 },
  { label: 'Identity & Docs', bit: 1 },
  { label: 'Social Media', bit: 2 },
  { label: 'Content & Charges', bit: 3 },
  { label: 'Declaration', bit: 4 },
];

export default function InfluencerProfile() {
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState<Record<string, string>>({});
  const { register, reset, getValues } = useForm();

  useEffect(() => {
    influencerApi.getProfile().then(res => {
      setProfile(res.data || {});
      reset(res.data || {});
      setFiles({
        panCardUrl: res.data?.panCardUrl || '',
        aadharCardUrl: res.data?.aadharCardUrl || '',
        profilePictureUrl: res.data?.profilePictureUrl || '',
        signatureUrl: res.data?.signatureUrl || '',
      });
    }).catch(() => {});
  }, []);

  const saveStep = async () => {
    setSaving(true);
    try {
      const data = { ...getValues(), ...files };
      await influencerApi.savePersonalInfo(data);
      toast.success('Saved!');
    } catch {
      toast.error('Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "input-field w-full px-4 py-2.5 rounded-xl text-sm";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";

  const stepForms: Record<number, JSX.Element> = {
    0: (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Full Name *</label><input {...register('applicantName')} className={inputCls} /></div>
          <div><label className={labelCls}>Stage / Creator Name</label><input {...register('stageName')} className={inputCls} placeholder="Your online handle / brand name" /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Date of Birth</label><input {...register('dateOfBirth')} type="date" className={inputCls} /></div>
          <div><label className={labelCls}>Nationality</label>
            <select {...register('nationality')} className={inputCls}>
              <option value="">Select...</option>
              <option value="INDIAN">Indian</option>
              <option value="NRI">NRI</option>
              <option value="FOREIGN">Foreign National</option>
            </select>
          </div>
        </div>
        <FileUpload label="Profile Picture" fieldName="profilePicture" value={files.profilePictureUrl} onChange={url => setFiles(f => ({ ...f, profilePictureUrl: url }))} accept="image/*" />
      </div>
    ),
    1: (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>PAN Number</label><input {...register('panNumber')} className={inputCls} /></div>
          <div><label className={labelCls}>Aadhar Number</label><input {...register('aadharNumber')} className={inputCls} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FileUpload label="PAN Card" fieldName="panCard" value={files.panCardUrl} onChange={url => setFiles(f => ({ ...f, panCardUrl: url }))} />
          <FileUpload label="Aadhar Card" fieldName="aadharCard" value={files.aadharCardUrl} onChange={url => setFiles(f => ({ ...f, aadharCardUrl: url }))} />
        </div>
        <div><label className={labelCls}>Bank Account Number</label><input {...register('bank.accountNumber')} className={inputCls} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Bank Name</label><input {...register('bank.bankName')} className={inputCls} /></div>
          <div><label className={labelCls}>IFSC Code</label><input {...register('bank.ifscCode')} className={inputCls} /></div>
        </div>
      </div>
    ),
    2: (
      <div className="space-y-4">
        <p className="text-sm text-gray-500">Add your social media handles and follower counts</p>
        {[
          { label: 'Instagram Handle', field: 'socialMedia.platforms[0].handle', followerField: 'socialMedia.platforms[0].followers', platform: 'Instagram' },
          { label: 'YouTube Channel', field: 'socialMedia.platforms[1].handle', followerField: 'socialMedia.platforms[1].followers', platform: 'YouTube' },
          { label: 'Twitter/X Handle', field: 'socialMedia.platforms[2].handle', followerField: 'socialMedia.platforms[2].followers', platform: 'Twitter' },
          { label: 'LinkedIn Profile', field: 'socialMedia.platforms[3].handle', followerField: 'socialMedia.platforms[3].followers', platform: 'LinkedIn' },
        ].map(p => (
          <div key={p.platform} className="grid grid-cols-3 gap-3 items-end">
            <div className="col-span-2">
              <label className={labelCls}>{p.label}</label>
              <input {...register(p.field as any)} className={inputCls} placeholder={`@username or URL`} />
            </div>
            <div>
              <label className={labelCls}>Followers</label>
              <input {...register(p.followerField as any)} type="number" className={inputCls} placeholder="e.g. 50000" />
            </div>
          </div>
        ))}
      </div>
    ),
    3: (
      <div className="space-y-4">
        <div><label className={labelCls}>Content Niches / Categories</label><input {...register('contentPreferences.niches')} className={inputCls} placeholder="e.g. Tech, Startup, Finance, Lifestyle" /></div>
        <div><label className={labelCls}>Content Formats</label><input {...register('contentPreferences.formats')} className={inputCls} placeholder="e.g. Reels, Videos, Blogs, Stories" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Sponsored Post Rate (USD)</label><input {...register('infulencerCharges.sponsoredPostRate')} type="number" className={inputCls} placeholder="e.g. 500" /></div>
          <div><label className={labelCls}>Story Rate (USD)</label><input {...register('infulencerCharges.storyRate')} type="number" className={inputCls} placeholder="e.g. 200" /></div>
          <div><label className={labelCls}>Video Rate (USD)</label><input {...register('infulencerCharges.videoRate')} type="number" className={inputCls} placeholder="e.g. 1500" /></div>
          <div><label className={labelCls}>Affiliate Commission %</label><input {...register('infulencerCharges.affiliateCommission')} type="number" className={inputCls} placeholder="e.g. 10" /></div>
        </div>
        <div><label className={labelCls}>Portfolio / Media Kit URL</label><input {...register('influencerPortfolios.mediaKitUrl')} className={inputCls} placeholder="https://..." /></div>
      </div>
    ),
    4: (
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Influencer Declaration</h3>
          {['My follower counts and engagement rates are accurate', 'I will only promote products I genuinely endorse', 'I comply with advertising disclosure regulations'].map(item => (
            <label key={item} className="flex items-start gap-3 mb-3">
              <input type="checkbox" className="mt-0.5 w-4 h-4 accent-blue-600" />
              <span className="text-sm text-gray-700">{item}</span>
            </label>
          ))}
        </div>
        <FileUpload label="Signature" fieldName="signature" value={files.signatureUrl} onChange={url => setFiles(f => ({ ...f, signatureUrl: url }))} accept="image/*" />
        <label className="flex items-start gap-2">
          <input {...register('declrationAccepted')} type="checkbox" className="mt-0.5 w-4 h-4 accent-blue-600" />
          <span className="text-sm text-gray-700">I accept the influencer declaration</span>
        </label>
      </div>
    ),
  };

  return (
    <ProfileStepper
      steps={STEPS} currentStep={currentStep} completedSteps={profile?.completedSteps || 0}
      onStepClick={setCurrentStep} title="Influencer Profile" subtitle="Build your presence and connect with innovative startups"
      progressPercent={profile?.progressPercent || 0} onSave={saveStep} saving={saving}
      canGoNext={currentStep < STEPS.length - 1} onNext={() => setCurrentStep(s => s + 1)} onPrev={() => setCurrentStep(s => Math.max(s - 1, 0))}
    >
      {stepForms[currentStep]}
    </ProfileStepper>
  );
}
