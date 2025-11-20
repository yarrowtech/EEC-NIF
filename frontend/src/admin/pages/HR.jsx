import React, { useEffect, useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import { FileText, Users, UserCheck, Building2, CalendarCheck, Plus, X, CreditCard } from 'lucide-react';
import IDCard from '../components/IDCard';

const HR = ({ setShowAdminHeader }) => {
  useEffect(() => { setShowAdminHeader(true); }, []);

  const [tab, setTab] = useState('payroll'); // payroll | vendors | attendance | employees | leaves | recruitment | policies | add-new
  const [salaryMonth, setSalaryMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  });

  // Mock data copied/adapted from FeesCollection Payments & Salaries
  const WORKING_DAYS = 26;
  const teachers = [
    { id: 't1', name: 'Prof. Priya Verma', designation: 'Physics', baseSalary: 55000 },
    { id: 't2', name: 'Dr. Arjun Sen', designation: 'Mathematics', baseSalary: 60000 },
    { id: 't3', name: 'Ms. Kavita Rao', designation: 'Chemistry', baseSalary: 52000 },
  ];
  const staff = [
    { id: 's1', name: 'Amit Kumar', role: 'Clerk', baseSalary: 28000 },
    { id: 's2', name: 'Neha Sharma', role: 'Librarian', baseSalary: 32000 },
  ];
  const vendors = [
    { id: 'v1', name: 'ABC Transport Co.', service: 'Bus Service', due: 75000 },
    { id: 'v2', name: 'Tech Supplies Ltd', service: 'IT Maintenance', due: 42000 },
  ];
  const teacherAttendance = { t1: { [salaryMonth]: 24 }, t2: { [salaryMonth]: 26 }, t3: { [salaryMonth]: 25 } };
  const staffAttendance = { s1: { [salaryMonth]: 25 }, s2: { [salaryMonth]: 24 } };
  const getAttendance = (empId, role, month) => (role==='teachers'? teacherAttendance[empId]?.[month] : staffAttendance[empId]?.[month]) ?? WORKING_DAYS;
  const computeNetPay = (baseSalary, presentDays) => {
    const perDay = baseSalary / WORKING_DAYS;
    const earnings = perDay * presentDays;
    const allowances = Math.round(baseSalary * 0.10);
    const net = Math.max(0, Math.round(earnings + allowances));
    return { perDay: Math.round(perDay), earnings: Math.round(earnings), allowances, net };
  };
  const generatePayslipPDF = (emp, role, month) => {
    const presentDays = getAttendance(emp.id, role, month);
    const { perDay, earnings, allowances, net } = computeNetPay(emp.baseSalary, presentDays);
    const doc = new jsPDF('p','pt','a4');
    const m = 48; let y = m;
    doc.setFont('helvetica','bold'); doc.setFontSize(18); doc.text('EEC Payslip', m, y); y+=14;
    doc.setFont('helvetica','normal'); doc.setFontSize(10); doc.text(`Month: ${month}`, m, y); y+=18;
    doc.setFont('helvetica','bold'); doc.text('Employee', m, y); y+=14; doc.setFont('helvetica','normal');
    doc.text(`Name: ${emp.name}`, m, y); y+=14;
    doc.text(`Role: ${emp.designation || emp.role || (role==='teachers'?'Teacher':'Staff')}`, m, y); y+=14;
    doc.text(`Employee ID: ${emp.id}`, m, y); y+=20;
    doc.setFont('helvetica','bold'); doc.text('Salary Summary', m, y); y+=14; doc.setFont('helvetica','normal');
    const lines = [
      ['Base Salary', `₹${emp.baseSalary.toLocaleString()}`],
      ['Working Days', `${WORKING_DAYS}`],
      ['Present Days', `${presentDays}`],
      ['Per Day', `₹${perDay.toLocaleString()}`],
      ['Earnings', `₹${earnings.toLocaleString()}`],
      ['Allowances (10%)', `₹${allowances.toLocaleString()}`],
      ['Net Pay', `₹${net.toLocaleString()}`],
    ];
    lines.forEach(([k,v]) => { doc.text(k, m, y); doc.text(v, 400, y, { align: 'right' }); y+=14; });
    y+=10; doc.setFont('helvetica','italic'); doc.text('System generated payslip', m, y);
    doc.save(`Payslip_${emp.name.replace(/\s+/g,'_')}_${month}.pdf`);
  };

  // HR Enhancements
  const [employees, setEmployees] = useState([...teachers.map(t=>({id:t.id,name:t.name,role:t.designation||'Teacher',type:'Teacher'})), ...staff.map(s=>({id:s.id,name:s.name,role:s.role||'Staff',type:'Staff'}))]);
  const [showAddEmp, setShowAddEmp] = useState(false);
  const [newEmp, setNewEmp] = useState({ name:'', role:'', type:'Teacher', baseSalary: '' });
  
  // ID Card functionality
  const [showIDCard, setShowIDCard] = useState(false);
  const [idCardData, setIdCardData] = useState(null);
  const [idCardType, setIdCardType] = useState('student');
  const idCardRef = useRef();
  const addEmployee = (e) => {
    e.preventDefault();
    if(!newEmp.name) return;
    const id = `${newEmp.type==='Teacher'?'t':'s'}${employees.length+1}`;
    setEmployees(prev=>[...prev,{ id, name:newEmp.name, role:newEmp.role, type:newEmp.type }]);
    setShowAddEmp(false); setNewEmp({ name:'', role:'', type:'Teacher', baseSalary:'' });
  };

  const [leaveRequests, setLeaveRequests] = useState([
    { id:'L1', emp:'Prof. Priya Verma', type:'CL', from:'2025-09-10', to:'2025-09-11', status:'Pending' },
    { id:'L2', emp:'Amit Kumar', type:'SL', from:'2025-09-09', to:'2025-09-09', status:'Pending' },
  ]);
  const updateLeave = (id, status) => setLeaveRequests(reqs => reqs.map(r => r.id===id?{...r,status}:r));

  const [jobs, setJobs] = useState([
    { id:'J1', title:'Science Teacher', openings:2, status:'Open' },
    { id:'J2', title:'Office Assistant', openings:1, status:'Open' },
  ]);
  const [candidates, setCandidates] = useState([
    { id:'C1', name:'Rohit Das', for:'Science Teacher', status:'Screening' },
    { id:'C2', name:'Meera N', for:'Office Assistant', status:'Interview' },
  ]);

  const [policies, setPolicies] = useState([
    { id:'P1', name:'Leave Policy.pdf', date:'2025-06-01' },
    { id:'P2', name:'Code of Conduct.pdf', date:'2025-05-12' },
  ]);
  const [uploadName, setUploadName] = useState('');
  const uploadPolicy = (e) => { e.preventDefault(); if(!uploadName) return; setPolicies(prev=>[{ id:`P${prev.length+1}`, name:uploadName, date:new Date().toISOString().slice(0,10) }, ...prev]); setUploadName(''); };

  // ID Card generation functions
  const generateIDCard = (personData, type) => {
    setIdCardData(personData);
    setIdCardType(type);
    setShowIDCard(true);
  };

  const downloadIDCardPDF = async () => {
    if (!idCardData) return;
    
    try {
      // Use the same dimensions as the visual card for consistency
      const pdf = new jsPDF('landscape', 'mm', [101.6, 63.5]); // Credit card size + margins
      
      // Helper function to load image as base64
      const loadImageAsBase64 = (url) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
          };
          img.onerror = () => resolve(null);
          img.src = url;
        });
      };

      // Generate QR data and get QR image
      const qrData = JSON.stringify({
        id: idCardData.empId || idCardData.admissionNo || `${idCardType.toUpperCase()}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        name: `${idCardData.firstName || ''} ${idCardData.lastName || ''}`.trim(),
        type: idCardType,
        school: 'Electronic Educare',
        issued: new Date().toISOString().split('T')[0],
        verification: Math.random().toString(36).substring(2, 15)
      });
      
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;
      
      // Header background gradient effect
      const headerColors = {
        student: [59, 130, 246],
        teacher: [34, 197, 94],
        staff: [147, 51, 234]
      };
      const [r, g, b] = headerColors[idCardType] || [100, 100, 100];
      
      // Header section with rounded corners effect
      pdf.setFillColor(r, g, b);
      pdf.roundedRect(3, 3, 95.6, 20, 3, 3, 'F');
      
      // Header gradient effect
      for (let i = 0; i < 20; i++) {
        const alpha = 1 - (i / 20) * 0.4;
        pdf.setFillColor(r * alpha, g * alpha, b * alpha);
        pdf.roundedRect(3, 3 + i, 95.6, 1, 3, 3, 'F');
      }
      
      // Header text
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ELECTRONIC EDUCARE', 50.8, 10, { align: 'center' });
      pdf.setFontSize(8);
      pdf.text(`${idCardType.toUpperCase()} ID CARD`, 50.8, 16, { align: 'center' });
      
      // EEC logo placeholder
      pdf.setFillColor(255, 255, 255, 0.3);
      pdf.circle(10, 13, 3, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(6);
      pdf.text('EEC', 10, 14, { align: 'center' });
      
      // Security hologram
      pdf.setFillColor(255, 215, 0);
      pdf.circle(90, 13, 2.5, 'F');
      pdf.setFillColor(255, 255, 255, 0.6);
      pdf.circle(90, 13, 1.5, 'F');
      
      // Main content area with background
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(3, 26, 95.6, 32, 2, 2, 'F');
      
      pdf.setTextColor(0, 0, 0);
      let y = 30;
      
      // Profile photo with modern styling
      let photoY = y;
      if (idCardData.photo) {
        try {
          const photoBase64 = await loadImageAsBase64(idCardData.photo);
          if (photoBase64) {
            // Add photo with rounded corner effect
            pdf.addImage(photoBase64, 'JPEG', 10, photoY, 20, 24);
            
            // Add border around photo
            pdf.setDrawColor(r, g, b);
            pdf.setLineWidth(0.5);
            pdf.roundedRect(10, photoY, 20, 24, 2, 2, 'D');
          } else {
            // Modern photo placeholder
            pdf.setDrawColor(r, g, b);
            pdf.setFillColor(248, 250, 252);
            pdf.roundedRect(10, photoY, 20, 24, 2, 2, 'FD');
            pdf.setFontSize(10);
            pdf.text('📷', 20, photoY + 10, { align: 'center' });
            pdf.setFontSize(7);
            pdf.text('PHOTO', 20, photoY + 16, { align: 'center' });
          }
        } catch (error) {
          // Fallback photo placeholder
          pdf.setDrawColor(r, g, b);
          pdf.setFillColor(248, 250, 252);
          pdf.roundedRect(10, photoY, 20, 24, 2, 2, 'FD');
          pdf.setFontSize(10);
          pdf.text('📷', 20, photoY + 10, { align: 'center' });
          pdf.setFontSize(7);
          pdf.text('PHOTO', 20, photoY + 16, { align: 'center' });
        }
      } else {
        // Modern photo placeholder
        pdf.setDrawColor(r, g, b);
        pdf.setFillColor(248, 250, 252);
        pdf.roundedRect(10, photoY, 20, 24, 2, 2, 'FD');
        pdf.setFontSize(10);
        pdf.text('📷', 20, photoY + 10, { align: 'center' });
        pdf.setFontSize(7);
        pdf.text('PHOTO', 20, photoY + 16, { align: 'center' });
      }
      
      // Personal details section
      const fullName = `${idCardData.firstName || ''} ${idCardData.lastName || ''}`.trim();
      const idNumber = idCardData.empId || idCardData.admissionNo || `${idCardType.toUpperCase()}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      
      // Name and ID
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(r, g, b);
      pdf.text(fullName, 35, y + 5);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      pdf.text(`ID: ${idNumber}`, 35, y + 11);
      
      // Role/Class specific information
      pdf.setFontSize(9);
      pdf.setTextColor(60, 60, 60);
      if (idCardType === 'student') {
        pdf.text(`Class ${idCardData.class || 'N/A'} • Section ${idCardData.section || 'A'}`, 35, y + 16);
        if (idCardData.rollNo) pdf.text(`Roll No: ${idCardData.rollNo}`, 35, y + 21);
      } else {
        const role = idCardData.designation || idCardData.role || (idCardType === 'teacher' ? 'Teacher' : 'Staff');
        pdf.text(role, 35, y + 16);
        if (idCardData.department) pdf.text(idCardData.department, 35, y + 21);
      }
      
      // Additional info
      if (idCardData.phone) {
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`📞 ${idCardData.phone}`, 35, y + 26);
      }
      
      // QR Code with modern styling
      try {
        const qrBase64 = await loadImageAsBase64(qrUrl);
        if (qrBase64) {
          pdf.addImage(qrBase64, 'PNG', 78, y, 18, 18);
          // Add border around QR
          pdf.setDrawColor(200, 200, 200);
          pdf.setLineWidth(0.3);
          pdf.roundedRect(78, y, 18, 18, 1, 1, 'D');
        } else {
          // Modern QR placeholder
          pdf.setDrawColor(200, 200, 200);
          pdf.setFillColor(250, 250, 250);
          pdf.roundedRect(78, y, 18, 18, 1, 1, 'FD');
          pdf.setFontSize(7);
          pdf.setTextColor(120, 120, 120);
          pdf.text('QR CODE', 87, y + 10, { align: 'center' });
        }
      } catch (error) {
        // Modern QR placeholder
        pdf.setDrawColor(200, 200, 200);
        pdf.setFillColor(250, 250, 250);
        pdf.roundedRect(78, y, 18, 18, 1, 1, 'FD');
        pdf.setFontSize(7);
        pdf.setTextColor(120, 120, 120);
        pdf.text('QR CODE', 87, y + 10, { align: 'center' });
      }
      
      // Footer with modern styling
      const currentYear = new Date().getFullYear();
      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(3, 61, 95.6, 8, 2, 2, 'F');
      
      pdf.setFontSize(7);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Valid: ${currentYear}-${currentYear + 1}`, 8, 65.5);
      pdf.text('🛡️ Authorized Personnel Only', 50.8, 65.5, { align: 'center' });
      pdf.text('Electronic Educare', 93, 65.5, { align: 'right' });
      
      // Modern border with rounded corners
      pdf.setDrawColor(r, g, b);
      pdf.setLineWidth(1);
      pdf.roundedRect(3, 3, 95.6, 57.5, 3, 3, 'D');
      
      pdf.save(`ID_Card_${idCardData.firstName}_${idCardData.lastName}_${idCardType}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const printIDCard = () => {
    if (!idCardRef.current) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>ID Card</title>
          <style>
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          ${idCardRef.current.outerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Add New functionality merged from NewAdd component
  const [addTab, setAddTab] = useState('teacher');
  const handleSubmit = (e, kind) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const entries = {};
    for (const [k, v] of data.entries()) entries[k] = v;
    console.log(`Submitting ${kind}`, entries);
    
    // Generate ID card after form submission
    if (confirm(`${kind} added successfully! Would you like to generate an ID card?`)) {
      generateIDCard(entries, kind.toLowerCase());
    }
    
    alert(`${kind} form captured. Implement API to persist.`);
  };

  // Form components for Add New section
  const Section = ({ title, children }) => (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
      <h4 className="text-md font-semibold text-gray-800 mb-3">{title}</h4>
      {children}
    </div>
  );

  const Input = ({ label, type = 'text', className = '', inputClassName = '', ...props }) => (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-sm text-gray-700">{label}</label>
      <input type={type} className={`border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${inputClassName}`} {...props} />
    </div>
  );

  const Select = ({ label, children, className = '', selectClassName = '', ...props }) => (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-sm text-gray-700">{label}</label>
      <select className={`border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${selectClassName}`} {...props}>
        {children}
      </select>
    </div>
  );

  const TextArea = ({ label, rows = 3, className = '', textareaClassName = '', ...props }) => (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-sm text-gray-700">{label}</label>
      <textarea rows={rows} className={`border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${textareaClassName}`} {...props} />
    </div>
  );

  const FileInput = ({ label, multiple = false, className = '', inputClassName = '', name, ...props }) => {
    const [preview, setPreview] = useState(null);
    
    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setPreview(event.target.result);
        };
        reader.readAsDataURL(file);
      }
      
      // Call original onChange if provided
      if (props.onChange) props.onChange(e);
    };
    
    return (
      <div className={`flex flex-col gap-1 ${className}`}>
        <label className="text-sm text-gray-700">{label}</label>
        <input 
          type="file" 
          multiple={multiple} 
          name={name}
          className={`border border-gray-300 rounded-lg px-3 py-2 bg-white ${inputClassName}`} 
          onChange={handleFileChange}
          {...props} 
        />
        {preview && name === 'photo' && (
          <div className="mt-2">
            <img src={preview} alt="Preview" className="w-16 h-20 object-cover rounded-lg border border-gray-300" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">HR Management</h1>
          <div className="bg-white rounded-lg border border-gray-200 p-1 flex">
            {['payroll','vendors','attendance','employees','leaves','recruitment','policies','add-new'].map(key => (
              <button key={key} className={`px-3 py-1 rounded-md text-sm font-medium ${
                tab===key
                  ? (key === 'add-new' ? 'bg-green-500 text-white' : 'bg-yellow-100 text-yellow-700')
                  : (key === 'add-new' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'text-gray-600 hover:text-gray-800')
              }`} onClick={()=>setTab(key)}>
{key === 'add-new' ? (
                  <span className="flex items-center gap-1">
                    <Plus size={14} />
                    Add New
                  </span>
                ) : key.charAt(0).toUpperCase()+key.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Payroll */}
        {tab==='payroll' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-gray-700">Month:</span>
              <input type="month" value={salaryMonth} onChange={(e)=>setSalaryMonth(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2"/>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Salary</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present/Working</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allowances</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Pay</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[...teachers.map(t=>({...t,_type:'teachers'})), ...staff.map(s=>({...s,_type:'staff'}))].map(emp => {
                    const present = getAttendance(emp.id, emp._type, salaryMonth);
                    const { allowances, net } = computeNetPay(emp.baseSalary, present);
                    return (
                      <tr key={emp.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                          <div className="text-sm text-gray-500">{emp.designation || emp.role || (emp._type==='teachers'?'Teacher':'Staff')}</div>
                        </td>
                        <td className="px-6 py-4 text-sm">₹{emp.baseSalary.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm">{present}/{WORKING_DAYS}</td>
                        <td className="px-6 py-4 text-sm">₹{allowances.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">₹{net.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <button onClick={()=>generatePayslipPDF(emp, emp._type, salaryMonth)} className="inline-flex items-center px-3 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">
                              <FileText size={14} className="mr-1"/> Payslip
                            </button>
                            <button onClick={()=>alert('Payment recorded (demo).')} className="inline-flex items-center px-3 py-1 rounded text-white bg-green-600 hover:bg-green-700">Pay</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Vendors */}
        {tab==='vendors' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vendors.map(v => (
                    <tr key={v.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{v.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{v.service}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{v.due.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button onClick={()=>alert('Vendor payment recorded (demo).')} className="inline-flex items-center px-3 py-1 rounded text-white bg-green-600 hover:bg-green-700">Pay</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Attendance */}
        {tab==='attendance' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-gray-700">Month:</span>
              <input type="month" value={salaryMonth} onChange={(e)=>setSalaryMonth(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2"/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {[...teachers.map(t=>({...t,_type:'teachers'})), ...staff.map(s=>({...s,_type:'staff'}))].map(emp => {
                const present = getAttendance(emp.id, emp._type, salaryMonth);
                const absent = WORKING_DAYS - present;
                return (
                  <div key={emp.id} className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                    <div className="font-semibold text-gray-900">{emp.name}</div>
                    <div className="text-sm text-gray-600 mb-1">{emp.designation || emp.role || (emp._type==='teachers'?'Teacher':'Staff')}</div>
                    <div className="text-sm text-gray-700">Present: {present} days</div>
                    <div className="text-sm text-gray-700">Absent: {absent} days</div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-500">Connect your attendance API to drive payroll automatically.</p>
          </div>
        )}

        {/* Employee Directory */}
        {tab==='employees' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2"><Users size={18}/> Employees</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employees.map(e => (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">{e.name}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{e.role}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{e.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {showAddEmp && (
              <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 w-full max-w-md">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Add Employee</h3>
                    <button className="text-gray-400 hover:text-gray-600" onClick={()=>setShowAddEmp(false)}><X size={20}/></button>
                  </div>
                  <form onSubmit={addEmployee} className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Name</label>
                      <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={newEmp.name} onChange={e=>setNewEmp({...newEmp,name:e.target.value})} required/>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Role</label>
                      <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={newEmp.role} onChange={e=>setNewEmp({...newEmp,role:e.target.value})}/>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Type</label>
                      <select className="w-full border border-gray-300 rounded-lg px-3 py-2" value={newEmp.type} onChange={e=>setNewEmp({...newEmp,type:e.target.value})}>
                        <option>Teacher</option>
                        <option>Staff</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button type="button" onClick={()=>setShowAddEmp(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button>
                      <button type="submit" className="px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white">Add</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Leaves */}
        {tab==='leaves' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2"><CalendarCheck size={18}/> Leave Approvals</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaveRequests.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">{r.emp}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{r.type}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{r.from}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{r.to}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{r.status}</td>
                      <td className="px-6 py-3 text-sm">
                        <div className="flex gap-2">
                          <button onClick={()=>updateLeave(r.id,'Approved')} className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700">Approve</button>
                          <button onClick={()=>updateLeave(r.id,'Rejected')} className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700">Reject</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recruitment */}
        {tab==='recruitment' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Job Openings</h2>
              <ul className="divide-y divide-gray-200">
                {jobs.map(j => (
                  <li key={j.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{j.title}</div>
                      <div className="text-sm text-gray-600">Openings: {j.openings}</div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">{j.status}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Candidates</h2>
              <ul className="divide-y divide-gray-200">
                {candidates.map(c => (
                  <li key={c.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{c.name}</div>
                      <div className="text-sm text-gray-600">For: {c.for}</div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">{c.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Policies */}
        {tab==='policies' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2"><Building2 size={18}/> HR Policies</h2>
            <form onSubmit={uploadPolicy} className="flex items-center gap-2 mb-4">
              <input value={uploadName} onChange={(e)=>setUploadName(e.target.value)} placeholder="Policy file name (e.g., Travel Policy.pdf)" className="flex-1 border border-gray-300 rounded-lg px-3 py-2"/>
              <button type="submit" className="px-3 py-2 rounded bg-yellow-600 text-white hover:bg-yellow-700">Upload</button>
            </form>
            <ul className="divide-y divide-gray-200">
              {policies.map(p => (
                <li key={p.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">{p.name}</div>
                    <div className="text-sm text-gray-600">Uploaded: {p.date}</div>
                  </div>
                  <button className="px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50">View</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Add New */}
        {tab==='add-new' && (
          <div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Add New Records</h2>
                <div className="bg-white rounded-lg border border-gray-200 p-1 flex">
                  <button className={`px-3 py-1 rounded-md text-sm font-medium ${addTab==='teacher'?'bg-purple-100 text-purple-700':'text-gray-600 hover:text-gray-800'}`} onClick={()=>setAddTab('teacher')}>Teacher</button>
                  <button className={`px-3 py-1 rounded-md text-sm font-medium ${addTab==='student'?'bg-purple-100 text-purple-700':'text-gray-600 hover:text-gray-800'}`} onClick={()=>setAddTab('student')}>Student</button>
                  <button className={`px-3 py-1 rounded-md text-sm font-medium ${addTab==='staff'?'bg-purple-100 text-purple-700':'text-gray-600 hover:text-gray-800'}`} onClick={()=>setAddTab('staff')}>Staff</button>
                </div>
              </div>

              {addTab === 'teacher' && (
                <form onSubmit={(e)=>handleSubmit(e,'Teacher')} className="space-y-6">
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
                    </div>
                    <TextArea name="notes" label="Notes" />
                  </Section>

                  <div className="flex justify-end gap-2">
                    <button type="reset" className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Reset</button>
                    <button 
                      type="button" 
                      onClick={() => {
                        const form = document.querySelector('form');
                        const formData = new FormData(form);
                        const entries = {};
                        
                        // Handle regular form fields
                        for (const [k, v] of formData.entries()) {
                          if (k !== 'photo') {
                            entries[k] = v;
                          }
                        }
                        
                        // Handle photo file
                        const photoFile = formData.get('photo');
                        if (photoFile && photoFile.size > 0) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            entries.photo = e.target.result;
                            if (entries.firstName) generateIDCard(entries, 'teacher');
                          };
                          reader.readAsDataURL(photoFile);
                        } else {
                          if (entries.firstName) generateIDCard(entries, 'teacher');
                        }
                      }}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                    >
                      <CreditCard size={16} />
                      Generate ID Card
                    </button>
                    <button type="submit" className="px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white">Add Teacher</button>
                  </div>
                </form>
              )}

              {addTab === 'student' && (
                <form onSubmit={(e)=>handleSubmit(e,'Student')} className="space-y-6">
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
                        {['A','B','C','D'].map(s => <option key={s}>{s}</option>)}
                      </Select>
                      <Input name="rollNo" label="Roll No." />
                      <Input name="admissionDate" label="Date of Admission" type="date" />
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
                      <Input name="emergencyName" label="Emergency Contact Name" />
                      <Input name="emergencyPhone" label="Emergency Contact Phone" type="tel" />
                      <FileInput name="vaccinationCard" label="Vaccination Card" />
                    </div>
                    <TextArea name="healthNotes" label="Health Notes" />
                  </Section>

                  <div className="flex justify-end gap-2">
                    <button type="reset" className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Reset</button>
                    <button 
                      type="button" 
                      onClick={() => {
                        const form = document.querySelector('form');
                        const formData = new FormData(form);
                        const entries = {};
                        
                        // Handle regular form fields
                        for (const [k, v] of formData.entries()) {
                          if (k !== 'photo') {
                            entries[k] = v;
                          }
                        }
                        
                        // Handle photo file
                        const photoFile = formData.get('photo');
                        if (photoFile && photoFile.size > 0) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            entries.photo = e.target.result;
                            if (entries.firstName) generateIDCard(entries, 'student');
                          };
                          reader.readAsDataURL(photoFile);
                        } else {
                          if (entries.firstName) generateIDCard(entries, 'student');
                        }
                      }}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                    >
                      <CreditCard size={16} />
                      Generate ID Card
                    </button>
                    <button type="submit" className="px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white">Add Student</button>
                  </div>
                </form>
              )}

              {addTab === 'staff' && (
                <form onSubmit={(e)=>handleSubmit(e,'Staff')} className="space-y-6">
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
                      <FileInput name="resume" label="Resume/CV" />
                      <FileInput name="otherDocs" label="Other Documents" multiple />
                    </div>
                    <TextArea name="notes" label="Notes" />
                  </Section>

                  <div className="flex justify-end gap-2">
                    <button type="reset" className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Reset</button>
                    <button 
                      type="button" 
                      onClick={() => {
                        const form = document.querySelector('form');
                        const formData = new FormData(form);
                        const entries = {};
                        
                        // Handle regular form fields
                        for (const [k, v] of formData.entries()) {
                          if (k !== 'photo') {
                            entries[k] = v;
                          }
                        }
                        
                        // Handle photo file
                        const photoFile = formData.get('photo');
                        if (photoFile && photoFile.size > 0) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            entries.photo = e.target.result;
                            if (entries.firstName) generateIDCard(entries, 'staff');
                          };
                          reader.readAsDataURL(photoFile);
                        } else {
                          if (entries.firstName) generateIDCard(entries, 'staff');
                        }
                      }}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                    >
                      <CreditCard size={16} />
                      Generate ID Card
                    </button>
                    <button type="submit" className="px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white">Add Staff</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ID Card Modal */}
        {showIDCard && idCardData && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-6 max-w-lg w-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">🎓 ID Card Generated Successfully!</h3>
                <button 
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100" 
                  onClick={() => setShowIDCard(false)}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="mb-6 flex justify-center">
                <IDCard ref={idCardRef} person={idCardData} type={idCardType} />
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-2">
                  <div className="text-blue-600 mt-0.5">ℹ️</div>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Your ID card is ready!</p>
                    <p>This design shows the actual appearance. You can download a PDF version or print directly.</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowIDCard(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={printIDCard}
                  className="flex-1 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 transition-colors"
                >
                  <FileText size={16} />
                  Print Card
                </button>
                <button
                  onClick={downloadIDCardPDF}
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 transition-colors"
                >
                  <CreditCard size={16} />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HR;