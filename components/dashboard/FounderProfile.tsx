'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { founderApi } from '@/lib/api';
import ProfileStepper from './ProfileStepper';
import FileUpload from '../ui/FileUpload';

const STEPS = [
  { label: 'Personal Info', bit: 0 },
  { label: 'Identity & KYC', bit: 1 },
  { label: 'Address', bit: 2 },
  { label: 'Bank & GST', bit: 3 },
  { label: 'Pitch Deck', bit: 4 },
  { label: 'Declaration', bit: 5 },
];

export default function FounderProfile() {
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState<Record<string, string>>({});

  const { register, handleSubmit, reset, getValues } = useForm();

  useEffect(() => {
    founderApi.getProfile().then(res => {
      setProfile(res.data || {});
      reset(res.data || {});
      setFiles({
        panCardUrl: res.data?.panCardUrl || '',
        aadharCardUrl: res.data?.aadharCardUrl || '',
        proofOfAddressUrl: res.data?.proofOfAddressUrl || '',
        gstCertificateUrl: res.data?.gstCertificateUrl || '',
        pitchDeckVideoUrl: res.data?.pitchDeckVideoUrl || '',
        profilePictureUrl: res.data?.profilePictureUrl || '',
        signatureUrl: res.data?.signatureUrl || '',
      });
    }).catch(() => {});
  }, []);

  const saveStep = async () => {
    setSaving(true);
    try {
      const data = { ...getValues(), ...files };
      const bit = STEPS[currentStep].bit;
      const stepMap: Record<number, () => Promise<any>> = {
        0: () => founderApi.savePersonalInfo(data),
        1: () => founderApi.saveIdentity(data),
        2: () => founderApi.saveAddress(data),
        3: () => founderApi.saveBankGst(data),
        4: () => founderApi.savePitchDeck(data),
        5: () => founderApi.saveDeclaration(data),
      };
      const res = await stepMap[bit]?.();
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
  const fieldCls = "space-y-4";

  const stepForms: Record<number, JSX.Element> = {
    0: (
      <div className={fieldCls}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Applicant Name *</label>
            <input {...register('applicantName')} className={inputCls} placeholder="Full legal name" />
          </div>
          <div>
            <label className={labelCls}>Company Name *</label>
            <input {...register('compnayName')} className={inputCls} placeholder="Company name" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Date of Incorporation</label>
            <input {...register('dateOfIncorporation')} type="date" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Date of Birth</label>
            <input {...register('dateOfBirth')} type="date" className={inputCls} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Nationality</label>
            <input {...register('nationality')} className={inputCls} placeholder="e.g. Indian" />
          </div>
          <div>
            <label className={labelCls}>GST Number</label>
            <input {...register('gstNumber')} className={inputCls} placeholder="GST registration number" />
          </div>
        </div>
        <div>
          <label className={labelCls}>Profile Picture</label>
          <FileUpload label="" fieldName="profilePicture" value={files.profilePictureUrl} onChange={(url) => setFiles(f => ({ ...f, profilePictureUrl: url }))} accept="image/*" helpText="JPG, PNG up to 5MB" />
        </div>
      </div>
    ),
    1: (
      <div className={fieldCls}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>PAN Number *</label>
            <input {...register('panNumber')} className={inputCls} placeholder="ABCDE1234F" />
          </div>
          <div>
            <label className={labelCls}>Aadhar Number *</label>
            <input {...register('aadharNumber')} className={inputCls} placeholder="12-digit Aadhar number" />
          </div>
        </div>
        <div>
          <label className={labelCls}>TAN Number</label>
          <input {...register('tanNumber')} className={inputCls} placeholder="TAN number" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FileUpload label="PAN Card" fieldName="panCard" value={files.panCardUrl} onChange={(url) => setFiles(f => ({ ...f, panCardUrl: url }))} helpText="PDF or Image" />
          <FileUpload label="Aadhar Card" fieldName="aadharCard" value={files.aadharCardUrl} onChange={(url) => setFiles(f => ({ ...f, aadharCardUrl: url }))} helpText="PDF or Image" />
        </div>
        <div>
          <label className={labelCls}>Proof of Identity Type</label>
          <select {...register('proofOfIdentity')} className={inputCls}>
            <option value="">Select...</option>
            <option value="PAN">PAN Card</option>
            <option value="AADHAR">Aadhar Card</option>
            <option value="PASSPORT">Passport</option>
          </select>
        </div>
      </div>
    ),
    2: (
      <div className={fieldCls}>
        <p className="text-sm font-semibold text-gray-700">Correspondence Address</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Street Address</label>
            <input {...register('correspendenceAddress.street')} className={inputCls} placeholder="Street / House no." />
          </div>
          <div>
            <label className={labelCls}>City</label>
            <input {...register('correspendenceAddress.city')} className={inputCls} placeholder="City" />
          </div>
          <div>
            <label className={labelCls}>State</label>
            <input {...register('correspendenceAddress.state')} className={inputCls} placeholder="State" />
          </div>
          <div>
            <label className={labelCls}>PIN Code</label>
            <input {...register('correspendenceAddress.pinCode')} className={inputCls} placeholder="6-digit PIN" />
          </div>
        </div>
        <div>
          <label className={labelCls}>Country</label>
          <input {...register('correspendenceAddress.country')} className={inputCls} placeholder="Country" />
        </div>
        <div>
          <FileUpload label="Proof of Address" fieldName="proofOfAddress" value={files.proofOfAddressUrl} onChange={(url) => setFiles(f => ({ ...f, proofOfAddressUrl: url }))} helpText="Utility bill, bank statement, etc." />
        </div>
        <div className="flex items-center gap-2 pt-2">
          <input type="checkbox" id="sameAddr" className="w-4 h-4 accent-blue-600" />
          <label htmlFor="sameAddr" className="text-sm text-gray-600">Same as permanent address</label>
        </div>
      </div>
    ),
    3: (
      <div className={fieldCls}>
        <p className="text-sm font-semibold text-gray-700">Bank Details</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Bank Name</label>
            <input {...register('bank.bankName')} className={inputCls} placeholder="Bank name" />
          </div>
          <div>
            <label className={labelCls}>Account Number</label>
            <input {...register('bank.accountNumber')} className={inputCls} placeholder="Account number" />
          </div>
          <div>
            <label className={labelCls}>IFSC Code</label>
            <input {...register('bank.ifscCode')} className={inputCls} placeholder="IFSC code" />
          </div>
          <div>
            <label className={labelCls}>Account Holder Name</label>
            <input {...register('bank.accountHolderName')} className={inputCls} placeholder="Name on account" />
          </div>
        </div>
        <div className="pt-2 border-t border-gray-100">
          <p className="text-sm font-semibold text-gray-700 mb-3">GST Details</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>GST Number</label>
              <input {...register('gstNumber')} className={inputCls} placeholder="GST number" />
            </div>
            <div>
              <FileUpload label="GST Certificate" fieldName="gstCertificate" value={files.gstCertificateUrl} onChange={(url) => setFiles(f => ({ ...f, gstCertificateUrl: url }))} helpText="PDF format preferred" />
            </div>
          </div>
        </div>
      </div>
    ),
    4: (
      <div className={fieldCls}>
        <div>
          <label className={labelCls}>Pitch Deck Description *</label>
          <textarea {...register('pitchDeckDescription')} rows={4} className={inputCls + ' resize-none'} placeholder="Describe your startup, problem statement, solution, and traction..." />
        </div>
        <FileUpload label="Pitch Deck Video" fieldName="pitchDeckVideo" value={files.pitchDeckVideoUrl} onChange={(url) => setFiles(f => ({ ...f, pitchDeckVideoUrl: url }))} accept="video/*" helpText="MP4, MOV up to 100MB" />
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-sm font-semibold text-blue-800 mb-2">💡 Team Members</p>
          <p className="text-xs text-blue-600">Team members can be added after saving the basic pitch deck. Click save then use the team members section below.</p>
        </div>
      </div>
    ),
    5: (
      <div className={fieldCls}>
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Declaration</h3>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            I hereby declare that all the information provided is true and accurate to the best of my knowledge. I understand that any false information may result in disqualification from the Nebula Accelerator program.
          </p>
          <div className="space-y-3">
            {[
              'I confirm all information provided is accurate and true',
              'I agree to the Terms of Service and Privacy Policy',
              'I consent to background verification if required',
              'I understand this is a binding commitment to the program',
            ].map((item) => (
              <label key={item} className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" className="mt-0.5 w-4 h-4 accent-blue-600" />
                <span className="text-sm text-gray-700">{item}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <FileUpload label="Digital Signature" fieldName="signature" value={files.signatureUrl} onChange={(url) => setFiles(f => ({ ...f, signatureUrl: url }))} accept="image/*" helpText="Upload your signature image" />
        </div>
        <label className="flex items-start gap-3">
          <input {...register('declarationAccepted')} type="checkbox" className="mt-0.5 w-4 h-4 accent-blue-600" />
          <span className="text-sm text-gray-700">I accept all the terms above and confirm my declaration</span>
        </label>
      </div>
    ),
  };

  return (
    <ProfileStepper
      steps={STEPS}
      currentStep={currentStep}
      completedSteps={profile?.completedSteps || 0}
      onStepClick={setCurrentStep}
      title="Founder Profile"
      subtitle="Complete your profile to unlock cohorts and investor access"
      progressPercent={profile?.progressPercent || 0}
      onSave={saveStep}
      saving={saving}
      canGoNext={currentStep < STEPS.length - 1}
      onNext={() => setCurrentStep(s => Math.min(s + 1, STEPS.length - 1))}
      onPrev={() => setCurrentStep(s => Math.max(s - 1, 0))}
    >
      {stepForms[currentStep]}
    </ProfileStepper>
  );
}
