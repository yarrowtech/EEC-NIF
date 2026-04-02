// Mock data for Parents Portal tests

export const mockParentProfile = {
  _id: 'parent123',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  children: [
    {
      _id: 'student1',
      studentId: 'STU001',
      name: 'Alice Doe',
      class: '5',
      section: 'A',
      session: '2025-2026',
    },
    {
      _id: 'student2',
      studentId: 'STU002',
      name: 'Bob Doe',
      class: '3',
      section: 'B',
      session: '2025-2026',
    },
  ],
};

export const mockAttendanceData = [
  {
    student: {
      _id: 'student1',
      studentId: 'STU001',
      name: 'Alice Doe',
    },
    attendance: [
      {
        _id: 'att1',
        date: '2025-01-15',
        status: 'present',
        session: 'Morning',
        markedAt: '2025-01-15T09:00:00Z',
      },
      {
        _id: 'att2',
        date: '2025-01-16',
        status: 'absent',
        session: 'Morning',
        markedAt: '2025-01-16T09:00:00Z',
      },
    ],
    attendancePercentage: 75,
    totalPresent: 15,
    totalAbsent: 5,
    totalSessions: 20,
  },
];

export const mockReportCards = [
  {
    _id: 'report1',
    student: 'student1',
    studentName: 'Alice Doe',
    class: '5',
    section: 'A',
    examName: 'Mid Term 2025',
    examDate: '2025-01-10',
    overallPercentage: 85.5,
    totalMarks: 500,
    obtainedMarks: 427.5,
    grade: 'A',
    subjects: [
      {
        subjectName: 'Mathematics',
        totalMarks: 100,
        obtainedMarks: 92,
        percentage: 92,
        grade: 'A+',
      },
      {
        subjectName: 'Science',
        totalMarks: 100,
        obtainedMarks: 85,
        percentage: 85,
        grade: 'A',
      },
      {
        subjectName: 'English',
        totalMarks: 100,
        obtainedMarks: 78,
        percentage: 78,
        grade: 'B+',
      },
    ],
  },
];

export const mockInvoices = [
  {
    _id: 'invoice1',
    studentId: 'student1',
    studentName: 'Alice Doe',
    invoiceNumber: 'INV-2025-001',
    description: 'Tuition Fee - January 2025',
    amount: 5000,
    paidAmount: 0,
    dueDate: '2025-01-31',
    status: 'pending',
    createdAt: '2025-01-01',
  },
  {
    _id: 'invoice2',
    studentId: 'student1',
    studentName: 'Alice Doe',
    invoiceNumber: 'INV-2024-012',
    description: 'Tuition Fee - December 2024',
    amount: 5000,
    paidAmount: 5000,
    dueDate: '2024-12-31',
    status: 'paid',
    createdAt: '2024-12-01',
  },
];

export const mockMeetings = [
  {
    _id: 'meeting1',
    parent: 'parent123',
    teacher: {
      _id: 'teacher1',
      name: 'Mr. Smith',
      subject: 'Mathematics',
    },
    student: {
      _id: 'student1',
      name: 'Alice Doe',
    },
    meetingType: 'video',
    status: 'scheduled',
    scheduledDate: '2025-02-01T10:00:00Z',
    duration: 30,
    meetingLink: 'https://meet.jit.si/ptm-meeting1',
    agenda: 'Discuss academic progress',
  },
  {
    _id: 'meeting2',
    parent: 'parent123',
    teacher: {
      _id: 'teacher2',
      name: 'Mrs. Johnson',
      subject: 'Science',
    },
    student: {
      _id: 'student1',
      name: 'Alice Doe',
    },
    meetingType: 'in-person',
    status: 'pending',
    scheduledDate: '2025-02-05T14:00:00Z',
    duration: 30,
    agenda: 'Discuss behavior',
  },
];

export const mockComplaints = [
  {
    _id: 'complaint1',
    parent: 'parent123',
    category: 'academic',
    priority: 'medium',
    subject: 'Homework Issues',
    description: 'Too much homework assigned',
    status: 'open',
    createdAt: '2025-01-20T10:00:00Z',
    updatedAt: '2025-01-20T10:00:00Z',
  },
  {
    _id: 'complaint2',
    parent: 'parent123',
    category: 'transport',
    priority: 'high',
    subject: 'Bus Delay',
    description: 'School bus consistently late',
    status: 'in-progress',
    createdAt: '2025-01-18T09:00:00Z',
    updatedAt: '2025-01-19T15:00:00Z',
  },
];

export const mockChatThreads = [
  {
    _id: 'thread1',
    participants: [
      {
        _id: 'parent123',
        name: 'John Doe',
        role: 'parent',
      },
      {
        _id: 'teacher1',
        name: 'Mr. Smith',
        role: 'teacher',
      },
    ],
    lastMessage: {
      content: 'Hello, how is Alice doing?',
      timestamp: '2025-01-20T14:30:00Z',
      sender: 'parent123',
    },
    unreadCount: 0,
  },
];

export const mockChatMessages = [
  {
    _id: 'msg1',
    threadId: 'thread1',
    sender: 'parent123',
    senderName: 'John Doe',
    content: 'Hello, how is Alice doing?',
    timestamp: '2025-01-20T14:30:00Z',
    status: 'read',
  },
  {
    _id: 'msg2',
    threadId: 'thread1',
    sender: 'teacher1',
    senderName: 'Mr. Smith',
    content: 'She is doing great! Very attentive in class.',
    timestamp: '2025-01-20T14:35:00Z',
    status: 'delivered',
  },
];

export const mockClassRoutine = {
  student: 'student1',
  class: '5',
  section: 'A',
  routine: [
    {
      day: 'Monday',
      classes: [
        {
          time: '09:00-10:00',
          subject: 'Mathematics',
          instructor: 'Mr. Smith',
          room: 'Room 101',
        },
        {
          time: '10:00-11:00',
          subject: 'Science',
          instructor: 'Mrs. Johnson',
          room: 'Lab 1',
        },
      ],
    },
    {
      day: 'Tuesday',
      classes: [
        {
          time: '09:00-10:00',
          subject: 'English',
          instructor: 'Ms. Williams',
          room: 'Room 102',
        },
      ],
    },
  ],
};

export const mockHolidays = [
  {
    _id: 'holiday1',
    name: 'Winter Break',
    startDate: '2025-12-20',
    endDate: '2025-12-31',
    description: 'Winter vacation',
  },
  {
    _id: 'holiday2',
    name: 'Republic Day',
    startDate: '2026-01-26',
    endDate: '2026-01-26',
    description: 'National holiday',
  },
];

export const mockAchievements = [
  {
    _id: 'achievement1',
    student: 'student1',
    title: 'First Prize in Math Olympiad',
    description: 'Won gold medal in district level competition',
    category: 'academic',
    date: '2025-01-15',
    awardType: 'Gold Medal',
    issuer: 'District Education Board',
    certificateUrl: 'https://example.com/cert1.pdf',
  },
  {
    _id: 'achievement2',
    student: 'student1',
    title: 'Best Player Award',
    description: 'Outstanding performance in inter-school football',
    category: 'sports',
    date: '2024-12-10',
    awardType: 'Trophy',
    issuer: 'Sports Association',
  },
];

export const mockObservations = [
  {
    _id: 'obs1',
    student: 'student1',
    parent: 'parent123',
    date: '2025-01-15',
    homeBehavior: {
      obedience: 'often',
      respect: 'always',
      discipline: 'often',
    },
    communication: {
      openness: 'very-open',
      confidence: 'confident',
      listening: 'good',
    },
    emotionalState: {
      mood: 'happy',
      stress: 'low',
    },
    remarks: 'Child is doing well at home',
    concernLevel: 'low',
  },
];

export const mockRazorpayOrder = {
  id: 'order_razorpay123',
  amount: 500000, // in paise (5000 INR)
  currency: 'INR',
  receipt: 'receipt_invoice1',
};

export const mockRazorpayPayment = {
  razorpay_payment_id: 'pay_razorpay456',
  razorpay_order_id: 'order_razorpay123',
  razorpay_signature: 'signature_abc123',
};
