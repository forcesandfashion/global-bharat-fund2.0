'use client';
import { JSX, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { investorApi } from '@/lib/api';
import ProfileStepper from './ProfileStepper';
import FileUpload from '../ui/FileUpload';

const STEPS = [
  { label: 'Personal Info', bit: 0 },
  { label: 'Identity & Docs', bit: 1 },
  { label: 'Address', bit: 2 },
  { label: 'Bank & GST', bit: 3 },
  { label: 'Investment Profile', bit: 4 },
  { label: 'Declaration', bit: 5 },
];

export default function InvestorProfile() {
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState<Record<string, string>>({});
  const { register, reset, getValues } = useForm();

  useEffect(() => {
    investorApi.getProfile().then(res => {
      setProfile(res.data || {});
      reset(res.data || {});
      setFiles({
        panCardUrl: res.data?.panCardUrl || '',
        aadharCardUrl: res.data?.aadharCardUrl || '',
        passportUrl: res.data?.passportUrl || '',
        gstCertificateUrl: res.data?.gstCertificateUrl || '',
        signatureUrl: res.data?.signatureUrl || '',
      });
    }).catch(() => {});
  }, []);

  const saveStep = async () => {
    setSaving(true);
    try {
      const data = { ...getValues(), ...files };
      const stepMap: Record<number, () => Promise<any>> = {
        0: () => investorApi.savePersonalInfo(data),
        1: () => investorApi.saveIdentity(data),
        2: () => investorApi.saveAddress(data),
        3: () => investorApi.saveBankGst(data),
        4: () => investorApi.saveInvestmentProfile(data),
        5: () => investorApi.saveDeclaration(data),
      };
      const res = await stepMap[currentStep]?.();
      setProfile(res?.data || {});
      toast.success('Saved successfully!');
    } catch {
      toast.error('Save failed. Please try again.');
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
          <div><label className={labelCls}>Applicant Name *</label><input {...register('applicantName')} className={inputCls} placeholder="Full legal name" /></div>
          <div><label className={labelCls}>Investor Type</label>
            <select {...register('investorType')} className={inputCls}>
              <option value="">Select...</option>
              <option value="INDIVIDUAL">Individual</option>
              <option value="ANGEL">Angel Investor</option>
              <option value="VC">Venture Capitalist</option>
              <option value="FAMILY_OFFICE">Family Office</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Company Name</label><input {...register('companyName')} className={inputCls} placeholder="Company / Firm name" /></div>
          <div><label className={labelCls}>Date of Birth</label><input {...register('dateOfBirth')} type="date" className={inputCls} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Nationality</label>
            <select {...register('nation')} className={inputCls}>
              <option value="">Select...</option>
              <option value="INDIAN">Indian</option>
              <option value="NRI">NRI</option>
              <option value="FOREIGN">Foreign National</option>
            </select>
          </div>
          <div><label className={labelCls}>Nation of Residence</label><input {...register('nationOfResidence')} className={inputCls} placeholder="Country of residence" /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Investor Category</label>
            <select {...register('investorCategory')} className={inputCls}>
              <option value="">Select...</option>
              <option value="RETAIL">Retail</option>
              <option value="ACCREDITED">Accredited</option>
              <option value="INSTITUTIONAL">Institutional</option>
            </select>
          </div>
          <div><label className={labelCls}>Date of Incorporation</label><input {...register('dateOfIncorporation')} type="date" className={inputCls} /></div>
        </div>
      </div>
    ),
    1: (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>PAN Number</label><input {...register('panNumber')} className={inputCls} placeholder="ABCDE1234F" /></div>
          <div><label className={labelCls}>Aadhar Number</label><input {...register('aadharNumber')} className={inputCls} placeholder="12-digit number" /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Passport Number</label><input {...register('passportNumber')} className={inputCls} placeholder="Passport number" /></div>
          <div><label className={labelCls}>Passport Expiry</label><input {...register('passportExpiryDate')} type="date" className={inputCls} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Foreign Tax ID</label><input {...register('foreignTaxId')} className={inputCls} placeholder="Foreign tax identification" /></div>
          <div><label className={labelCls}>TAN Number</label><input {...register('tanNumber')} className={inputCls} placeholder="TAN number" /></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <FileUpload label="PAN Card" fieldName="panCard" value={files.panCardUrl} onChange={(url) => setFiles(f => ({ ...f, panCardUrl: url }))} />
          <FileUpload label="Aadhar Card" fieldName="aadharCard" value={files.aadharCardUrl} onChange={(url) => setFiles(f => ({ ...f, aadharCardUrl: url }))} />
          <FileUpload label="Passport" fieldName="passport" value={files.passportUrl} onChange={(url) => setFiles(f => ({ ...f, passportUrl: url }))} />
        </div>
      </div>
    ),
    2: (
      <div className="space-y-4">
        <p className="text-sm font-semibold text-gray-700">Correspondence Address</p>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Street</label><input {...register('correspondenceAddress.street')} className={inputCls} /></div>
          <div><label className={labelCls}>City</label><input {...register('correspondenceAddress.city')} className={inputCls} /></div>
          <div><label className={labelCls}>State</label><input {...register('correspondenceAddress.state')} className={inputCls} /></div>
          <div><label className={labelCls}>PIN Code</label><input {...register('correspondenceAddress.pinCode')} className={inputCls} /></div>
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
          <div><label className={labelCls}>Account Holder</label><input {...register('bank.accountHolderName')} className={inputCls} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>GST Number</label><input {...register('gstNumber')} className={inputCls} /></div>
          <FileUpload label="GST Certificate" fieldName="gstCertificate" value={files.gstCertificateUrl} onChange={(url) => setFiles(f => ({ ...f, gstCertificateUrl: url }))} />
        </div>
      </div>
    ),
    4: (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Min Ticket Size (USD)</label><input {...register('ticketSize.minAmount')} type="number" className={inputCls} placeholder="e.g. 50000" /></div>
          <div><label className={labelCls}>Max Ticket Size (USD)</label><input {...register('ticketSize.maxAmount')} type="number" className={inputCls} placeholder="e.g. 500000" /></div>
        </div>
        <div><label className={labelCls}>Preferred Sectors</label><input {...register('investmentPreferences.sectors')} className={inputCls} placeholder="e.g. SaaS, FinTech, HealthTech" /></div>
        <div><label className={labelCls}>Preferred Stage</label>
          <select {...register('investmentPreferences.stage')} className={inputCls}>
            <option value="">Select stage...</option>
            <option value="PRE_SEED">Pre-Seed</option>
            <option value="SEED">Seed</option>
            <option value="SERIES_A">Series A</option>
            <option value="SERIES_B">Series B+</option>
          </select>
        </div>
        <div><label className={labelCls}>Sources of Fund</label><input {...register('sourcesOfFund')} className={inputCls} placeholder="Business income, inheritance, etc." /></div>
        <label className="flex items-center gap-2">
          <input {...register('politicallyExposedPerson')} type="checkbox" className="w-4 h-4 accent-blue-600" />
          <span className="text-sm text-gray-700">I am a Politically Exposed Person (PEP)</span>
        </label>
      </div>
    ),
    5: (
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Investor Declaration</h3>
          <p className="text-sm text-gray-600 mb-4">I declare that all information provided is accurate, complete, and I am legally authorised to make investments as described.</p>
          {['All provided information is true and accurate', 'I comply with applicable investment regulations', 'I agree to anti-money laundering verification'].map(item => (
            <label key={item} className="flex items-start gap-3 mb-3 cursor-pointer">
              <input type="checkbox" className="mt-0.5 w-4 h-4 accent-blue-600" />
              <span className="text-sm text-gray-700">{item}</span>
            </label>
          ))}
        </div>
        <FileUpload label="Signature" fieldName="signature" value={files.signatureUrl} onChange={(url) => setFiles(f => ({ ...f, signatureUrl: url }))} accept="image/*" />
        <label className="flex items-start gap-2">
          <input {...register('declarationAccepted')} type="checkbox" className="mt-0.5 w-4 h-4 accent-blue-600" />
          <span className="text-sm text-gray-700">I accept the declaration</span>
        </label>
      </div>
    ),
  };

  return (
    <ProfileStepper
      steps={STEPS} currentStep={currentStep} completedSteps={profile?.completedSteps || 0}
      onStepClick={setCurrentStep} title="Investor Profile" subtitle="Complete your profile to access deal flow and founder connections"
      progressPercent={profile?.progressPercent || 0} onSave={saveStep} saving={saving}
      canGoNext={currentStep < STEPS.length - 1} onNext={() => setCurrentStep(s => s + 1)} onPrev={() => setCurrentStep(s => Math.max(s - 1, 0))}
    >
      {stepForms[currentStep]}
    </ProfileStepper>
  );
}
