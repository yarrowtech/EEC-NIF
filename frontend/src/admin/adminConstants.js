import { 
  Home, 
  BarChart3, 
  Users, 
  GraduationCap, 
  UserCheck, 
  Calendar,
  ClipboardList,
  FileText,
  IndianRupee,
  Briefcase
} from 'lucide-react';

export const ADMIN_MENU_ITEMS = [
  { 
    icon: Home, 
    label: 'Dashboard', 
    path: '/admin/dashboard',
    active: true 
  },
  { 
    icon: BarChart3, 
    label: 'Analytics', 
    path: '/admin/analytics' 
  },
  { 
    icon: Users, 
    label: 'Teachers', 
    path: '/admin/teachers' 
  },
  { 
    icon: GraduationCap, 
    label: 'Students', 
    path: '/admin/students' 
  },
  { 
    icon: UserCheck, 
    label: 'Parents', 
    path: '/admin/parents' 
  },
  { 
    icon: Calendar, 
    label: 'Subjects', 
    path: '/admin/subjects' 
  },
  { 
    icon: ClipboardList, 
    label: 'Student Attendance', 
    path: '/admin/attendance' 
  },
  { 
    icon: Calendar, 
    label: 'Examination Management', 
    path: '/admin/examination'
  },
  { 
    icon: Calendar, 
    label: 'Routines', 
    path: '/admin/routines' 
  },
  { 
    icon: Calendar, 
    label: 'Teacher Timetable', 
    path: '/admin/timetable' 
  },
  { 
    icon: ClipboardList, 
    label: 'Lesson Plan', 
    path: '/admin/lesson-plans',
    hasSubmenu: true
  },
  { 
    icon: FileText, 
    label: 'Result', 
    path: '/admin/result' 
  },
  { 
    icon: IndianRupee, 
    label: 'Fees Collection', 
    path: '/admin/fees' 
  },
  { 
    icon: Briefcase, 
    label: 'HR', 
    path: '/admin/hr' 
  }
];

export const ADMIN_EMPLOYEE_DATA = [
  {
    id: 1,
    name: 'Ryan Harrington',
    role: 'iOS Developer',
    avatar: '👨‍💻',
    time: '9hr 20m',
    progress: 75,
    color: 'bg-blue-500',
    status: 'active'
  },
  {
    id: 2,
    name: 'Louisa Norton',
    role: 'UI/UX Designer',
    avatar: '👩‍💼',
    time: '4hr',
    progress: 45,
    color: 'bg-red-500',
    status: 'active'
  }
];

export const ADMIN_STATS = {
  totalSales: '$48.9k',
  salesIncrease: '57.6%',
  totalStudents: 1250,
  totalTeachers: 85
};
