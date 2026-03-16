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
  Briefcase,
  Brain,
  Settings,
  Receipt,
  UserSearch,
  BarChart4,
  Layers,
  Building2,
  Shield,
  UserRound,
  LifeBuoy,
  Bell,
  ArrowUpCircle
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
    icon: IndianRupee,
    label: 'Fees Management',
    path: '/admin/fees/collection',
    hasSubmenu: true,
    submenu: [
      {
        icon: Layers,
        label: 'Fees Manage',
        path: '/admin/fees/manage'
      },
      {
        icon: Receipt,
        label: 'Fees Collection',
        path: '/admin/fees/collection'
      },
      {
        icon: BarChart4,
        label: 'Fees Dashboard',
        path: '/admin/fees/dashboard'
      }
    ]
  },
  {
    icon: Bell,
    label: 'Notices',
    path: '/admin/notices'
  },
  {
    icon: GraduationCap,
    label: 'Students',
    path: '/admin/students'
  },
  {
    icon: ArrowUpCircle,
    label: 'Promotion & Leave',
    path: '/admin/promotion'
  },
  {
    icon: ClipboardList,
    label: 'Student Attendance',
    path: '/admin/attendance'
  },
  // {
  //   icon: Brain,
  //   label: 'Student Wellbeing',
  //   path: '/admin/wellbeing'
  // },
  {
    icon: Users,
    label: 'Teachers',
    path: '/admin/teachers'
  },
  {
    icon: Calendar,
    label: 'Teacher Timetable',
    path: '/admin/timetable'
  },
  {
    icon: UserCheck,
    label: 'Parents',
    path: '/admin/parents'
  },
  {
    icon: Layers,
    label: 'Academic Setup',
    path: '/admin/academics'
  },
  {
    icon: Calendar,
    label: 'Subjects',
    path: '/admin/subjects'
  },
  {
    icon: Calendar,
    label: 'Routines',
    path: '/admin/routine'
  },
  {
    icon: ClipboardList,
    label: 'Lesson Plan',
    path: '/admin/lesson-plans'
  },
  {
    icon: Calendar,
    label: 'Exam Management',
    path: '/admin/examination'
  },
  {
    icon: FileText,
    label: 'Result Management',
    path: '/admin/result'
  },
  {
    icon: FileText,
    label: 'Report Cards',
    path: '/admin/report-cards'
  },
  {
    icon: Users,
    label: 'Staff',
    path: '/admin/staff'
  },
  {
    icon: Briefcase,
    label: 'HR',
    path: '/admin/hr'
  },
  {
    icon: LifeBuoy,
    label: 'Support',
    path: '/admin/support'
  },
  {
    icon: Building2,
    label: 'Schools',
    path: '/admin/schools',
    scope: 'super'
  },
  {
    icon: Shield,
    label: 'School Admins',
    path: '/admin/school-admins',
    scope: 'super'
  },
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
