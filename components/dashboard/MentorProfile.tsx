'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { mentorApi } from '@/lib/api';
import ProfileStepper from './ProfileStepper';
import FileUpload from '../ui/FileUpload';

const STEPS = [
  { label: 'Personal Info', bit: 0 },
  { label: 'Identity & Docs', bit: 1 },
  { label: 'Address', bit: 2 },
  { label: 'Bank & GST', bit: 3 },
  { label: 'Professional Background', bit: 4 },
  { label: 'Declaration', bit: 5 },
];

export default function MentorProfile() {
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState<Record<string, string>>({});
  const { register, reset, getValues } = useForm();

  useEffect(() => {
    mentorApi.getProfile().then(res => {
      setProfile(res.data || {});
      reset(res.data || {});
      setFiles({
        panCardUrl: res.data?.panCardUrl || '',
        aadharCardUrl: res.data?.aadharCardUrl || '',
        gstCertificateUrl: res.data?.gstCertificateUrl || '',
        profilePictureUrl: res.data?.profilePictureUrl || '',
        signatureUrl: res.data?.signatureUrl || '',
      });
    }).catch(() => {});
  }, []);

  const saveStep = async () => {
    setSaving(true);
    try {
      const data = { ...getValues(), ...files };
      await mentorApi.savePersonalInfo(data);
      toast.success('Saved successfully!');
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
          <div><label className={labelCls}>Professional Title *</label><input {...register('professionalTitle')} className={inputCls} placeholder="e.g. CTO, Serial Entrepreneur" /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Company / Organisation</label><input {...register('companyName')} className={inputCls} /></div>
          <div><label className={labelCls}>Date of Birth</label><input {...register('dateOfBirth')} type="date" className={inputCls} /></div>
        </div>
        <div><label className={labelCls}>Nationality</label>
          <select {...register('nation')} className={inputCls}>
            <option value="">Select...</option>
            <option value="INDIAN">Indian</option>
            <option value="NRI">NRI</option>
            <option value="FOREIGN">Foreign National</option>
          </select>
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
        <div className="grid grid-cols-3 gap-4">
          <FileUpload label="PAN Card" fieldName="panCard" value={files.panCardUrl} onChange={url => setFiles(f => ({ ...f, panCardUrl: url }))} />
          <FileUpload label="Aadhar Card" fieldName="aadharCard" value={files.aadharCardUrl} onChange={url => setFiles(f => ({ ...f, aadharCardUrl: url }))} />
        </div>
      </div>
    ),
    2: (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Street</label><input {...register('correspondenceAddress.street')} className={inputCls} /></div>
          <div><label className={labelCls}>City</label><input {...register('correspondenceAddress.city')} className={inputCls} /></div>
          <div><label className={labelCls}>State</label><input {...register('correspondenceAddress.state')} className={inputCls} /></div>
          <div><label className={labelCls}>Country</label><input {...register('correspondenceAddress.country')} className={inputCls} /></div>
        </div>
      </div>
    ),
    3: (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Bank Name</label><input {...register('bank.bankName')} className={inputCls} /></div>
          <div><label className={labelCls}>Account Number</label><input {...register('bank.accountNumber')} className={inputCls} /></div>
          <div><label className={labelCls}>IFSC Code</label><input {...register('bank.ifscCode')} className={inputCls} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>GST Number</label><input {...register('gstNumber')} className={inputCls} /></div>
          <FileUpload label="GST Certificate" fieldName="gstCertificate" value={files.gstCertificateUrl} onChange={url => setFiles(f => ({ ...f, gstCertificateUrl: url }))} />
        </div>
        <div>
          <label className={labelCls}>Hourly Rate (USD)</label>
          <input {...register('charges.hourlyRate')} type="number" className={inputCls} placeholder="e.g. 150" />
        </div>
      </div>
    ),
    4: (
      <div className="space-y-4">
        <div><label className={labelCls}>Years of Experience</label><input {...register('professinalBackground.yearsOfExperience')} type="number" className={inputCls} /></div>
        <div><label className={labelCls}>Areas of Expertise</label><input {...register('professinalBackground.expertise')} className={inputCls} placeholder="e.g. Growth, Product, Marketing, Fundraising" /></div>
        <div><label className={labelCls}>Industries</label><input {...register('professinalBackground.industries')} className={inputCls} placeholder="e.g. SaaS, FinTech, EdTech" /></div>
        <div><label className={labelCls}>Bio / Mentor Statement</label><textarea {...register('professinalBackground.bio')} rows={4} className={inputCls + ' resize-none'} placeholder="Tell founders what you bring to the table..." /></div>
        <div><label className={labelCls}>LinkedIn URL</label><input {...register('contactDetails.linkedInUrl')} className={inputCls} placeholder="https://linkedin.com/in/yourprofile" /></div>
        <div><label className={labelCls}>Mentorship Focus Areas</label><input {...register('mentorshipPreferences.focusAreas')} className={inputCls} placeholder="e.g. MVP, Fundraising, Go-to-market" /></div>
      </div>
    ),
    5: (
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Mentor Declaration</h3>
          <p className="text-sm text-gray-600 mb-4">I agree to mentor cohort founders to the best of my abilities and maintain professional standards.</p>
          {['I confirm my expertise and qualifications are accurate', 'I agree to mentor at least 2 hours per cohort week', 'I accept the Nebula Code of Conduct'].map(item => (
            <label key={item} className="flex items-start gap-3 mb-3">
              <input type="checkbox" className="mt-0.5 w-4 h-4 accent-blue-600" />
              <span className="text-sm text-gray-700">{item}</span>
            </label>
          ))}
        </div>
        <FileUpload label="Signature" fieldName="signature" value={files.signatureUrl} onChange={url => setFiles(f => ({ ...f, signatureUrl: url }))} accept="image/*" />
        <label className="flex items-start gap-2">
          <input {...register('declrationAccepted')} type="checkbox" className="mt-0.5 w-4 h-4 accent-blue-600" />
          <span className="text-sm text-gray-700">I accept the mentor declaration</span>
        </label>
      </div>
    ),
  };

  return (
    <ProfileStepper
      steps={STEPS} currentStep={currentStep} completedSteps={profile?.completedSteps || 0}
      onStepClick={setCurrentStep} title="Mentor Profile" subtitle="Share your expertise and start mentoring the next generation of founders"
      progressPercent={profile?.progressPercent || 0} onSave={saveStep} saving={saving}
      canGoNext={currentStep < STEPS.length - 1} onNext={() => setCurrentStep(s => s + 1)} onPrev={() => setCurrentStep(s => Math.max(s - 1, 0))}
    >
      {stepForms[currentStep]}
    </ProfileStepper>
  );
}
