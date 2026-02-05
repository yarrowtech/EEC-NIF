import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  BookOpen, 
  CreditCard, 
  Activity,
  Bell,
  Video,
  TrendingUp,
  AlertCircle,
  Monitor,
  Eye,
  Clock,
  User,
  BarChart3,
  Camera,
  MapPin,
  Heart,
  Smile,
  Wifi,
  Battery,
  Shield,
  Star,
  Sparkles,
  Sun,
  Home,
  Users,
  Award,
  ChevronRight
} from 'lucide-react';

const ParentDashboard = ({ parentName, childrenNames = [] }) => {
  const [monitorData, setMonitorData] = useState({
    isOnline: true,
    lastActivity: 'Just now',
    currentLocation: 'Mathematics Classroom',
    healthStatus: 'Good',
    moodRating: 4,
    connectionStrength: 'Strong',
    batteryLevel: 85,
    safetyStatus: 'Secure',
    activityLevel: 'Active'
  });

  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());
  const [childName] = useState('Emma'); // This would come from user data
  const [currentTime, setCurrentTime] = useState(new Date());

  const quickStats = [
    { label: 'Attendance Rate', value: '95%', icon: Calendar, color: 'green' },
    { label: 'Assignments Due', value: '3', icon: BookOpen, color: 'red' },
    { label: 'Upcoming PTMs', value: '2', icon: Video, color: 'blue' },
    { label: 'Pending Fees', value: '$0', icon: CreditCard, color: 'yellow' }
  ];

  const notifications = [
    {
      id: 1,
      type: 'ptm',
      message: 'Parent-Teacher Meeting scheduled for Mathematics',
      time: '1 hour ago',
      priority: 'high'
    },
    {
      id: 2,
      type: 'assignment',
      message: 'New Science assignment due next week',
      time: '3 hours ago',
      priority: 'medium'
    },
    {
      id: 3,
      type: 'health',
      message: 'Health check-up scheduled for next Monday',
      time: '1 day ago',
      priority: 'low'
    }
  ];

  const recentObservations = [
    {
      id: 1,
      time: '10:30 AM',
      activity: 'Math Class Participation',
      mood: '😊',
      notes: 'Actively engaged in problem solving'
    },
    {
      id: 2,
      time: '12:15 PM',
      activity: 'Lunch Break',
      mood: '🙂',
      notes: 'Playing with friends in the playground'
    },
    {
      id: 3,
      time: '2:45 PM',
      activity: 'Science Lab',
      mood: '😐',
      notes: 'Seemed tired, less participation'
    }
  ];

  const liveMetrics = [
    { label: 'Current Activity', value: 'In Class', status: 'active' },
    { label: 'Attention Level', value: '85%', status: 'good' },
    { label: 'Social Interaction', value: 'High', status: 'excellent' },
    { label: 'Mood Today', value: 'Happy', status: 'good' }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'active': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthStatusIndicator = (status) => {
    switch(status.toLowerCase()) {
      case 'excellent': return { color: 'bg-green-500', text: 'text-green-600', label: 'Excellent' };
      case 'good': return { color: 'bg-blue-500', text: 'text-blue-600', label: 'Good' };
      case 'fair': return { color: 'bg-yellow-500', text: 'text-yellow-600', label: 'Fair' };
      case 'poor': return { color: 'bg-red-500', text: 'text-red-600', label: 'Poor' };
      default: return { color: 'bg-gray-500', text: 'text-gray-600', label: status };
    }
  };

  const getConnectionIndicator = (strength) => {
    switch(strength.toLowerCase()) {
      case 'strong': return { color: 'bg-green-500', bars: 4 };
      case 'good': return { color: 'bg-blue-500', bars: 3 };
      case 'weak': return { color: 'bg-yellow-500', bars: 2 };
      case 'poor': return { color: 'bg-red-500', bars: 1 };
      default: return { color: 'bg-gray-500', bars: 0 };
    }
  };

  const getBatteryColor = (level) => {
    if (level > 50) return 'text-green-600';
    if (level > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdateTime(new Date());
      setCurrentTime(new Date());
      
      // Simulate real-time data changes
      setMonitorData(prev => ({
        ...prev,
        batteryLevel: Math.max(20, prev.batteryLevel + (Math.random() > 0.5 ? -1 : 1)),
        lastActivity: 'Just now',
        activityLevel: ['Active', 'Moderate', 'Low'][Math.floor(Math.random() * 3)]
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="w-full px-2 sm:px-3 md:px-3 lg:px-3 py-4 sm:py-5 lg:py-6">
        {/* Redesigned Welcome Header */}
        <div className="relative overflow-hidden bg-white rounded-3xl shadow-2xl mb-8 lg:mb-10 border border-gray-100">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Gradient Orbs */}
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-500/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-300/10 to-blue-300/10 rounded-full blur-3xl"></div>

            {/* Dot Pattern */}
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}></div>
          </div>

          <div className="relative z-10">
            {/* Top Colored Bar */}
            <div className="h-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600"></div>

            <div className="p-6 sm:p-8 lg:p-10">
              {/* Header Section */}
              <div className="flex flex-col lg:flex-row items-start lg:items-start justify-between gap-6 mb-8">
                <div className="flex-1">
                  {/* Greeting Badge */}
                  <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full px-4 py-2 mb-4 shadow-sm border border-indigo-200/50">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {getGreeting()}, {parentName || 'Parent'}! 👋
                    </span>
                  </div>

                  {/* Main Title */}
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 leading-tight">
                    <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                      Welcome to
                    </span>
                    <br />
                    <span className="text-gray-800">Parent Portal</span>
                  </h1>

                  {/* Description */}
                  <p className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl mb-6">
                    Stay connected with your child's journey, track their progress, and celebrate their achievements together.
                  </p>

                  {/* Info Cards */}
                  <div className="flex flex-wrap gap-3 sm:gap-4">
                    <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200/50 rounded-xl px-4 py-2.5 shadow-sm">
                      <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                      <span className="text-xs sm:text-sm font-semibold text-gray-700">
                        {currentTime.toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-xl px-4 py-2.5 shadow-sm">
                      <div className="relative">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-gray-700">School Active</span>
                    </div>
                  </div>
                </div>

                {/* Right Side Icon Section */}
                <div className="flex items-center gap-4">
                  {/* Stats Cards */}
                  <div className="hidden sm:flex flex-col gap-3">
                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-4 shadow-lg text-white min-w-[140px]">
                      <div className="flex items-center justify-between mb-1">
                        <Home className="w-5 h-5 opacity-80" />
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div className="text-2xl font-bold">95%</div>
                      <div className="text-xs opacity-90 font-medium">Attendance</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 shadow-lg text-white min-w-[140px]">
                      <div className="flex items-center justify-between mb-1">
                        <Award className="w-5 h-5 opacity-80" />
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="text-2xl font-bold">24</div>
                      <div className="text-xs opacity-90 font-medium">Achievements</div>
                    </div>
                  </div>

                  {/* Decorative Circle */}
                  <div className="hidden lg:block relative">
                    <div className="w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center shadow-xl border-4 border-white">
                      <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                        <Sparkles className="w-12 h-12 text-white animate-pulse" />
                      </div>
                    </div>
                    <div className="absolute -top-2 -right-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-md border-2 border-white">
                        <Star className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Pills */}
              <div className="flex flex-wrap gap-2 sm:gap-3 pt-6 border-t border-gray-100">
                {childrenNames.length > 0 && (
                  <div className="group flex items-center space-x-2 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200/50 rounded-full px-4 py-2.5 shadow-sm hover:shadow-md transition-all cursor-pointer">
                    <div className="p-1 bg-cyan-500 rounded-full">
                      <Users className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-gray-700">
                      {childrenNames.join(', ')}
                    </span>
                  </div>
                )}
                <div className="group flex items-center space-x-2 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200/50 rounded-full px-4 py-2.5 shadow-sm hover:shadow-md transition-all cursor-pointer">
                  <div className="p-1 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full">
                    <Award className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-gray-700">3 New Achievements</span>
                </div>
                <div className="group flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-full px-4 py-2.5 shadow-sm hover:shadow-md transition-all cursor-pointer">
                  <div className="p-1 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full">
                    <Bell className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-gray-700">2 Updates Today</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mb-8 lg:mb-10">
          {quickStats.map((stat, index) => (
            <div
              key={index}
              className="group bg-white/90 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-5 sm:p-6 border border-gray-100 hover:border-gray-200 hover:-translate-y-1 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br shadow-md ${
                  stat.color === 'green' ? 'from-green-100 to-green-200' :
                  stat.color === 'red' ? 'from-red-100 to-red-200' :
                  stat.color === 'blue' ? 'from-blue-100 to-blue-200' :
                  'from-yellow-100 to-yellow-200'
                } group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${
                    stat.color === 'green' ? 'text-green-600' :
                    stat.color === 'red' ? 'text-red-600' :
                    stat.color === 'blue' ? 'text-blue-600' :
                    'text-yellow-600'
                  }`} />
                </div>
              </div>

              <div>
                <p className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{stat.label}</p>
                <p className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">{stat.value}</p>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden shadow-inner">
                  <div className={`h-2 rounded-full bg-gradient-to-r ${
                    stat.color === 'green' ? 'from-green-400 to-green-600' :
                    stat.color === 'red' ? 'from-red-400 to-red-600' :
                    stat.color === 'blue' ? 'from-blue-400 to-blue-600' :
                    'from-yellow-400 to-yellow-600'
                  } transition-all duration-500 shadow-sm`}
                  style={{ width: stat.color === 'green' ? '95%' : stat.color === 'red' ? '30%' : stat.color === 'blue' ? '50%' : '100%' }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Monitor Portal Section */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-100 mb-8 lg:mb-10 overflow-hidden">
          <div className="p-5 sm:p-6 lg:p-8 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center space-x-3 sm:space-x-4">
                <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                  <Monitor className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Live Child Monitor</h2>
                    <div className="px-3 py-1 bg-gradient-to-r from-green-400 to-green-500 rounded-full shadow-sm">
                      <span className="text-white text-xs font-bold tracking-wide">LIVE</span>
                    </div>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600">Real-time insights into {childName}'s school activities</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 self-end sm:self-auto">
                <div className="flex items-center space-x-2 bg-green-50 rounded-full px-4 py-2 shadow-sm border border-green-100">
                  <div className="relative">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                  </div>
                  <span className="text-sm text-green-700 font-semibold">Online</span>
                </div>
                <button className="p-2 hover:bg-white rounded-xl transition-all duration-200 hover:shadow-md">
                  <ChevronRight className="w-5 h-5 text-gray-400 hover:text-blue-500 transition-colors" />
                </button>
              </div>
            </div>
          </div>
        
          <div className="p-5 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 mb-6 lg:mb-8">
              {liveMetrics.map((metric, index) => (
                <div
                  key={index}
                  className="group bg-gradient-to-br from-gray-50 to-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
                >
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{metric.label}</p>
                      <div className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${getStatusColor(metric.status)}`}>
                        {metric.status.toUpperCase()}
                      </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{metric.value}</p>
                  </div>
                </div>
              ))}
            </div>
          
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
              {/* Enhanced Live Activity Stream */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 sm:p-6 border border-blue-100 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-blue-500 rounded-xl shadow-md">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-800">Today's Activity Stream</h3>
                  </div>
                  <div className="text-xs text-blue-600 font-bold bg-blue-100 px-3 py-1.5 rounded-full shadow-sm">
                    LIVE
                  </div>
                </div>
                <div className="space-y-3 max-h-72 lg:max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-50">
                  {recentObservations.map((observation) => (
                    <div
                      key={observation.id}
                      className="group flex items-start space-x-3 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-blue-100 hover:bg-white hover:shadow-md transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-11 h-11 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                          <Clock className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2 gap-2">
                          <div className="flex items-center space-x-2 flex-1">
                            <p className="text-sm font-bold text-gray-800 line-clamp-1">{observation.activity}</p>
                            <span className="text-lg flex-shrink-0">{observation.mood}</span>
                          </div>
                          <span className="text-xs text-blue-600 font-semibold bg-blue-100 px-2.5 py-1 rounded-full whitespace-nowrap">
                            {observation.time}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{observation.notes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            
            {/* Enhanced Child Status Panel */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-500 rounded-xl shadow-md">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-800">Current Status</h3>
                </div>
                <div className="flex items-center space-x-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-700 font-semibold">
                    {lastUpdateTime.toLocaleTimeString()}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                {/* Location Status */}
                <div className="group bg-white rounded-xl p-4 border-l-4 border-blue-500 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                        <MapPin className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-semibold text-gray-600">Location</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-800 font-bold">{monitorData.currentLocation}</span>
                      <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-sm"></div>
                    </div>
                  </div>
                </div>

                {/* Health Status */}
                <div className="group bg-white rounded-xl p-4 border-l-4 border-green-500 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors">
                        <Heart className="w-4 h-4 text-red-500" />
                      </div>
                      <span className="text-sm font-semibold text-gray-600">Health Status</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-bold ${getHealthStatusIndicator(monitorData.healthStatus).text}`}>
                        {getHealthStatusIndicator(monitorData.healthStatus).label}
                      </span>
                      <div className={`w-3 h-3 rounded-full shadow-sm ${getHealthStatusIndicator(monitorData.healthStatus).color}`}></div>
                    </div>
                  </div>
                </div>

                {/* Activity Level */}
                <div className="group bg-white rounded-xl p-4 border-l-4 border-purple-500 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                        <Activity className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="text-sm font-semibold text-gray-600">Activity Level</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-800 font-bold">{monitorData.activityLevel}</span>
                      <div className={`w-3 h-3 rounded-full shadow-sm ${
                        monitorData.activityLevel === 'Active' ? 'bg-green-500 animate-pulse' :
                        monitorData.activityLevel === 'Moderate' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`}></div>
                    </div>
                  </div>
                </div>

                {/* Connection & Safety Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="group bg-white rounded-xl p-3.5 border-l-4 border-cyan-500 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-cyan-50 rounded-lg group-hover:bg-cyan-100 transition-colors">
                          <Wifi className="w-3.5 h-3.5 text-cyan-600" />
                        </div>
                        <span className="text-xs font-semibold text-gray-600">Connection</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-1 h-3 rounded-sm transition-all ${
                              i < getConnectionIndicator(monitorData.connectionStrength).bars
                                ? getConnectionIndicator(monitorData.connectionStrength).color
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="group bg-white rounded-xl p-3.5 border-l-4 border-emerald-500 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors">
                          <Shield className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                        <span className="text-xs font-semibold text-gray-600">Safety</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs text-emerald-600 font-bold">{monitorData.safetyStatus}</span>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-sm"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Battery & Mood Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="group bg-white rounded-xl p-3.5 border-l-4 border-yellow-500 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-yellow-50 rounded-lg group-hover:bg-yellow-100 transition-colors">
                          <Battery className="w-3.5 h-3.5 text-yellow-600" />
                        </div>
                        <span className="text-xs font-semibold text-gray-600">Device</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className={`text-xs font-bold ${getBatteryColor(monitorData.batteryLevel)}`}>
                          {monitorData.batteryLevel}%
                        </span>
                        <div className="w-5 h-2.5 border-2 border-gray-300 rounded-sm relative overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              monitorData.batteryLevel > 50 ? 'bg-green-500' :
                              monitorData.batteryLevel > 20 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.max(monitorData.batteryLevel, 10)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="group bg-white rounded-xl p-3.5 border-l-4 border-orange-500 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors">
                          <Smile className="w-3.5 h-3.5 text-orange-600" />
                        </div>
                        <span className="text-xs font-semibold text-gray-600">Mood</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-lg">😊</span>
                        <span className="text-xs text-gray-800 font-bold">{monitorData.moodRating}/5</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button className="flex-1 group flex items-center justify-center space-x-2 p-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg">
                    <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-semibold">View Observations</span>
                  </button>
                  <button className="flex-1 group flex items-center justify-center space-x-2 p-3.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg">
                    <BarChart3 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-semibold">Analytics</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
          {/* Enhanced Important Notifications */}
          <div className="lg:col-span-2 bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="p-5 sm:p-6 lg:p-7 border-b border-gray-100 bg-gradient-to-r from-orange-50/50 to-red-50/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl shadow-md">
                    <Bell className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Important Updates</h2>
                </div>
                <div className="text-xs text-orange-600 font-bold bg-orange-100 px-4 py-2 rounded-full shadow-sm border border-orange-200 self-start sm:self-auto">
                  {notifications.length} Updates
                </div>
              </div>
            </div>
            <div className="p-5 sm:p-6 lg:p-7">
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`group flex items-start space-x-4 p-4 sm:p-5 rounded-xl sm:rounded-2xl border-l-4 transition-all duration-300 hover:shadow-lg cursor-pointer ${
                      notification.priority === 'high'
                        ? 'bg-red-50 border-red-400 hover:bg-red-100/50'
                        : notification.priority === 'medium'
                        ? 'bg-yellow-50 border-yellow-400 hover:bg-yellow-100/50'
                        : 'bg-gray-50 border-gray-400 hover:bg-gray-100/50'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl shadow-sm ${
                      notification.priority === 'high'
                        ? 'bg-red-100 group-hover:bg-red-200'
                        : notification.priority === 'medium'
                        ? 'bg-yellow-100 group-hover:bg-yellow-200'
                        : 'bg-gray-100 group-hover:bg-gray-200'
                    } transition-colors`}>
                      <AlertCircle className={`w-5 h-5 ${
                        notification.priority === 'high'
                          ? 'text-red-600'
                          : notification.priority === 'medium'
                          ? 'text-yellow-600'
                          : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base font-semibold text-gray-800 leading-relaxed mb-3">{notification.message}</p>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <p className="text-xs sm:text-sm text-gray-500 font-medium">{notification.time}</p>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full shadow-sm ${
                          notification.priority === 'high'
                            ? 'bg-red-200 text-red-700'
                            : notification.priority === 'medium'
                            ? 'bg-yellow-200 text-yellow-700'
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {notification.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced Quick Actions */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="p-5 sm:p-6 lg:p-7 border-b border-gray-100 bg-gradient-to-r from-purple-50/50 to-indigo-50/50">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl shadow-md">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Quick Actions</h2>
              </div>
            </div>
            <div className="p-5 sm:p-6 lg:p-7">
              <div className="space-y-3 sm:space-y-4">
                <button className="w-full group flex items-center justify-between p-4 sm:p-5 text-left rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200/50 hover:border-blue-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="p-2.5 sm:p-3 bg-blue-500 rounded-xl shadow-md group-hover:scale-110 group-hover:bg-blue-600 transition-all">
                      <Video className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-sm sm:text-base text-gray-700 group-hover:text-blue-700 transition-colors">Schedule PTM</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </button>

                <button className="w-full group flex items-center justify-between p-4 sm:p-5 text-left rounded-xl sm:rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border border-green-200/50 hover:border-green-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="p-2.5 sm:p-3 bg-green-500 rounded-xl shadow-md group-hover:scale-110 group-hover:bg-green-600 transition-all">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-sm sm:text-base text-gray-700 group-hover:text-green-700 transition-colors">Pay Fees</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
                </button>

                <button className="w-full group flex items-center justify-between p-4 sm:p-5 text-left rounded-xl sm:rounded-2xl bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 border border-red-200/50 hover:border-red-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="p-2.5 sm:p-3 bg-red-500 rounded-xl shadow-md group-hover:scale-110 group-hover:bg-red-600 transition-all">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-sm sm:text-base text-gray-700 group-hover:text-red-700 transition-colors">Health Report</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
                </button>

                <button className="w-full group flex items-center justify-between p-4 sm:p-5 text-left rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-50 to-violet-50 hover:from-purple-100 hover:to-violet-100 border border-purple-200/50 hover:border-purple-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="p-2.5 sm:p-3 bg-purple-500 rounded-xl shadow-md group-hover:scale-110 group-hover:bg-purple-600 transition-all">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-sm sm:text-base text-gray-700 group-hover:text-purple-700 transition-colors">Observations</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard; 
