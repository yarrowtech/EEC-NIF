import React, { useState, useEffect } from 'react';
import { User, FileText, Clock, CheckCircle, XCircle, AlertCircle, Plus, Search, Filter, Calendar, Mail, Phone, ChevronDown, Bell, Settings, LogOut } from 'lucide-react';

const ComplaintManagementSystem = () => {
  const [currentUser, setCurrentUser] = useState({ role: 'student', id: 1, name: 'Koushik Bala', email: 'koushik@example.com' });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [complaints, setComplaints] = useState([
    {
      id: 1,
      title: 'Login Issues',
      description: 'Unable to access my course materials after password reset',
      category: 'Technical',
      priority: 'High',
      status: 'Open',
      submittedBy: 'Swapnanil Dutta',
      submittedDate: '2024-06-10',
      assignedTo: 'IT Support',
      lastUpdated: '2024-06-11'
    },
    {
      id: 2,
      title: 'Grade Discrepancy',
      description: 'My final grade for Mathematics course seems incorrect',
      category: 'Academic',
      priority: 'Medium',
      status: 'In Progress',
      submittedBy: 'Souvik Chakraborty',
      submittedDate: '2024-06-08',
      assignedTo: 'Academic Office',
      lastUpdated: '2024-06-12'
    },
    {
      id: 3,
      title: 'Course Material Missing',
      description: 'Week 5 lecture materials are not available in the system',
      category: 'Content',
      priority: 'Medium',
      status: 'Resolved',
      submittedBy: 'Koushik Bala',
      submittedDate: '2024-06-05',
      assignedTo: 'Course Coordinator',
      lastUpdated: '2024-06-13'
    }
  ]);

  const [newComplaint, setNewComplaint] = useState({
    title: '',
    description: '',
    category: 'Technical',
    priority: 'Medium'
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const categories = ['Technical', 'Academic', 'Content', 'Administrative', 'Other'];
  const priorities = ['Low', 'Medium', 'High', 'Critical'];
  const statuses = ['Open', 'In Progress', 'Resolved', 'Closed'];

  const handleSubmitComplaint = (e) => {
    e.preventDefault();
    const complaint = {
      id: complaints.length + 1,
      ...newComplaint,
      status: 'Open',
      submittedBy: currentUser.name,
      submittedDate: new Date().toISOString().split('T')[0],
      assignedTo: 'Pending Assignment',
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    setComplaints([...complaints, complaint]);
    setNewComplaint({ title: '', description: '', category: 'Technical', priority: 'Medium' });
    setActiveTab('my-complaints');
  };

  const handleStatusChange = (complaintId, newStatus) => {
    setComplaints(complaints.map(complaint => 
      complaint.id === complaintId 
        ? { ...complaint, status: newStatus, lastUpdated: new Date().toISOString().split('T')[0] }
        : complaint
    ));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Open': return <div className="w-3 h-3 rounded-full bg-red-500"></div>;
      case 'In Progress': return <div className="w-3 h-3 rounded-full bg-yellow-500"></div>;
      case 'Resolved': return <div className="w-3 h-3 rounded-full bg-green-500"></div>;
      case 'Closed': return <div className="w-3 h-3 rounded-full bg-gray-500"></div>;
      default: return <div className="w-3 h-3 rounded-full bg-red-500"></div>;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Low': return 'bg-green-100 text-green-800 border border-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'High': return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'Critical': return 'bg-red-100 text-red-800 border border-red-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || complaint.status === filterStatus;
    const matchesCategory = filterCategory === 'All' || complaint.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStats = () => {
    const total = complaints.length;
    const open = complaints.filter(c => c.status === 'Open').length;
    const inProgress = complaints.filter(c => c.status === 'In Progress').length;
    const resolved = complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
    return { total, open, inProgress, resolved };
  };

  const stats = getStats();

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Complaints</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Open</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.open}</p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">In Progress</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.inProgress}</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Resolved</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.resolved}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Recent Complaints</h3>
          <button className="text-sm text-blue-600 font-medium hover:text-blue-800">
            View all
          </button>
        </div>
        <div className="space-y-4">
          {complaints.slice(0, 3).map(complaint => (
            <div key={complaint.id} className="flex items-start p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0 mt-1 mr-4">
                {getStatusIcon(complaint.status)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-800">{complaint.title}</h4>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                    {complaint.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1 line-clamp-1">{complaint.description}</p>
                <div className="flex items-center mt-2 text-xs text-gray-500">
                  <span className="mr-3">By {complaint.submittedBy}</span>
                  <span>On {complaint.submittedDate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSubmitComplaint = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-2">Submit New Complaint</h2>
      <p className="text-gray-600 mb-6">Report an issue you're experiencing</p>
      
      <form onSubmit={handleSubmitComplaint} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Complaint Title</label>
          <input
            type="text"
            required
            value={newComplaint.title}
            onChange={(e) => setNewComplaint({...newComplaint, title: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Brief description of your issue"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            required
            rows={5}
            value={newComplaint.description}
            onChange={(e) => setNewComplaint({...newComplaint, description: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Please provide detailed information about your complaint"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={newComplaint.category}
              onChange={(e) => setNewComplaint({...newComplaint, category: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              value={newComplaint.priority}
              onChange={(e) => setNewComplaint({...newComplaint, priority: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {priorities.map(priority => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>
          </div>
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>Submit Complaint</span>
        </button>
      </form>
    </div>
  );

  const renderComplaintsList = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h2 className="text-xl font-bold text-gray-800">All Complaints</h2>
            <p className="text-gray-600 text-sm mt-1">Manage and track your complaints</p>
          </div>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search complaints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="All">All Status</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="All">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredComplaints.map(complaint => (
          <div key={complaint.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-sm font-medium text-gray-500">#{complaint.id}</span>
                  <div className="flex items-center">
                    {getStatusIcon(complaint.status)}
                    <span className="text-sm font-medium text-gray-700 ml-2">{complaint.status}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                    {complaint.priority}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{complaint.title}</h3>
                <p className="text-gray-600 mb-4">{complaint.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Category:</span>
                    <span className="bg-gray-100 px-2.5 py-1 rounded-md">{complaint.category}</span>
                  </div>
                  <div>
                    <span className="font-medium">Submitted by:</span> {complaint.submittedBy}
                  </div>
                  <div>
                    <span className="font-medium">Date:</span> {complaint.submittedDate}
                  </div>
                  <div>
                    <span className="font-medium">Assigned to:</span> {complaint.assignedTo}
                  </div>
                </div>
              </div>
              
              {currentUser.role === 'admin' && (
                <div className="ml-4">
                  <select
                    value={complaint.status}
                    onChange={(e) => handleStatusChange(complaint.id, e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-xs border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Complaint Portal</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Bell className="w-5 h-5 text-gray-500" />
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-medium text-gray-800">{currentUser.name}</p>
                    <p className="text-xs text-gray-500">{currentUser.role}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
                
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-800">{currentUser.name}</p>
                      <p className="text-xs text-gray-500">{currentUser.email}</p>
                    </div>
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </button>
                    <button 
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setCurrentUser({
                        ...currentUser, 
                        role: currentUser.role === 'student' ? 'admin' : 'student'
                      })}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Switch to {currentUser.role === 'student' ? 'Admin' : 'Student'} View
                    </button>
                    <button className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <nav className="mb-8">
          <div className="flex space-x-1 bg-white rounded-xl p-1.5 shadow-sm border border-gray-200">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: FileText },
              { id: 'submit', label: 'Submit Complaint', icon: Plus },
              { id: 'my-complaints', label: 'My Complaints', icon: User },
              ...(currentUser.role === 'admin' ? [{ id: 'all-complaints', label: 'All Complaints', icon: FileText }] : [])
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-100'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Content */}
        <main>
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'submit' && renderSubmitComplaint()}
          {activeTab === 'my-complaints' && renderComplaintsList()}
          {activeTab === 'all-complaints' && currentUser.role === 'admin' && renderComplaintsList()}
        </main>
      </div>
    </div>
  );
};

export default ComplaintManagementSystem;