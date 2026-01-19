import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, ArrowRight, Mail, Clock, Phone } from 'lucide-react';

const SchoolRegistrationSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const schoolData = location.state?.schoolData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>

          {/* Heading */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Registration Submitted Successfully!
          </h1>

          {/* Subheading */}
          <p className="text-lg text-gray-600 mb-8">
            Thank you for registering your school with us.
          </p>

          {/* School Info Card */}
          {schoolData && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 mb-8 border border-amber-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div>
                  <p className="text-sm text-gray-600">School Name</p>
                  <p className="text-lg font-semibold text-gray-800">{schoolData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Campuses Registered</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {schoolData.campusCount || 1} Campus{(schoolData.campusCount || 1) !== 1 ? 'es' : ''}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">School Code</p>
                  <p className="text-lg font-semibold text-amber-600">{schoolData.code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    <Clock size={14} className="mr-1" />
                    Pending Review
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Status Message */}
          <div className="bg-blue-50 rounded-xl p-6 mb-8 border border-blue-200 text-left">
            <h2 className="text-xl font-bold text-gray-800 mb-4">What happens next?</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-600 font-semibold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Review Process</h3>
                  <p className="text-sm text-gray-600">
                    Our admin team will review your registration and verify the submitted documents.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-600 font-semibold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Email Notification</h3>
                  <p className="text-sm text-gray-600">
                    You will receive an email notification once your registration is approved.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-600 font-semibold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Get Started</h3>
                  <p className="text-sm text-gray-600">
                    After approval, you can create admin accounts and start using the platform.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-4">Need Help?</h3>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail size={18} className="text-amber-500" />
                <span>support@eec-platform.com</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone size={18} className="text-amber-500" />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-colors font-semibold"
            >
              Back to Home
              <ArrowRight size={20} />
            </button>
          </div>

          {/* Additional Info */}
          <p className="text-sm text-gray-500 mt-8">
            Please save your school code ({schoolData?.code}) for future reference.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SchoolRegistrationSuccess;
