export const initialSchoolRequests = [
  {
    id: 'REQ-101',
    schoolName: 'Delhi Public School',
    board: 'CBSE',
    studentCount: '1200+',
    contactPerson: 'Rajesh Kumar',
    contactEmail: 'admin@dps.edu',
    submittedAt: '2024-01-15T10:30:00Z',
    status: 'pending',
    notes: 'Verified documents, awaiting final approval.',
    campuses: 3
  },
  {
    id: 'REQ-102',
    schoolName: 'International School of Mumbai',
    board: 'IB',
    studentCount: '800',
    contactPerson: 'Priya Sharma',
    contactEmail: 'contact@ismumbai.edu',
    submittedAt: '2024-01-10T14:20:00Z',
    status: 'approved',
    notes: 'Activated Premium subscription.',
    campuses: 1
  },
  {
    id: 'REQ-103',
    schoolName: 'Cambridge Academy Bangalore',
    board: 'ICSE',
    studentCount: '1500+',
    contactPerson: 'Anil Reddy',
    contactEmail: 'info@cambridge-blr.edu',
    submittedAt: '2023-12-20T09:15:00Z',
    status: 'approved',
    notes: 'Onboarding complete, awaiting payment confirmation.',
    campuses: 2
  },
  {
    id: 'REQ-104',
    schoolName: 'Springfield Public School',
    board: 'State Board',
    studentCount: '650',
    contactPerson: 'Sneha Joshi',
    contactEmail: 'principal@springfield.edu',
    submittedAt: '2024-02-02T08:00:00Z',
    status: 'pending',
    notes: 'Need clarification on transport integration.',
    campuses: 1
  },
  {
    id: 'REQ-105',
    schoolName: 'Heritage Valley School',
    board: 'Cambridge',
    studentCount: '500',
    contactPerson: 'Vikram Malhotra',
    contactEmail: 'hello@heritagevalley.edu',
    submittedAt: '2024-02-05T11:45:00Z',
    status: 'review',
    notes: 'Uploaded revised compliance certificate.',
    campuses: 1
  }
];

export const initialFeedback = [
  {
    id: 'FDB-301',
    schoolName: 'Delhi Public School',
    topic: 'Transport module enhancement',
    message: 'Need ability to bulk import GPS reports and share with parents.',
    submittedAt: '2024-02-03T07:30:00Z',
    sentiment: 'positive',
    status: 'awaiting_response'
  },
  {
    id: 'FDB-302',
    schoolName: 'Cambridge Academy Bangalore',
    topic: 'Billing workflow',
    message: 'Invoices should support multi-currency support for international branches.',
    submittedAt: '2024-02-01T13:15:00Z',
    sentiment: 'neutral',
    status: 'in_progress',
    response: 'Shared beta build ETA for next sprint.'
  },
  {
    id: 'FDB-303',
    schoolName: 'International School of Mumbai',
    topic: 'Timetable automation',
    message: 'Would like AI suggestions for teacher allocation.',
    submittedAt: '2024-01-28T10:00:00Z',
    sentiment: 'positive',
    status: 'resolved',
    response: 'Enabled Labs feature for the school.'
  }
];

export const initialIssues = [
  {
    id: 'ISS-501',
    title: 'Payment webhook failed',
    severity: 'high',
    reportedBy: 'Cambridge Academy Bangalore',
    reportedAt: '2024-02-04T05:50:00Z',
    status: 'open',
    owner: 'DevOps',
    description: 'Subscription renewal payment is not reflecting in finance dashboard.'
  },
  {
    id: 'ISS-502',
    title: 'Transport GPS sync delay',
    severity: 'medium',
    reportedBy: 'Delhi Public School',
    reportedAt: '2024-02-02T12:25:00Z',
    status: 'investigating',
    owner: 'Platform',
    description: 'Data refresh delayed by ~30 minutes during evening routes.'
  },
  {
    id: 'ISS-503',
    title: 'Teacher onboarding emails not delivered',
    severity: 'low',
    reportedBy: 'Springfield Public School',
    reportedAt: '2024-02-01T09:40:00Z',
    status: 'resolved',
    owner: 'Support',
    description: 'SES quota exceeded temporarily, re-sent emails after cooldown.'
  }
];

export const initialTickets = [
  {
    id: 'TCK-801',
    schoolName: 'Heritage Valley School',
    category: 'Access',
    subject: 'Principal login locked',
    openedAt: '2024-02-05T06:00:00Z',
    status: 'open',
    owner: 'Support Team A',
    priority: 'high'
  },
  {
    id: 'TCK-802',
    schoolName: 'International School of Mumbai',
    category: 'Integration',
    subject: 'Need ERP API credentials',
    openedAt: '2024-02-03T15:20:00Z',
    status: 'in_progress',
    owner: 'Solutions Desk',
    priority: 'medium'
  },
  {
    id: 'TCK-803',
    schoolName: 'Cambridge Academy Bangalore',
    category: 'Billing',
    subject: 'GST update for invoices',
    openedAt: '2024-02-01T08:10:00Z',
    status: 'resolved',
    owner: 'Finance Ops',
    priority: 'low'
  }
];

export const initialAnnouncements = [
  {
    id: 'BC-201',
    title: 'Infrastructure maintenance window',
    message: 'Scheduled downtime on 8 Feb, 11pm-12am IST for database upgrades.',
    audience: 'All schools',
    createdAt: '2024-02-05T04:45:00Z',
    owner: 'Platform Ops',
    status: 'scheduled'
  },
  {
    id: 'BC-202',
    title: 'New transport analytics beta',
    message: 'Enroll to test bus route optimization engine. Seats limited.',
    audience: 'Premium schools',
    createdAt: '2024-02-02T10:15:00Z',
    owner: 'Product',
    status: 'sent'
  }
];

export const initialComplianceItems = [
  {
    id: 'CMP-401',
    title: 'Data residency attestation',
    status: 'pending',
    owner: 'Legal',
    dueDate: '2024-02-10'
  },
  {
    id: 'CMP-402',
    title: 'SOC2 quarterly backup drill',
    status: 'in_progress',
    owner: 'Security',
    dueDate: '2024-02-08'
  },
  {
    id: 'CMP-403',
    title: 'GDPR DPIA update',
    status: 'completed',
    owner: 'Privacy Office',
    dueDate: '2024-01-28'
  }
];

export const initialActivityFeed = [
  {
    id: 'ACT-601',
    label: 'Approved Heritage Valley onboarding',
    timestamp: '2024-02-05T07:30:00Z',
    type: 'approval'
  },
  {
    id: 'ACT-602',
    label: 'Escalated payment webhook issue to DevOps',
    timestamp: '2024-02-04T10:20:00Z',
    type: 'incident'
  },
  {
    id: 'ACT-603',
    label: 'Broadcast transport analytics beta invite',
    timestamp: '2024-02-02T11:15:00Z',
    type: 'broadcast'
  }
];
