import React, { forwardRef, useState, useEffect } from 'react';

const IDCard = forwardRef(({ person, type }, ref) => {
  const [qrCode, setQrCode] = useState('');
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  
  // Generate QR code data
  useEffect(() => {
    const qrData = JSON.stringify({
      id: getIdNumber(),
      name: getFullName(),
      type: type,
      school: 'Electronic Educare',
      issued: new Date().toISOString().split('T')[0],
      validity: `${currentYear}-${nextYear}`,
      verification: Math.random().toString(36).substring(2, 15)
    });
    
    // Generate QR code URL using a QR API service
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(qrData)}`;
    setQrCode(qrUrl);
  }, [person, type]);

  const getFullName = () => {
    return `${person.firstName || ''} ${person.lastName || ''}`.trim() || 'N/A';
  };

  const getIdNumber = () => {
    return person.empId || person.admissionNo || `${type.toUpperCase()}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
  };

  const getPersonInfo = () => {
    switch (type) {
      case 'student':
        return {
          title: 'STUDENT ID',
          id: getIdNumber(),
          primaryInfo: `Class ${person.class || 'N/A'}`,
          secondaryInfo: `Section ${person.section || 'A'} • Roll ${person.rollNo || 'N/A'}`,
          bgGradient: 'from-blue-600 via-blue-700 to-blue-800',
          accentColor: 'bg-blue-500',
          icon: '🎓'
        };
      case 'teacher':
        return {
          title: 'FACULTY ID',
          id: getIdNumber(),
          primaryInfo: person.designation || 'Teacher',
          secondaryInfo: person.department || 'Academic Department',
          bgGradient: 'from-emerald-600 via-emerald-700 to-emerald-800',
          accentColor: 'bg-emerald-500',
          icon: '👨‍🏫'
        };
      case 'staff':
        return {
          title: 'STAFF ID',
          id: getIdNumber(),
          primaryInfo: person.role || 'Staff Member',
          secondaryInfo: person.department || 'Administration',
          bgGradient: 'from-purple-600 via-purple-700 to-purple-800',
          accentColor: 'bg-purple-500',
          icon: '👥'
        };
      default:
        return {
          title: 'ID CARD',
          id: getIdNumber(),
          primaryInfo: 'N/A',
          secondaryInfo: 'N/A',
          bgGradient: 'from-gray-600 via-gray-700 to-gray-800',
          accentColor: 'bg-gray-500',
          icon: '🏢'
        };
    }
  };

  const info = getPersonInfo();
  const photoUrl = person.photo || null;

  return (
    <div ref={ref} className="w-96 h-60 mx-auto relative overflow-hidden rounded-2xl shadow-2xl bg-white border border-gray-200 print:shadow-none">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className={`${info.accentColor} opacity-20 rounded-full m-1`}></div>
            ))}
          </div>
        </div>
      </div>

      {/* Header Section */}
      <div className={`relative bg-gradient-to-r ${info.bgGradient} text-white p-4 pb-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <span className="text-sm font-bold">EEC</span>
            </div>
            <div>
              <div className="text-xs font-medium opacity-90">Electronic Educare</div>
              <div className="text-sm font-bold">{info.title}</div>
            </div>
          </div>
          <div className="text-2xl">{info.icon}</div>
        </div>
        
        {/* Decorative Wave */}
        <div className="absolute bottom-0 left-0 right-0 h-3">
          <svg viewBox="0 0 100 20" className="w-full h-full">
            <path d="M0,10 Q25,0 50,10 T100,10 L100,20 L0,20 Z" fill="white" />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative p-4 pt-2 flex h-44">
        
        {/* Photo Section */}
        <div className="flex-shrink-0 mr-4">
          <div className="w-20 h-24 rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg bg-gradient-to-br from-gray-100 to-gray-200">
            {photoUrl ? (
              <img 
                src={photoUrl} 
                alt="Profile" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`w-full h-full flex flex-col items-center justify-center text-gray-500 ${photoUrl ? 'hidden' : 'flex'}`}>
              <div className="text-2xl mb-1">📷</div>
              <div className="text-xs font-medium">PHOTO</div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="flex-1 space-y-2">
          {/* Name */}
          <div>
            <div className="text-lg font-bold text-gray-900 leading-tight">{getFullName()}</div>
            <div className="text-sm text-gray-600 font-medium">ID: {info.id}</div>
          </div>
          
          {/* Role/Class Info */}
          <div className="space-y-1">
            <div className="text-sm font-semibold text-gray-800">{info.primaryInfo}</div>
            <div className="text-xs text-gray-600">{info.secondaryInfo}</div>
          </div>
          
          {/* Additional Info */}
          <div className="space-y-1 text-xs text-gray-600">
            {person.dob && (
              <div className="flex items-center space-x-1">
                <span>📅</span>
                <span>DOB: {new Date(person.dob).toLocaleDateString()}</span>
              </div>
            )}
            {person.phone && (
              <div className="flex items-center space-x-1">
                <span>📞</span>
                <span>{person.phone}</span>
              </div>
            )}
            {person.email && (
              <div className="flex items-center space-x-1">
                <span>✉️</span>
                <span className="truncate">{person.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* QR Code Section */}
        <div className="flex-shrink-0 ml-2">
          <div className="w-16 h-16 bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
            {qrCode ? (
              <img 
                src={qrCode} 
                alt="QR Code" 
                className="w-full h-full object-cover"
                onError={() => setQrCode('')}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <div className="text-lg">⬜</div>
                <div className="text-xs">QR</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-2 border-t border-gray-200">
        <div className="flex justify-between items-center text-xs">
          <div className="text-gray-600">Valid: {currentYear}-{nextYear}</div>
          <div className="text-gray-500">🛡️ Authorized Personnel Only</div>
          <div className="text-gray-600">Electronic Educare</div>
        </div>
      </div>

      {/* Security Hologram Effect */}
      <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 opacity-80 flex items-center justify-center">
        <div className="w-4 h-4 rounded-full bg-white/30 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-white/60"></div>
        </div>
      </div>
    </div>
  );
});

IDCard.displayName = 'IDCard';

export default IDCard;