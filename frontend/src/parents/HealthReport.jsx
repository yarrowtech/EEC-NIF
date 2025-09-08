import React from 'react';
import { Activity, Calendar, Download, Heart, Thermometer, Weight, Ruler, AlertCircle } from 'lucide-react';

const HealthReport = () => {
  const healthData = {
    studentName: "Koushik Bala",
    class: "10-A",
    age: 15,
    bloodGroup: "B+",
    height: "165 cm",
    weight: "52 kg",
    bmi: "19.1",
    lastCheckup: "2024-02-15",
    medicalHistory: [
      {
        date: "2024-02-15",
        type: "Regular Checkup",
        findings: "Normal",
        doctor: "Dr. Johnson",
        recommendations: "Continue regular exercise"
      },
      {
        date: "2024-01-10",
        type: "Vaccination",
        findings: "Flu Shot",
        doctor: "Dr. Smith",
        recommendations: "Next dose due in 6 months"
      }
    ],
    allergies: ["Peanuts", "Dust"],
    medications: ["None"],
    emergencyContact: {
      name: "John Smith",
      relation: "Father",
      phone: "+1 234-567-8900"
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl p-6 mb-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Health Report</h1>
        <p className="text-yellow-100">View student health records and history</p>
      </div>

      {/* Student Info & Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Student Info</h3>
          <div className="space-y-2">
            <p className="text-gray-600">Name: {healthData.studentName}</p>
            <p className="text-gray-600">Class: {healthData.class}</p>
            <p className="text-gray-600">Age: {healthData.age} years</p>
            <p className="text-gray-600">Blood Group: {healthData.bloodGroup}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Height & Weight</h3>
            <Activity className="w-6 h-6 text-yellow-500" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Ruler className="w-5 h-5 text-gray-500 mr-2" />
                <span className="text-gray-600">Height</span>
              </div>
              <span className="font-medium text-gray-800">{healthData.height}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Weight className="w-5 h-5 text-gray-500 mr-2" />
                <span className="text-gray-600">Weight</span>
              </div>
              <span className="font-medium text-gray-800">{healthData.weight}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Activity className="w-5 h-5 text-gray-500 mr-2" />
                <span className="text-gray-600">BMI</span>
              </div>
              <span className="font-medium text-gray-800">{healthData.bmi}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Allergies</h3>
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <div className="space-y-2">
            {healthData.allergies.map((allergy, index) => (
              <div key={index} className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm mr-2">
                {allergy}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Emergency Contact</h3>
            <Heart className="w-6 h-6 text-red-500" />
          </div>
          <div className="space-y-2">
            <p className="text-gray-600">Name: {healthData.emergencyContact.name}</p>
            <p className="text-gray-600">Relation: {healthData.emergencyContact.relation}</p>
            <p className="text-gray-600">Phone: {healthData.emergencyContact.phone}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span className="text-gray-600">Last Checkup: {new Date(healthData.lastCheckup).toLocaleDateString()}</span>
            </div>
          </div>

          <button className="flex items-center space-x-2 bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors">
            <Download className="w-4 h-4" />
            <span>Download Report</span>
          </button>
        </div>
      </div>

      {/* Medical History */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Medical History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Type</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Findings</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Doctor</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Recommendations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {healthData.medicalHistory.map((record, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                      {new Date(record.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                      {record.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{record.findings}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{record.doctor}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{record.recommendations}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HealthReport; 