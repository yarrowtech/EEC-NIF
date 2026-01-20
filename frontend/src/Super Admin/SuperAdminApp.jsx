import { useCallback, useEffect, useMemo, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SuperAdminLayout from './SuperAdminLayout';
import Overview from './pages/Overview';
import Requests from './pages/Requests';
import Feedback from './pages/Feedback';
import Issues from './pages/Issues';
import Tickets from './pages/Tickets';
import Credentials from './pages/Credentials';
import Operations from './pages/Operations';
import IDPass from './pages/IDPass';
import {
  initialSchoolRequests,
  initialFeedback,
  initialIssues,
  initialTickets,
  initialAnnouncements,
  initialComplianceItems,
  initialActivityFeed
} from './mockData';

const API_BASE = import.meta.env.VITE_API_URL;

const normalizeRegistration = (school = {}) => ({
  id: school._id || school.id || `REQ-${Date.now()}`,
  schoolName: school.name || 'New School',
  board: school.boardOther || school.board || 'Not specified',
  studentCount: school.estimatedUsers || 'Pending',
  contactPerson: school.contactPersonName || school.contactPerson || 'Registrar',
  contactEmail: school.officialEmail || school.contactEmail || 'N/A',
  contactPhone: school.contactPhone,
  submittedAt: school.submittedAt || school.createdAt || new Date().toISOString(),
  status: school.registrationStatus || 'pending',
  notes: school.adminNotes || school.rejectionReason || 'Awaiting review',
  campuses: Array.isArray(school.campuses) ? school.campuses.length : school.campusCount || 0,
  schoolType: school.schoolType,
  academicYearStructure: school.academicYearStructure,
  estimatedUsers: school.estimatedUsers,
  address: school.address,
  verificationDocs: school.verificationDocs,
  logo: school.logo,
  source: 'api'
});

const SuperAdminApp = () => {
  const [profile, setProfile] = useState({
    name: 'Platform Control',
    role: 'Super Administrator',
    email: 'superadmin@eec.in',
    avatar: ''
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [requests, setRequests] = useState(initialSchoolRequests);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState(null);
  const [feedbackItems, setFeedbackItems] = useState(initialFeedback);
  const [issues, setIssues] = useState(initialIssues);
  const [tickets, setTickets] = useState(initialTickets);
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [complianceItems, setComplianceItems] = useState(initialComplianceItems);
  const [activityFeed, setActivityFeed] = useState(initialActivityFeed);
  const [credentials, setCredentials] = useState(() =>
    initialSchoolRequests.reduce((acc, school) => {
      acc[school.id] = {
        password: '',
        status: 'not_generated',
        lastGenerated: null,
        lastReset: null
      };
      return acc;
    }, {})
  );

  const generateSecurePassword = () => {
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowercase = 'abcdefghijkmnopqrstuvwxyz';
    const digits = '23456789';
    const symbols = '!@$%&*';
    const rules = [uppercase, lowercase, digits, symbols];
    let password = rules.map((set) => set[Math.floor(Math.random() * set.length)]).join('');
    const allChars = `${uppercase}${lowercase}${digits}${symbols}`;
    while (password.length < 12) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  };

  const insights = useMemo(() => {
    const pending = requests.filter((req) => req.status === 'pending').length;
    const approved = requests.filter((req) => req.status === 'approved').length;
    const openTickets = tickets.filter((ticket) => ticket.status !== 'resolved').length;
    const openIssues = issues.filter((issue) => issue.status !== 'resolved').length;

    return [
      { label: 'Pending approvals', value: pending, change: pending ? `+${pending} awaiting` : 'Up to date' },
      { label: 'Active schools', value: approved, change: approved ? '+1 this week' : 'No activations' },
      { label: 'Open tickets', value: openTickets, change: 'SLA 4h' },
      { label: 'Issues to resolve', value: openIssues, change: openIssues ? 'Prioritise today' : 'All clear' }
    ];
  }, [requests, tickets, issues]);
  const fetchRequests = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token || !API_BASE) {
      setRequests(initialSchoolRequests);
      return;
    }
    setRequestLoading(true);
    setRequestError(null);
    try {
      const response = await fetch(`${API_BASE}/api/schools/registrations/pending`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Unable to load school registrations');
      }
      const data = await response.json();
      const normalized = Array.isArray(data) ? data.map(normalizeRegistration) : [];
      setRequests(normalized);
    } catch (error) {
      console.error('Failed to fetch registrations', error);
      setRequestError(error.message || 'Unable to load registrations');
    } finally {
      setRequestLoading(false);
    }
  }, []);

  useEffect(() => {
    setCredentials((prev) => {
      const updated = { ...prev };
      requests.forEach((request) => {
        if (!updated[request.id]) {
          updated[request.id] = {
            password: '',
            status: 'not_generated',
            lastGenerated: null,
            lastReset: null
          };
        }
      });
      return updated;
    });
  }, [requests]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    const handleRefresh = () => fetchRequests();
    window.addEventListener('super-admin-refresh-requests', handleRefresh);
    return () => window.removeEventListener('super-admin-refresh-requests', handleRefresh);
  }, [fetchRequests]);

  const handleRequestUpdate = (requestId, status, note) => {
    setRequests((prev) =>
      prev.map((request) =>
        request.id === requestId
          ? {
              ...request,
              status,
              notes: note ?? request.notes,
              updatedAt: new Date().toISOString()
            }
          : request
      )
    );
  };

  const handleFeedbackUpdate = (feedbackId, updates) => {
    setFeedbackItems((prev) =>
      prev.map((item) =>
        item.id === feedbackId
          ? {
              ...item,
              ...updates,
              updatedAt: new Date().toISOString()
            }
          : item
      )
    );
  };

  const handleIssueUpdate = (issueId, updates) => {
    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === issueId
          ? {
              ...issue,
              ...updates,
              updatedAt: new Date().toISOString()
            }
          : issue
      )
    );
  };

  const handleTicketUpdate = (ticketId, updates) => {
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              ...updates,
              updatedAt: new Date().toISOString()
            }
          : ticket
      )
    );
  };

  const pushActivity = (entry) => {
    setActivityFeed((prev) => [
      {
        id: `ACT-${Date.now()}`,
        timestamp: new Date().toISOString(),
        ...entry
      },
      ...prev
    ]);
  };

  const handleAnnouncementCreate = ({ title, message, audience }) => {
    const newAnnouncement = {
      id: `BC-${Date.now()}`,
      title,
      message,
      audience,
      createdAt: new Date().toISOString(),
      owner: profile.name,
      status: 'scheduled'
    };
    setAnnouncements((prev) => [newAnnouncement, ...prev]);
    pushActivity({ label: `Broadcast scheduled: ${title}`, type: 'broadcast' });
  };

  const handleComplianceUpdate = (itemId, status) => {
    setComplianceItems((prev) => {
      const updated = prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              status
            }
          : item
      );
      const updatedItem = prev.find((item) => item.id === itemId);
      if (updatedItem) {
        pushActivity({ label: `Compliance ${status}: ${updatedItem.title}`, type: 'compliance' });
      }
      return updated;
    });
  };

  const handleCredentialGenerate = (schoolId) => {
    const password = generateSecurePassword();
    setCredentials((prev) => ({
      ...prev,
      [schoolId]: {
        ...prev[schoolId],
        password,
        status: 'generated',
        lastGenerated: new Date().toISOString()
      }
    }));
  };

  const handleCredentialReset = (schoolId) => {
    setCredentials((prev) => ({
      ...prev,
      [schoolId]: {
        ...prev[schoolId],
        status: 'reset_sent',
        lastReset: new Date().toISOString()
      }
    }));
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/auth/profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`
          }
        });
        if (!res.ok) return;
        const data = await res.json();
        setProfile((prev) => ({
          ...prev,
          name: data.name || data.username || prev.name,
          email: data.email || data.username || prev.email,
          avatar: data.avatar || ''
        }));
      } catch (err) {
        console.error('Failed to load super admin profile', err);
      }
    };

    fetchProfile();
  }, []);

  return (
    <SuperAdminLayout
      sidebarCollapsed={sidebarCollapsed}
      onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
      insights={insights}
      profile={profile}
    >
      <Routes>
        <Route path="overview" element={
          <Overview
            requests={requests}
            feedbackItems={feedbackItems}
            issues={issues}
            tickets={tickets}
            onRequestAction={handleRequestUpdate}
            onIssueUpdate={handleIssueUpdate}
            onTicketUpdate={handleTicketUpdate}
            onFeedbackUpdate={handleFeedbackUpdate}
          />
        } />
        <Route path="requests" element={
          <Requests
            requests={requests}
            onRequestAction={handleRequestUpdate}
            loading={requestLoading}
            error={requestError}
            onRefresh={fetchRequests}
          />
        } />
        <Route path="feedback" element={
          <Feedback
            feedbackItems={feedbackItems}
            onFeedbackUpdate={handleFeedbackUpdate}
          />
        } />
        <Route path="issues" element={
          <Issues
            issues={issues}
            onIssueUpdate={handleIssueUpdate}
          />
        } />
        <Route path="tickets" element={
          <Tickets
            tickets={tickets}
            onTicketUpdate={handleTicketUpdate}
          />
        } />
        <Route path="credentials" element={
          <Credentials
            requests={requests}
            credentialState={credentials}
            onGenerateCredential={handleCredentialGenerate}
            onResetCredential={handleCredentialReset}
          />
        } />
        <Route path="operations" element={
          <Operations
            announcements={announcements}
            onCreateAnnouncement={handleAnnouncementCreate}
            complianceItems={complianceItems}
            onComplianceUpdate={handleComplianceUpdate}
            activityFeed={activityFeed}
          />
        } />
        <Route path="id-pass" element={<IDPass profile={profile} />} />
        <Route index element={<Navigate to="/super-admin/overview" replace />} />
        <Route path="*" element={<Navigate to="/super-admin/overview" replace />} />
      </Routes>
    </SuperAdminLayout>
  );
};

export default SuperAdminApp;
