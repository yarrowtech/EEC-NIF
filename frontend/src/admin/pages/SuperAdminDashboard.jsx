import React, { useState } from 'react';
import {
  Building2, Users, CheckCircle, Clock, XCircle, DollarSign,
  Search, Filter, Edit, Trash2, Eye, Download, RefreshCw,
  ChevronDown, Calendar, Mail, Phone, MapPin, FileText,
  Settings, Award, TrendingUp, AlertCircle, Plus, X,
  Upload, Save, User, GraduationCap, Loader2
} from 'lucide-react';

const SuperAdminDashboard = ({ setShowAdminHeader }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [showSalesModal, setShowSalesModal] = useState(false);

  // Mock data - will be replaced with real API calls
  const stats = {
    totalSchools: 45,
    newRequests: 12,
    verified: 8,
    active: 20,
    rejected: 5,
    totalRevenue: 1250000,
    thisMonthRevenue: 185000
  };

  const schools = [
    {
      _id: '1',
      name: 'Delhi Public School',
      campusCount: 3,
      campuses: [
        { name: 'Main Campus', type: 'Main', address: '123 Main St, Delhi' },
        { name: 'East Campus', type: 'Branch', address: '456 East Ave, Delhi' },
        { name: 'West Campus', type: 'Branch', address: '789 West Blvd, Delhi' }
      ],
      officialEmail: 'admin@dps.edu',
      contactPhone: '+91-98765-43210',
      contactPersonName: 'Rajesh Kumar',
      schoolType: 'Private',
      board: 'CBSE',
      academicYearStructure: 'Semester',
      estimatedUsers: '500-1000',
      address: 'Main Campus, Delhi',
      registrationStatus: 'pending',
      commercialStatus: 'pending_review',
      paymentStatus: 'pending',
      submittedAt: '2024-01-15T10:30:00Z',
      logo: { secure_url: 'https://via.placeholder.com/100' },
      verificationDocs: [
        { originalName: 'registration_certificate.pdf', secure_url: '#' },
        { originalName: 'principal_id.pdf', secure_url: '#' }
      ]
    },
    {
      _id: '2',
      name: 'International School of Mumbai',
      campusCount: 1,
      campuses: [
        { name: 'Main Campus', type: 'Main', address: '100 Marine Drive, Mumbai' }
      ],
      officialEmail: 'contact@ismumbai.edu',
      contactPhone: '+91-98765-12345',
      contactPersonName: 'Priya Sharma',
      schoolType: 'International',
      board: 'IB',
      academicYearStructure: 'Trimester',
      estimatedUsers: '100-500',
      address: 'Marine Drive, Mumbai',
      registrationStatus: 'approved',
      commercialStatus: 'verified',
      paymentStatus: 'pending',
      submittedAt: '2024-01-10T14:20:00Z',
      logo: { secure_url: 'https://via.placeholder.com/100' },
      verificationDocs: [
        { originalName: 'affiliation_certificate.pdf', secure_url: '#' }
      ],
      salesAssignedTo: 'Amit Singh',
      subscriptionPlan: 'Premium'
    },
    {
      _id: '3',
      name: 'Cambridge Academy Bangalore',
      campusCount: 2,
      campuses: [
        { name: 'North Campus', type: 'Main', address: '50 MG Road, Bangalore' },
        { name: 'South Campus', type: 'Branch', address: '75 Brigade Road, Bangalore' }
      ],
      officialEmail: 'info@cambridge-blr.edu',
      contactPhone: '+91-98765-67890',
      contactPersonName: 'Anil Reddy',
      schoolType: 'Private',
      board: 'ICSE',
      academicYearStructure: 'Semester',
      estimatedUsers: '1000+',
      address: 'MG Road, Bangalore',
      registrationStatus: 'approved',
      commercialStatus: 'active',
      paymentStatus: 'completed',
      submittedAt: '2023-12-20T09:15:00Z',
      activatedAt: '2024-01-05T11:00:00Z',
      logo: { secure_url: 'https://via.placeholder.com/100' },
      verificationDocs: [
        { originalName: 'noc_certificate.pdf', secure_url: '#' }
      ],
      subscriptionPlan: 'Enterprise',
      subscriptionStartDate: '2024-01-05',
      subscriptionEndDate: '2025-01-05',
      paymentAmount: 250000,
      invoiceNumber: 'INV-2024-001'
    }
  ];

  const StatusBadge = ({ status, type = 'commercial' }) => {
    const styles = {
      commercial: {
        pending_review: 'bg-yellow-100 text-yellow-800',
        verified: 'bg-blue-100 text-blue-800',
        contacted: 'bg-purple-100 text-purple-800',
        negotiating: 'bg-orange-100 text-orange-800',
        payment_pending: 'bg-pink-100 text-pink-800',
        paid: 'bg-green-100 text-green-800',
        active: 'bg-emerald-100 text-emerald-800',
        suspended: 'bg-red-100 text-red-800'
      },
      payment: {
        pending: 'bg-gray-100 text-gray-800',
        partial: 'bg-yellow-100 text-yellow-800',
        completed: 'bg-green-100 text-green-800',
        failed: 'bg-red-100 text-red-800'
      }
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[type][status]}`}>
        {status.replace(/_/g, ' ').toUpperCase()}
      </span>
    );
  };

  const StatCard = ({ icon, title, value, subtitle, color, trend }) => (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-3 rounded-lg ${color}`}>
              {icon}
            </div>
            <div>
              <p className="text-sm text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
          </div>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp size={14} className="text-green-500" />
              <span className="text-xs text-green-600">{trend}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const filteredSchools = schools.filter(school => {
    const matchesSearch = searchQuery.trim() === '' ||
      school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school.officialEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab = activeTab === 'all' ||
      (activeTab === 'new' && school.commercialStatus === 'pending_review') ||
      (activeTab === 'verified' && school.commercialStatus === 'verified') ||
      (activeTab === 'active' && school.commercialStatus === 'active') ||
      (activeTab === 'rejected' && school.registrationStatus === 'rejected');

    return matchesSearch && matchesTab;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Super Admin Dashboard</h1>
          <p className="text-amber-100">Manage school registrations, subscriptions, and activations</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Building2 className="text-blue-600" size={24} />}
            title="Total Schools"
            value={stats.totalSchools}
            color="bg-blue-100"
          />
          <StatCard
            icon={<Clock className="text-yellow-600" size={24} />}
            title="New Requests"
            value={stats.newRequests}
            subtitle="Pending review"
            color="bg-yellow-100"
          />
          <StatCard
            icon={<CheckCircle className="text-green-600" size={24} />}
            title="Active Schools"
            value={stats.active}
            color="bg-green-100"
            trend="+12% this month"
          />
          <StatCard
            icon={<DollarSign className="text-emerald-600" size={24} />}
            title="Revenue"
            value={`₹${(stats.totalRevenue / 100000).toFixed(1)}L`}
            subtitle={`₹${(stats.thisMonthRevenue / 1000).toFixed(0)}K this month`}
            color="bg-emerald-100"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex gap-2 overflow-x-auto">
              {[
                { id: 'all', label: 'All Schools', count: stats.totalSchools },
                { id: 'new', label: 'New Requests', count: stats.newRequests },
                { id: 'verified', label: 'Verified', count: stats.verified },
                { id: 'active', label: 'Active', count: stats.active },
                { id: 'rejected', label: 'Rejected', count: stats.rejected }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-white text-amber-500' : 'bg-white text-gray-700'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                <RefreshCw size={20} className="text-gray-600" />
              </button>
              <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                <Download size={20} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search schools by name, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                <Filter size={20} />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Schools List */}
          <div className="divide-y divide-gray-200">
            {filteredSchools.length === 0 ? (
              <div className="p-12 text-center">
                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Schools Found</h3>
                <p className="text-gray-600">No schools match your current filters.</p>
              </div>
            ) : (
              filteredSchools.map((school) => (
                <div key={school._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* School Logo */}
                    <img
                      src={school.logo?.secure_url || 'https://via.placeholder.com/80'}
                      alt={school.name}
                      className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200"
                    />

                    {/* School Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">{school.name}</h3>
                          <p className="text-sm text-gray-600">
                            {school.campusCount} Campus{school.campusCount !== 1 ? 'es' : ''} • {school.schoolType} • {school.board}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <StatusBadge status={school.commercialStatus} type="commercial" />
                          <StatusBadge status={school.paymentStatus} type="payment" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={16} className="text-amber-500" />
                          <span className="truncate">{school.officialEmail}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone size={16} className="text-amber-500" />
                          <span>{school.contactPhone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User size={16} className="text-amber-500" />
                          <span>{school.contactPersonName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <GraduationCap size={16} className="text-amber-500" />
                          <span>{school.academicYearStructure}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users size={16} className="text-amber-500" />
                          <span>{school.estimatedUsers} users</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={16} className="text-amber-500" />
                          <span>{new Date(school.submittedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Additional Info for Active Schools */}
                      {school.commercialStatus === 'active' && school.subscriptionPlan && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Award className="text-green-600" size={16} />
                              <span className="font-semibold text-green-800">{school.subscriptionPlan} Plan</span>
                            </div>
                            {school.subscriptionEndDate && (
                              <span className="text-green-700">
                                Valid until {new Date(school.subscriptionEndDate).toLocaleDateString()}
                              </span>
                            )}
                            {school.paymentAmount && (
                              <span className="text-green-700">
                                ₹{school.paymentAmount.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => {
                            setSelectedSchool(school);
                            setShowEditModal(true);
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                        >
                          <Eye size={16} />
                          View Details
                        </button>

                        <button
                          onClick={() => {
                            setSelectedSchool(school);
                            setShowEditModal(true);
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                          <Edit size={16} />
                          Edit
                        </button>

                        {school.commercialStatus === 'pending_review' && (
                          <>
                            <button className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium">
                              <CheckCircle size={16} />
                              Verify
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium">
                              <XCircle size={16} />
                              Reject
                            </button>
                          </>
                        )}

                        {school.commercialStatus === 'verified' && (
                          <button
                            onClick={() => {
                              setSelectedSchool(school);
                              setShowSalesModal(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                          >
                            <User size={16} />
                            Assign Sales
                          </button>
                        )}

                        {school.paymentStatus === 'completed' && school.commercialStatus !== 'active' && (
                          <button
                            onClick={() => {
                              setSelectedSchool(school);
                              setShowActivationModal(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-colors text-sm font-medium"
                          >
                            <CheckCircle size={16} />
                            Activate School
                          </button>
                        )}

                        {school.commercialStatus === 'verified' || school.commercialStatus === 'contacted' && (
                          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors text-sm font-medium">
                            <DollarSign size={16} />
                            Record Payment
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal - Will add full implementation */}
      {showEditModal && selectedSchool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white p-6 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-2xl font-bold">Edit School Details</h2>
              <button onClick={() => setShowEditModal(false)} className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2">
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600">Full edit form will be implemented here...</p>
            </div>
          </div>
        </div>
      )}

      {/* Activation Modal - Will add full implementation */}
      {showActivationModal && selectedSchool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-2xl font-bold">Activate School</h2>
              <button onClick={() => setShowActivationModal(false)} className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2">
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600">Activation form with plan selection will be implemented here...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
