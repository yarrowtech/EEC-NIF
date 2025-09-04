import React, { useEffect, useState } from 'react';

const Section = ({ title, children }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
    {children}
  </div>
);

const Input = ({ label, type = 'text', className = '', inputClassName = '', ...props }) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label className="text-sm text-gray-700">{label}</label>
    <input type={type} className={`border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${inputClassName}`} {...props} />
  </div>
);

const Select = ({ label, children, className = '', selectClassName = '', ...props }) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label className="text-sm text-gray-700">{label}</label>
    <select className={`border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${selectClassName}`} {...props}>
      {children}
    </select>
  </div>
);

const TextArea = ({ label, rows = 3, className = '', textareaClassName = '', ...props }) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label className="text-sm text-gray-700">{label}</label>
    <textarea rows={rows} className={`border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${textareaClassName}`} {...props} />
  </div>
);

const FileInput = ({ label, multiple = false, className = '', inputClassName = '', ...props }) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label className="text-sm text-gray-700">{label}</label>
    <input type="file" multiple={multiple} className={`border border-gray-300 rounded-lg px-3 py-2 bg-white ${inputClassName}`} {...props} />
  </div>
);

const Card = ({ title, description, children, onSubmit }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200">
    <div className="p-6 border-b border-gray-100">
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
    </div>
    <form className="p-6 space-y-6" onSubmit={onSubmit}>
      {children}
      <div className="flex justify-end gap-2">
        <button type="reset" className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Reset</button>
        <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white">Save</button>
      </div>
    </form>
  </div>
);

const NewAdd = ({ setShowAdminHeader }) => {
  useEffect(() => {
    setShowAdminHeader(true);
  }, []);

  // local states (minimal to avoid bloat; we collect via FormData on submit)
  const [tab, setTab] = useState('teacher');

  const handleSubmit = (e, kind) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    // Placeholder: log keys for now. Wire to API as needed.
    const entries = {};
    for (const [k, v] of data.entries()) entries[k] = v;
    console.log(`Submitting ${kind}`, entries);
    alert(`${kind} form captured. Implement API to persist.`);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">New Add</h1>
          <div className="bg-white rounded-lg border border-gray-200 p-1 flex">
            <button className={`px-3 py-1 rounded-md text-sm font-medium ${tab==='teacher'?'bg-purple-100 text-purple-700':'text-gray-600 hover:text-gray-800'}`} onClick={()=>setTab('teacher')}>Teacher</button>
            <button className={`px-3 py-1 rounded-md text-sm font-medium ${tab==='student'?'bg-purple-100 text-purple-700':'text-gray-600 hover:text-gray-800'}`} onClick={()=>setTab('student')}>Student</button>
            <button className={`px-3 py-1 rounded-md text-sm font-medium ${tab==='staff'?'bg-purple-100 text-purple-700':'text-gray-600 hover:text-gray-800'}`} onClick={()=>setTab('staff')}>Staff</button>
          </div>
        </div>

        {tab === 'teacher' && (
          <Card title="Add New Teacher" description="Capture personal, employment, and document details" onSubmit={(e)=>handleSubmit(e,'Teacher')}>
            <Section title="Personal Information">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input name="firstName" label="First Name" required />
                <Input name="lastName" label="Last Name" required />
                <Select name="gender" label="Gender" defaultValue="">
                  <option value="" disabled>-- Select --</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </Select>
                <Input name="dob" label="Date of Birth" type="date" />
                <Input name="email" label="Email" type="email" />
                <Input name="phone" label="Phone" type="tel" />
                <Input name="altPhone" label="Alt. Phone" type="tel" />
                <Input name="address1" label="Address Line 1" className="md:col-span-2" />
                <Input name="address2" label="Address Line 2" className="md:col-span-2" />
                <Input name="city" label="City" />
                <Input name="state" label="State" />
                <Input name="zip" label="ZIP/Postal Code" />
                <Input name="country" label="Country" />
                <FileInput name="photo" label="Photo" />
                <FileInput name="signature" label="Signature" />
              </div>
            </Section>

            <Section title="Employment Details">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input name="empId" label="Employee ID" />
                <Input name="designation" label="Designation" />
                <Input name="department" label="Department" />
                <Input name="joiningDate" label="Date of Joining" type="date" />
                <Input name="qualification" label="Highest Qualification" />
                <Input name="experienceYears" label="Experience (years)" type="number" min="0" />
                <Input name="salary" label="Salary (₹)" type="number" min="0" />
                <Input name="bankAccount" label="Bank Account No." />
                <Input name="ifsc" label="IFSC Code" />
                <Select name="shift" label="Work Shift" defaultValue="Day">
                  <option>Day</option>
                  <option>Evening</option>
                </Select>
              </div>
            </Section>

            <Section title="Documents">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FileInput name="idProof" label="ID Proof (Aadhaar/Passport)" />
                <FileInput name="addressProof" label="Address Proof" />
                <FileInput name="pan" label="PAN Card" />
                <FileInput name="cv" label="Resume/CV" />
                <FileInput name="qualificationCerts" label="Qualification Certificates" multiple />
                <FileInput name="experienceLetters" label="Experience Letters" multiple />
                <FileInput name="joiningLetter" label="Joining/Offer Letter" />
              </div>
              <TextArea name="notes" label="Notes" />
            </Section>
          </Card>
        )}

        {tab === 'student' && (
          <Card title="Add New Student" description="Personal, academic, documents, and health information" onSubmit={(e)=>handleSubmit(e,'Student')}>
            <Section title="Personal Information">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input name="firstName" label="First Name" required />
                <Input name="lastName" label="Last Name" required />
                <Select name="gender" label="Gender" defaultValue="">
                  <option value="" disabled>-- Select --</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </Select>
                <Input name="dob" label="Date of Birth" type="date" />
                <Input name="email" label="Email" type="email" />
                <Input name="phone" label="Phone" type="tel" />
                <Input name="address1" label="Address Line 1" className="md:col-span-2" />
                <Input name="address2" label="Address Line 2" className="md:col-span-2" />
                <Input name="city" label="City" />
                <Input name="state" label="State" />
                <Input name="zip" label="ZIP/Postal Code" />
                <FileInput name="photo" label="Photo" />
              </div>
            </Section>

            <Section title="Academic Details">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input name="admissionNo" label="Admission No." />
                <Select name="class" label="Class" defaultValue="">
                  <option value="" disabled>-- Select --</option>
                  {Array.from({length:12}, (_,i)=>i+1).map(n=> (
                    <option key={n} value={`Class ${n}`}>Class {n}</option>
                  ))}
                </Select>
                <Select name="section" label="Section" defaultValue="A">
                  {['A','B','C','D'].map(s => <option key={s}> {s} </option>)}
                </Select>
                <Input name="rollNo" label="Roll No." />
                <Input name="admissionDate" label="Date of Admission" type="date" />
                <Input name="previousSchool" label="Previous School" />
                <Input name="guardianName" label="Guardian Name" />
                <Input name="guardianRelation" label="Relation" />
                <Input name="guardianPhone" label="Guardian Phone" type="tel" />
                <Input name="guardianEmail" label="Guardian Email" type="email" />
              </div>
            </Section>

            <Section title="Documents">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FileInput name="birthCert" label="Birth Certificate" />
                <FileInput name="transferCert" label="Transfer Certificate" />
                <FileInput name="aadhaar" label="Aadhaar" />
                <FileInput name="addressProof" label="Address Proof" />
                <FileInput name="marksheet" label="Last Marksheet" />
                <FileInput name="photos" label="Recent Photos" multiple />
              </div>
            </Section>

            <Section title="Health Record">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select name="bloodGroup" label="Blood Group" defaultValue="">
                  <option value="" disabled>-- Select --</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <option key={b}>{b}</option>)}
                </Select>
                <Input name="allergies" label="Allergies" />
                <Input name="conditions" label="Medical Conditions" />
                <Input name="medications" label="Medications" />
                <Select name="disability" label="Disability" defaultValue="No">
                  <option>No</option>
                  <option>Yes</option>
                </Select>
                <Input name="doctorName" label="Doctor Name" />
                <Input name="doctorPhone" label="Doctor Phone" type="tel" />
                <Input name="emergencyName" label="Emergency Contact Name" />
                <Input name="emergencyPhone" label="Emergency Contact Phone" type="tel" />
                <Input name="insuranceProvider" label="Insurance Provider" />
                <Input name="policyNumber" label="Policy Number" />
                <FileInput name="vaccinationCard" label="Vaccination Card" />
              </div>
              <TextArea name="healthNotes" label="Health Notes" />
            </Section>
          </Card>
        )}

        {tab === 'staff' && (
          <Card title="Add New Staff" description="Personal, employment, and document details" onSubmit={(e)=>handleSubmit(e,'Staff')}>
            <Section title="Personal Information">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input name="firstName" label="First Name" required />
                <Input name="lastName" label="Last Name" required />
                <Select name="gender" label="Gender" defaultValue="">
                  <option value="" disabled>-- Select --</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </Select>
                <Input name="dob" label="Date of Birth" type="date" />
                <Input name="email" label="Email" type="email" />
                <Input name="phone" label="Phone" type="tel" />
                <Input name="address1" label="Address Line 1" className="md:col-span-2" />
                <Input name="city" label="City" />
                <Input name="state" label="State" />
                <Input name="zip" label="ZIP/Postal Code" />
                <FileInput name="photo" label="Photo" />
                <FileInput name="signature" label="Signature" />
              </div>
            </Section>

            <Section title="Employment Details">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input name="empId" label="Employee ID" />
                <Input name="role" label="Role" />
                <Input name="department" label="Department" />
                <Input name="joiningDate" label="Date of Joining" type="date" />
                <Input name="contractType" label="Contract Type" />
                <Input name="salary" label="Salary (₹)" type="number" min="0" />
                <Input name="bankAccount" label="Bank Account No." />
                <Input name="ifsc" label="IFSC Code" />
              </div>
            </Section>

            <Section title="Documents">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FileInput name="idProof" label="ID Proof" />
                <FileInput name="addressProof" label="Address Proof" />
                <FileInput name="policeVerification" label="Police Verification" />
                <FileInput name="offerLetter" label="Offer/Joining Letter" />
                <FileInput name="resume" label="Resume/CV" />
                <FileInput name="otherDocs" label="Other Documents" multiple />
              </div>
              <TextArea name="notes" label="Notes" />
            </Section>
          </Card>
        )}
      </div>
    </div>
  );
};

export default NewAdd;
