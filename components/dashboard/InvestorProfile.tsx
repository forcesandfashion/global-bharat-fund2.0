// 'use client';
// import { JSX, useEffect, useState } from 'react';
// import { useForm } from 'react-hook-form';
// import toast from 'react-hot-toast';
// import { investorApi } from '@/lib/api';
// import ProfileStepper from './ProfileStepper';
// import FileUpload from '../ui/FileUpload';

// const STEPS = [
//   { label: 'Personal Info', bit: 0 },
//   { label: 'Identity & Docs', bit: 1 },
//   { label: 'Address', bit: 2 },
//   { label: 'Bank & GST', bit: 3 },
//   { label: 'Investment Profile', bit: 4 },
//   { label: 'Declaration', bit: 5 },
// ];

// export default function InvestorProfile() {
//   const [currentStep, setCurrentStep] = useState(0);
//   const [profile, setProfile] = useState<any>({});
//   const [saving, setSaving] = useState(false);
//   const [files, setFiles] = useState<Record<string, string>>({});
//   const { register, reset, getValues } = useForm();

//   useEffect(() => {
//     investorApi.getProfile().then(res => {
//       setProfile(res.data || {});
//       reset(res.data || {});
//       setFiles({
//         panCardUrl: res.data?.panCardUrl || '',
//         aadharCardUrl: res.data?.aadharCardUrl || '',
//         passportUrl: res.data?.passportUrl || '',
//         gstCertificateUrl: res.data?.gstCertificateUrl || '',
//         signatureUrl: res.data?.signatureUrl || '',
//       });
//     }).catch(() => {});
//   }, []);

//   const saveStep = async () => {
//   setSaving(true);
//   try {
//     const data = { ...getValues(), ...files };
//     console.log('📤 Sending payload:', data); // Temporary debug log
//     const stepMap: Record<number, () => Promise<any>> = {
//       0: () => investorApi.savePersonalInfo(data),
//       1: () => investorApi.saveIdentity(data),
//       2: () => investorApi.saveAddress(data),
//       3: () => investorApi.saveBankGst(data),
//       4: () => investorApi.saveInvestmentProfile(data),
//       5: () => investorApi.saveDeclaration(data),
//     };
//     const res = await stepMap[currentStep]?.();
//     setProfile(res?.data || {});
//     toast.success('Saved successfully!');
//   } catch (error: any) {
//     console.error('❌ Save error:', error.response?.data || error.message);
//     toast.error(error.response?.data?.message || 'Save failed. Please check console for details.');
//   } finally {
//     setSaving(false);
//   }
// };

//   const inputCls = "input-field w-full px-4 py-2.5 rounded-xl text-sm";
//   const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";

//   const stepForms: Record<number, JSX.Element> = {
//     0: (
//       <div className="space-y-4">
//         <div className="grid grid-cols-2 gap-4">
//           <div><label className={labelCls}>Applicant Name *</label><input {...register('applicantName')} className={inputCls} placeholder="Full legal name" /></div>
//           <div><label className={labelCls}>Investor Type</label>
//             <select {...register('investorType')} className={inputCls}>
//               <option value="">Select...</option>
//               <option value="INDIVIDUAL">Individual</option>
//               <option value="ANGEL">Angel Investor</option>
//               <option value="VC">Venture Capitalist</option>
//               <option value="FAMILY_OFFICE">Family Office</option>
//             </select>
//           </div>
//         </div>
//         <div className="grid grid-cols-2 gap-4">
//           <div><label className={labelCls}>Company Name</label><input {...register('companyName')} className={inputCls} placeholder="Company / Firm name" /></div>
//           <div><label className={labelCls}>Date of Birth</label><input {...register('dateOfBirth')} type="date" className={inputCls} /></div>
//         </div>
//         <div className="grid grid-cols-2 gap-4">
//           <div><label className={labelCls}>Nationality</label>
//             <select {...register('nationality')} className={inputCls}>
//               <option value="">Select...</option>
//               <option value="INDIAN">Indian</option>
//               <option value="NRI">NRI</option>
//               <option value="FOREIGN">Foreign National</option>
//             </select>
//           </div>
//           <div><label className={labelCls}>Nation of Residence</label><input {...register('nationOfResidence')} className={inputCls} placeholder="Country of residence" /></div>
//         </div>
//         <div className="grid grid-cols-2 gap-4">
//           <div><label className={labelCls}>Investor Category</label>
//             <select {...register('investorCategory')} className={inputCls}>
//               <option value="">Select...</option>
//               <option value="RETAIL">Retail</option>
//               <option value="ACCREDITED">Accredited</option>
//               <option value="INSTITUTIONAL">Institutional</option>
//             </select>
//           </div>
//           <div><label className={labelCls}>Date of Incorporation</label><input {...register('dateOfIncorporation')} type="date" className={inputCls} /></div>
//         </div>
//       </div>
//     ),
//     1: (
//       <div className="space-y-4">
//         <div className="grid grid-cols-2 gap-4">
//           <div><label className={labelCls}>PAN Number</label><input {...register('panNumber')} className={inputCls} placeholder="ABCDE1234F" /></div>
//           <div><label className={labelCls}>Aadhar Number</label><input {...register('aadharNumber')} className={inputCls} placeholder="12-digit number" /></div>
//         </div>
//         <div className="grid grid-cols-2 gap-4">
//           <div><label className={labelCls}>Passport Number</label><input {...register('passportNumber')} className={inputCls} placeholder="Passport number" /></div>
//           <div><label className={labelCls}>Passport Expiry</label><input {...register('passportExpiryDate')} type="date" className={inputCls} /></div>
//         </div>
//         <div className="grid grid-cols-2 gap-4">
//           <div><label className={labelCls}>Foreign Tax ID</label><input {...register('foreignTaxId')} className={inputCls} placeholder="Foreign tax identification" /></div>
//           <div><label className={labelCls}>TAN Number</label><input {...register('tanNumber')} className={inputCls} placeholder="TAN number" /></div>
//         </div>
//         <div className="grid grid-cols-3 gap-4">
//           <FileUpload label="PAN Card" fieldName="panCard" value={files.panCardUrl} onChange={(url) => setFiles(f => ({ ...f, panCardUrl: url }))} />
//           <FileUpload label="Aadhar Card" fieldName="aadharCard" value={files.aadharCardUrl} onChange={(url) => setFiles(f => ({ ...f, aadharCardUrl: url }))} />
//           <FileUpload label="Passport" fieldName="passport" value={files.passportUrl} onChange={(url) => setFiles(f => ({ ...f, passportUrl: url }))} />
//         </div>
//       </div>
//     ),
//     2: (
//       <div className="space-y-4">
//         <p className="text-sm font-semibold text-gray-700">Correspondence Address</p>
//         <div className="grid grid-cols-2 gap-4">
//           <div><label className={labelCls}>Street</label><input {...register('correspondenceAddress.street')} className={inputCls} /></div>
//           <div><label className={labelCls}>City</label><input {...register('correspondenceAddress.city')} className={inputCls} /></div>
//           <div><label className={labelCls}>State</label><input {...register('correspondenceAddress.state')} className={inputCls} /></div>
//           <div><label className={labelCls}>PIN Code</label><input {...register('correspondenceAddress.pinCode')} className={inputCls} /></div>
//           <div><label className={labelCls}>Country</label><input {...register('correspondenceAddress.country')} className={inputCls} /></div>
//         </div>
//       </div>
//     ),
//     3: (
//       <div className="space-y-4">
//         <div className="grid grid-cols-2 gap-4">
//           <div><label className={labelCls}>Bank Name</label><input {...register('bank.bankName')} className={inputCls} /></div>
//           <div><label className={labelCls}>Account Number</label><input {...register('bank.accountNumber')} className={inputCls} /></div>
//           <div><label className={labelCls}>IFSC Code</label><input {...register('bank.ifscCode')} className={inputCls} /></div>
//           <div><label className={labelCls}>Account Holder</label><input {...register('bank.accountHolderName')} className={inputCls} /></div>
//         </div>
//         <div className="grid grid-cols-2 gap-4">
//           <div><label className={labelCls}>GST Number</label><input {...register('gstNumber')} className={inputCls} /></div>
//           <FileUpload label="GST Certificate" fieldName="gstCertificate" value={files.gstCertificateUrl} onChange={(url) => setFiles(f => ({ ...f, gstCertificateUrl: url }))} />
//         </div>
//       </div>
//     ),
//     4: (
//       <div className="space-y-4">
//         <div className="grid grid-cols-2 gap-4">
//           <div><label className={labelCls}>Min Ticket Size (USD)</label><input {...register('ticketSize.minAmount')} type="number" className={inputCls} placeholder="e.g. 50000" /></div>
//           <div><label className={labelCls}>Max Ticket Size (USD)</label><input {...register('ticketSize.maxAmount')} type="number" className={inputCls} placeholder="e.g. 500000" /></div>
//         </div>
//         <div><label className={labelCls}>Preferred Sectors</label><input {...register('investmentPreferences.sectors')} className={inputCls} placeholder="e.g. SaaS, FinTech, HealthTech" /></div>
//         <div><label className={labelCls}>Preferred Stage</label>
//           <select {...register('investmentPreferences.stage')} className={inputCls}>
//             <option value="">Select stage...</option>
//             <option value="PRE_SEED">Pre-Seed</option>
//             <option value="SEED">Seed</option>
//             <option value="SERIES_A">Series A</option>
//             <option value="SERIES_B">Series B+</option>
//           </select>
//         </div>
//         <div><label className={labelCls}>Sources of Fund</label><input {...register('sourcesOfFund')} className={inputCls} placeholder="Business income, inheritance, etc." /></div>
//         <label className="flex items-center gap-2">
//           <input {...register('politicallyExposedPerson')} type="checkbox" className="w-4 h-4 accent-blue-600" />
//           <span className="text-sm text-gray-700">I am a Politically Exposed Person (PEP)</span>
//         </label>
//       </div>
//     ),
//     5: (
//       <div className="space-y-4">
//         <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
//           <h3 className="font-semibold text-gray-900 mb-3">Investor Declaration</h3>
//           <p className="text-sm text-gray-600 mb-4">I declare that all information provided is accurate, complete, and I am legally authorised to make investments as described.</p>
//           {['All provided information is true and accurate', 'I comply with applicable investment regulations', 'I agree to anti-money laundering verification'].map(item => (
//             <label key={item} className="flex items-start gap-3 mb-3 cursor-pointer">
//               <input type="checkbox" className="mt-0.5 w-4 h-4 accent-blue-600" />
//               <span className="text-sm text-gray-700">{item}</span>
//             </label>
//           ))}
//         </div>
//         <FileUpload label="Signature" fieldName="signature" value={files.signatureUrl} onChange={(url) => setFiles(f => ({ ...f, signatureUrl: url }))} accept="image/*" />
//         <label className="flex items-start gap-2">
//           <input {...register('declarationAccepted')} type="checkbox" className="mt-0.5 w-4 h-4 accent-blue-600" />
//           <span className="text-sm text-gray-700">I accept the declaration</span>
//         </label>
//       </div>
//     ),
//   };

//   return (
//     <ProfileStepper
//       steps={STEPS} currentStep={currentStep} completedSteps={profile?.completedSteps || 0}
//       onStepClick={setCurrentStep} title="Investor Profile" subtitle="Complete your profile to access deal flow and founder connections"
//       progressPercent={profile?.progressPercent || 0} onSave={saveStep} saving={saving}
//       canGoNext={currentStep < STEPS.length - 1} onNext={() => setCurrentStep(s => s + 1)} onPrev={() => setCurrentStep(s => Math.max(s - 1, 0))}
//     >
//       {stepForms[currentStep]}
//     </ProfileStepper>
//   );
// }

'use client';
import { JSX, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { investorApi } from '@/lib/api';
import ProfileStepper from './ProfileStepper';
import FileUpload from '../ui/FileUpload';

const STEPS = [
  { label: 'Personal Info',       bit: 0 },
  { label: 'Identity & Docs',     bit: 1 },
  { label: 'Address',             bit: 2 },
  { label: 'Bank & GST',          bit: 3 },
  { label: 'Investment Profile',  bit: 4 },
  { label: 'Declaration',         bit: 5 },
];

// ─── Helper: merge step bit into existing bitmask ─────────────────────────────
function setBit(mask: number, bit: number) { return mask | (1 << bit); }

export default function InvestorProfile() {
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile]     = useState<any>({});
  const [saving, setSaving]       = useState(false);

  // Each step keeps its own state so data is preserved across navigation
  const [personalInfo, setPersonalInfo] = useState({
    applicantName: '', investorType: '', investorCategory: '', companyName: '', dateOfIncorporation: '', dateOfBirth: '',
    nation: '', nationOfResidence: '',
  });
  const [identity, setIdentity] = useState({
    panNumber: '', aadharNumber: '', tanNumber: '',
    passportNumber: '', passportExpiryDate: '', foreignTaxId: '',
    panCardUrl: '', aadharCardUrl: '', passportUrl: '', visaNumber: '', visaUrl: ''
  });
  const [address, setAddress] = useState({
    addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', country: '',
  });
  const [bankGst, setBankGst] = useState({
    bankName: '', accountHolderName: '', accountNumber: '', ifscCode: '',
    gstNumber: '', gstCertificateUrl: '',
  });
  const [investment, setInvestment] = useState({
    sectorsText: '', stage: '', minTicket: '', maxTicket: '', sourcesOfFund: '',
  });
  const [declaration, setDeclaration] = useState({
    declarationAccepted: false, signatureUrl: '',
  });

  // Load existing profile
  useEffect(() => {
    investorApi.getProfile().then(res => {
      const d = res.data || {};
      setProfile(d);
      setPersonalInfo({
        applicantName: d.applicantName || '', investorType: d.investorType || '',
        companyName: d.companyName || '', dateOfBirth: d.dateOfBirth || '',
        dateOfIncorporation: d.dateOfIncorporation || '', nation: d.nationality || '',
        nationOfResidence: d.nationOfResidence || '', investorCategory: d.investorCategory || '',
      });
      setIdentity({
        panNumber: d.panNumber || '', aadharNumber: d.aadharNumber || '',
        tanNumber: d.tanNumber || '', passportNumber: d.passportNumber || '',
        passportExpiryDate: d.passportExpiryDate || '', foreignTaxId: d.foreignTaxId || '',
        panCardUrl: d.panCardUrl || '', aadharCardUrl: d.aadharCardUrl || '',
        passportUrl: d.passportUrl || '',
        visaNumber: d.visaNumber || '', visaUrl: d.visaUrl || '',
      });
      const addr = d.correspondenceAddress || {};
      setAddress({
        addressLine1: addr.addressLine1 || '', addressLine2: addr.addressLine2 || '',
        city: addr.city || '', state: addr.state || '',
        pincode: addr.pincode || '', country: addr.country || '',
      });
      const bank = d.bank || {};
      setBankGst({
        bankName: bank.bankName || '', accountHolderName: bank.accountHolderName || '',
        accountNumber: bank.accountNumber || '', ifscCode: bank.ifscCode || '',
        gstNumber: d.gstNumber || '', gstCertificateUrl: d.gstCertificateUrl || '',
      });
      const ip = d.investmentPreferences || {};
      setInvestment({
        sectorsText: (ip.sectors || []).join(', '),
        stage: (ip.stages || [])[0] || '',
        minTicket: d.ticketSize?.min || '',
        maxTicket: d.ticketSize?.max || '',
        sourcesOfFund: (d.sourcesOfFund || []).join(', '),
      });
      setDeclaration({
        declarationAccepted: d.declarationAccepted || false,
        signatureUrl: d.signatureUrl || '',
      });
    }).catch(() => {});
  }, []);

  // ── Build payload for each step ─────────────────────────────────────────────
  const buildPayload = (stepIndex: number) => {
    // Always include all current data + set the bit for this step
    const newMask = setBit(profile.completedSteps || 0, STEPS[stepIndex].bit);

    return {
      // Personal Info
      applicantName:   personalInfo.applicantName,
      investorType:    personalInfo.investorType,
      companyName:     personalInfo.companyName,
      dateOfBirth:     personalInfo.dateOfBirth || null,
      dateOfIncorporation: personalInfo.dateOfIncorporation || null,
      nationality:          personalInfo.nation|| null,
      nationOfResidence: personalInfo.nationOfResidence,
      investorCategory: personalInfo.investorCategory || null,

      // Identity
      panNumber:        identity.panNumber,
      aadharNumber:     identity.aadharNumber,
      tanNumber:        identity.tanNumber,
      passportNumber:   identity.passportNumber,
      passportExpiryDate: identity.passportExpiryDate || null,
      foreignTaxId:     identity.foreignTaxId,
      panCardUrl:       identity.panCardUrl,
      aadharCardUrl:    identity.aadharCardUrl,
      passportUrl:      identity.passportUrl,

      // Address — must match Address model field names
      correspondenceAddress: {
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city:         address.city,
        state:        address.state,
        pincode:      address.pincode,
        country:      address.country,
      },

      // Bank — must match Bank model field names
      bank: {
        bankName:          bankGst.bankName,
        accountHolderName: bankGst.accountHolderName,
        accountNumber:     bankGst.accountNumber,
        ifscCode:          bankGst.ifscCode,
      },
      gstNumber:           bankGst.gstNumber,
      gstCertificateUrl:   bankGst.gstCertificateUrl,

      // Investment preferences — must match InvestmentPreferences model
      investmentPreferences: {
        sectors: investment.sectorsText
          ? investment.sectorsText.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        stages:  investment.stage ? [investment.stage] : [],
      },
      ticketSize: {
        min:      investment.minTicket ? Number(investment.minTicket) : null,
        max:      investment.maxTicket ? Number(investment.maxTicket) : null,
        currency: 'USD',
      },
      // sourcesOfFund must be List<String>
      sourcesOfFund: investment.sourcesOfFund
        ? investment.sourcesOfFund.split(',').map(s => s.trim()).filter(Boolean)
        : [],

      // Declaration
      declarationAccepted: declaration.declarationAccepted,
      signatureUrl:        declaration.signatureUrl,

      // Bitmask — ALWAYS send this so progress accumulates
      completedSteps: newMask,
    };
  };

  const saveStep = async () => {
    setSaving(true);
    try {
      const payload = buildPayload(currentStep);
      const res = await investorApi.saveProfile(payload);
      setProfile(res.data || {});
      toast.success('Saved successfully!');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Save failed';
      toast.error(msg);
      console.error('[InvestorProfile] save error:', err.response?.data || err);
    } finally { setSaving(false); }
  };

  const ic = 'input-field w-full px-4 py-2.5 rounded-xl text-sm';
  const lc = 'block text-sm font-medium text-gray-700 mb-1.5';

  // ── Step forms ──────────────────────────────────────────────────────────────
  const stepForms: Record<number, JSX.Element> = {
    0: (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lc}>Applicant Name *</label>
            <input value={personalInfo.applicantName}
              onChange={e => setPersonalInfo(p => ({...p, applicantName: e.target.value}))}
              className={ic} placeholder="Full legal name"/>
          </div>
          <div>
            <label className={lc}>Investor Type</label>
            <select value={personalInfo.investorType}
              onChange={e => setPersonalInfo(p => ({...p, investorType: e.target.value}))}
              className={ic}>
              <option value="">Select...</option>
              <option value="INDIVIDUAL">Individual</option>
              <option value="ANGEL">Angel Investor</option>
              <option value="VC">Venture Capitalist</option>
              <option value="FAMILY_OFFICE">Family Office</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lc}>Company Name</label>
            <input value={personalInfo.companyName}
              onChange={e => setPersonalInfo(p => ({...p, companyName: e.target.value}))}
              className={ic} placeholder="Company or firm name"/>
          </div>
          <div>
            <label className={lc}>Date of Birth</label>
            <input type="date" value={personalInfo.dateOfBirth}
              onChange={e => setPersonalInfo(p => ({...p, dateOfBirth: e.target.value}))}
              className={ic}/>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lc}>Nationality</label>
            <select value={personalInfo.nation}
              onChange={e => setPersonalInfo(p => ({...p, nation: e.target.value}))}
              className={ic}>
              <option value="">Select...</option>
              <option value="INDIAN">Indian</option>
              <option value="NRI">NRI</option>
              <option value="FOREIGN">Foreign National</option>
            </select>
          </div>
          <div>
            <label className={lc}>Country of Residence</label>
            <input value={personalInfo.nationOfResidence}
              onChange={e => setPersonalInfo(p => ({...p, nationOfResidence: e.target.value}))}
              className={ic} placeholder="e.g. India"/>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lc}>Investor Category</label>
            <select value={personalInfo.investorCategory}
              onChange={e => setPersonalInfo(p => ({...p, investorCategory: e.target.value}))}
              className={ic}>
              <option value="">Select...</option>
              <option value="RETAIL">Retail</option>
              <option value="ACCREDITED">Accredited</option>
              <option value="INSTITUTIONAL">Institutional</option>
            </select>
          </div>
          <div>
            <label className={lc}>Date of Incorporation</label>
            <input type="date" value={personalInfo.dateOfIncorporation}
              onChange={e => setPersonalInfo(p => ({...p, dateOfIncorporation: e.target.value}))}
              className={ic}/>
          </div>
        </div>
      </div>
    ),

    1: (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lc}>PAN Number</label>
            <input value={identity.panNumber}
              onChange={e => setIdentity(p => ({...p, panNumber: e.target.value}))}
              className={ic} placeholder="ABCDE1234F"/>
          </div>
          <div>
            <label className={lc}>Aadhar Number</label>
            <input value={identity.aadharNumber}
              onChange={e => setIdentity(p => ({...p, aadharNumber: e.target.value}))}
              className={ic} placeholder="12-digit number"/>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lc}>Passport Number</label>
            <input value={identity.passportNumber}
              onChange={e => setIdentity(p => ({...p, passportNumber: e.target.value}))}
              className={ic} placeholder="Passport number"/>
          </div>
          <div>
            <label className={lc}>Passport Expiry</label>
            <input type="date" value={identity.passportExpiryDate}
              onChange={e => setIdentity(p => ({...p, passportExpiryDate: e.target.value}))}
              className={ic}/>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lc}>Foreign Tax ID</label>
            <input value={identity.foreignTaxId}
              onChange={e => setIdentity(p => ({...p, foreignTaxId: e.target.value}))}
              className={ic} placeholder="Foreign tax ID"/>
          </div>
          <div>
            <label className={lc}>TAN Number</label>
            <input value={identity.tanNumber}
              onChange={e => setIdentity(p => ({...p, tanNumber: e.target.value}))}
              className={ic} placeholder="TAN number"/>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <FileUpload label="PAN Card" fieldName="investor_pan"
            value={identity.panCardUrl}
            onChange={url => setIdentity(p => ({...p, panCardUrl: url}))}/>
          <FileUpload label="Aadhar Card" fieldName="investor_aadhar"
            value={identity.aadharCardUrl}
            onChange={url => setIdentity(p => ({...p, aadharCardUrl: url}))}/>
          <FileUpload label="Passport" fieldName="investor_passport"
            value={identity.passportUrl}
            onChange={url => setIdentity(p => ({...p, passportUrl: url}))}/>
        </div>
      </div>
    ),

    2: (
      <div className="space-y-4">
        <p className="text-sm font-semibold text-gray-700">Correspondence Address</p>
        <div>
          <label className={lc}>Address Line 1</label>
          <input value={address.addressLine1}
            onChange={e => setAddress(p => ({...p, addressLine1: e.target.value}))}
            className={ic} placeholder="Street / House number"/>
        </div>
        <div>
          <label className={lc}>Address Line 2</label>
          <input value={address.addressLine2}
            onChange={e => setAddress(p => ({...p, addressLine2: e.target.value}))}
            className={ic} placeholder="Apartment, suite, etc. (optional)"/>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lc}>City</label>
            <input value={address.city}
              onChange={e => setAddress(p => ({...p, city: e.target.value}))}
              className={ic}/>
          </div>
          <div>
            <label className={lc}>State</label>
            <input value={address.state}
              onChange={e => setAddress(p => ({...p, state: e.target.value}))}
              className={ic}/>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lc}>PIN / ZIP Code</label>
            <input value={address.pincode}
              onChange={e => setAddress(p => ({...p, pincode: e.target.value}))}
              className={ic}/>
          </div>
          <div>
            <label className={lc}>Country</label>
            <input value={address.country}
              onChange={e => setAddress(p => ({...p, country: e.target.value}))}
              className={ic} placeholder="India"/>
          </div>
        </div>
      </div>
    ),

    3: (
      <div className="space-y-4">
        <p className="text-sm font-semibold text-gray-700">Bank Details</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lc}>Bank Name</label>
            <input value={bankGst.bankName}
              onChange={e => setBankGst(p => ({...p, bankName: e.target.value}))}
              className={ic}/>
          </div>
          <div>
            <label className={lc}>Account Holder Name</label>
            <input value={bankGst.accountHolderName}
              onChange={e => setBankGst(p => ({...p, accountHolderName: e.target.value}))}
              className={ic}/>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lc}>Account Number</label>
            <input value={bankGst.accountNumber}
              onChange={e => setBankGst(p => ({...p, accountNumber: e.target.value}))}
              className={ic}/>
          </div>
          <div>
            <label className={lc}>IFSC Code</label>
            <input value={bankGst.ifscCode}
              onChange={e => setBankGst(p => ({...p, ifscCode: e.target.value}))}
              className={ic}/>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">GST Details</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lc}>GST Number</label>
              <input value={bankGst.gstNumber}
                onChange={e => setBankGst(p => ({...p, gstNumber: e.target.value}))}
                className={ic}/>
            </div>
            <FileUpload label="GST Certificate" fieldName="investor_gst"
              value={bankGst.gstCertificateUrl}
              onChange={url => setBankGst(p => ({...p, gstCertificateUrl: url}))}/>
          </div>
        </div>
      </div>
    ),

    4: (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lc}>Min Ticket Size (USD)</label>
            <input type="number" value={investment.minTicket}
              onChange={e => setInvestment(p => ({...p, minTicket: e.target.value}))}
              className={ic} placeholder="e.g. 50000"/>
          </div>
          <div>
            <label className={lc}>Max Ticket Size (USD)</label>
            <input type="number" value={investment.maxTicket}
              onChange={e => setInvestment(p => ({...p, maxTicket: e.target.value}))}
              className={ic} placeholder="e.g. 500000"/>
          </div>
        </div>
        <div>
          <label className={lc}>Preferred Sectors <span className="text-gray-400">(comma-separated)</span></label>
          <input value={investment.sectorsText}
            onChange={e => setInvestment(p => ({...p, sectorsText: e.target.value}))}
            className={ic} placeholder="e.g. SaaS, FinTech, HealthTech"/>
        </div>
        <div>
          <label className={lc}>Preferred Stage</label>
          <select value={investment.stage}
            onChange={e => setInvestment(p => ({...p, stage: e.target.value}))}
            className={ic}>
            <option value="">Select stage...</option>
            <option value="PRE_SEED">Pre-Seed</option>
            <option value="SEED">Seed</option>
            <option value="SERIES_A">Series A</option>
            <option value="SERIES_B">Series B+</option>
          </select>
        </div>
        <div>
          <label className={lc}>Sources of Fund <span className="text-gray-400">(comma-separated)</span></label>
          <input value={investment.sourcesOfFund}
            onChange={e => setInvestment(p => ({...p, sourcesOfFund: e.target.value}))}
            className={ic} placeholder="e.g. Business income, Inheritance, Savings"/>
        </div>
      </div>
    ),

    5: (
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Investor Declaration</h3>
          <p className="text-sm text-gray-600 mb-4">
            I declare that all information provided is accurate, complete, and I am legally
            authorised to make investments as described.
          </p>
          {[
            'All provided information is true and accurate',
            'I comply with applicable investment regulations',
            'I agree to anti-money laundering verification',
          ].map(item => (
            <label key={item} className="flex items-start gap-3 mb-3 cursor-pointer">
              <input type="checkbox" className="mt-0.5 w-4 h-4 accent-blue-600"/>
              <span className="text-sm text-gray-700">{item}</span>
            </label>
          ))}
        </div>
        <FileUpload label="Signature" fieldName="investor_signature"
          value={declaration.signatureUrl}
          onChange={url => setDeclaration(p => ({...p, signatureUrl: url}))}
          accept="image/*"/>
        <label className="flex items-start gap-2">
          <input type="checkbox"
            checked={declaration.declarationAccepted}
            onChange={e => setDeclaration(p => ({...p, declarationAccepted: e.target.checked}))}
            className="mt-0.5 w-4 h-4 accent-blue-600"/>
          <span className="text-sm text-gray-700">I accept the investor declaration</span>
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
      title="Investor Profile"
      subtitle="Complete your profile to access deal flow and founder connections"
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
