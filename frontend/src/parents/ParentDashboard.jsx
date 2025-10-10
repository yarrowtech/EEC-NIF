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

const ParentDashboard = () => {
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
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="p-6">
        {/* Enhanced Welcome Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-2xl shadow-2xl mb-8">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full transform -translate-x-32 -translate-y-32"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full transform translate-x-48 translate-y-48"></div>
            <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-yellow-300 rounded-full transform -translate-x-16 -translate-y-16"></div>
          </div>
          
          <div className="relative z-10 p-8">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Home className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-white/80 text-sm font-medium">
                      {getGreeting()}, Parent! 👋
                    </p>
                    <h1 className="text-4xl font-bold text-white leading-tight">
                      Welcome to <span className="text-yellow-300">{childName}'s</span> Portal
                    </h1>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6 text-white/90">
                  <div className="flex items-center space-x-2">
                    <Sun className="w-5 h-5 text-yellow-300" />
                    <span className="text-sm font-medium">
                      {currentTime.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-green-300" />
                    <span className="text-sm font-medium">School Active</span>
                  </div>
                </div>
                
                <p className="text-white/80 mt-4 text-lg leading-relaxed">
                  Stay connected with your child's journey, track their progress, and celebrate their achievements together.
                </p>
              </div>
              
              <div className="hidden lg:block">
                <div className="relative">
                  <div className="w-32 h-32 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full flex items-center justify-center">
                      <Sparkles className="w-12 h-12 text-white animate-pulse" />
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Action Pills */}
            <div className="flex flex-wrap gap-3 mt-6">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white text-sm font-medium">{childName} is Online</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Award className="w-4 h-4 text-yellow-300" />
                <span className="text-white text-sm font-medium">3 New Achievements</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Bell className="w-4 h-4 text-blue-300" />
                <span className="text-white text-sm font-medium">2 Updates Today</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <div key={index} className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-white/20 hover:scale-105">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-800 mb-2">{stat.value}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full bg-gradient-to-r ${
                      stat.color === 'green' ? 'from-green-400 to-green-600' :
                      stat.color === 'red' ? 'from-red-400 to-red-600' :
                      stat.color === 'blue' ? 'from-blue-400 to-blue-600' :
                      'from-yellow-400 to-yellow-600'
                    } transition-all duration-300`} 
                    style={{ width: stat.color === 'green' ? '95%' : stat.color === 'red' ? '30%' : stat.color === 'blue' ? '50%' : '100%' }}></div>
                  </div>
                </div>
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${
                  stat.color === 'green' ? 'from-green-100 to-green-200' :
                  stat.color === 'red' ? 'from-red-100 to-red-200' :
                  stat.color === 'blue' ? 'from-blue-100 to-blue-200' :
                  'from-yellow-100 to-yellow-200'
                } group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`w-7 h-7 ${
                    stat.color === 'green' ? 'text-green-600' :
                    stat.color === 'red' ? 'text-red-600' :
                    stat.color === 'blue' ? 'text-blue-600' :
                    'text-yellow-600'
                  }`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Monitor Portal Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 mb-8">
          <div className="p-6 border-b border-gray-200/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                  <Monitor className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-2xl font-bold text-gray-800">Live Child Monitor</h2>
                    <div className="px-3 py-1 bg-gradient-to-r from-green-400 to-green-500 rounded-full">
                      <span className="text-white text-xs font-semibold">LIVE</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mt-1">Real-time insights into {childName}'s school activities</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-green-50 rounded-full px-4 py-2">
                  <div className="relative">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                  </div>
                  <span className="text-sm text-green-700 font-semibold">Online</span>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {liveMetrics.map((metric, index) => (
                <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-4 border border-gray-200/50 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{metric.label}</p>
                      <p className="text-xl font-bold text-gray-800">{metric.value}</p>
                    </div>
                    <div className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${getStatusColor(metric.status)}`}>
                      {metric.status.toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Enhanced Live Activity Stream */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500 rounded-xl">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Today's Activity Stream</h3>
                  </div>
                  <div className="text-xs text-blue-600 font-medium bg-blue-100 px-2 py-1 rounded-full">
                    LIVE
                  </div>
                </div>
                <div className="space-y-3 max-h-56 overflow-y-auto custom-scrollbar">
                  {recentObservations.map((observation) => (
                    <div key={observation.id} className="flex items-start space-x-3 p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/30 hover:bg-white/90 transition-all duration-200">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                          <Clock className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-semibold text-gray-800">{observation.activity}</p>
                            <span className="text-xl">{observation.mood}</span>
                          </div>
                          <span className="text-xs text-blue-600 font-medium bg-blue-100 px-2 py-1 rounded-full">
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
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-medium text-gray-800">Current Status</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500">
                    Updated {lastUpdateTime.toLocaleTimeString()}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                {/* Location Status */}
                <div className="bg-white rounded-lg p-3 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-600">Location</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-800 font-medium">{monitorData.currentLocation}</span>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Health Status */}
                <div className="bg-white rounded-lg p-3 border-l-4 border-green-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium text-gray-600">Health Status</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${getHealthStatusIndicator(monitorData.healthStatus).text}`}>
                        {getHealthStatusIndicator(monitorData.healthStatus).label}
                      </span>
                      <div className={`w-3 h-3 rounded-full ${getHealthStatusIndicator(monitorData.healthStatus).color}`}></div>
                    </div>
                  </div>
                </div>

                {/* Activity Level */}
                <div className="bg-white rounded-lg p-3 border-l-4 border-purple-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-gray-600">Activity Level</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-800 font-medium">{monitorData.activityLevel}</span>
                      <div className={`w-3 h-3 rounded-full ${
                        monitorData.activityLevel === 'Active' ? 'bg-green-500 animate-pulse' :
                        monitorData.activityLevel === 'Moderate' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`}></div>
                    </div>
                  </div>
                </div>

                {/* Connection & Safety Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3 border-l-4 border-cyan-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Wifi className="w-3 h-3 text-cyan-600" />
                        <span className="text-xs font-medium text-gray-600">Connection</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {[...Array(4)].map((_, i) => (
                          <div 
                            key={i}
                            className={`w-1 h-3 rounded-sm ${
                              i < getConnectionIndicator(monitorData.connectionStrength).bars 
                                ? getConnectionIndicator(monitorData.connectionStrength).color 
                                : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3 border-l-4 border-emerald-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Shield className="w-3 h-3 text-emerald-600" />
                        <span className="text-xs font-medium text-gray-600">Safety</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-emerald-600 font-medium">{monitorData.safetyStatus}</span>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Battery & Mood Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3 border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Battery className="w-3 h-3 text-yellow-600" />
                        <span className="text-xs font-medium text-gray-600">Device</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className={`text-xs font-medium ${getBatteryColor(monitorData.batteryLevel)}`}>
                          {monitorData.batteryLevel}%
                        </span>
                        <div className={`w-4 h-2 border border-gray-300 rounded-sm relative`}>
                          <div 
                            className={`h-full rounded-sm transition-all duration-500 ${
                              monitorData.batteryLevel > 50 ? 'bg-green-500' :
                              monitorData.batteryLevel > 20 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.max(monitorData.batteryLevel, 5)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3 border-l-4 border-orange-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Smile className="w-3 h-3 text-orange-600" />
                        <span className="text-xs font-medium text-gray-600">Mood</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-lg">😊</span>
                        <span className="text-xs text-gray-800 font-medium">{monitorData.moodRating}/5</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2 pt-2">
                  <button className="flex-1 flex items-center justify-center space-x-2 p-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">View Observations</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center space-x-2 p-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105">
                    <BarChart3 className="w-4 h-4" />
                    <span className="text-sm">Analytics</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Enhanced Important Notifications */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
            <div className="p-6 border-b border-gray-200/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl">
                    <Bell className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Important Updates</h2>
                </div>
                <div className="text-xs text-orange-600 font-medium bg-orange-100 px-3 py-1 rounded-full">
                  {notifications.length} Updates
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`flex items-start space-x-4 p-4 rounded-xl border-l-4 transition-all duration-200 hover:shadow-md ${
                      notification.priority === 'high' 
                        ? 'bg-red-50 border-red-400' 
                        : notification.priority === 'medium'
                        ? 'bg-yellow-50 border-yellow-400'
                        : 'bg-gray-50 border-gray-400'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${
                      notification.priority === 'high'
                        ? 'bg-red-100'
                        : notification.priority === 'medium'
                        ? 'bg-yellow-100'
                        : 'bg-gray-100'
                    }`}>
                      <AlertCircle className={`w-5 h-5 ${
                        notification.priority === 'high'
                          ? 'text-red-600'
                          : notification.priority === 'medium'
                          ? 'text-yellow-600'
                          : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 leading-relaxed">{notification.message}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500">{notification.time}</p>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          notification.priority === 'high'
                            ? 'bg-red-100 text-red-700'
                            : notification.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
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

          {/* Enhanced Quick Links */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
            <div className="p-6 border-b border-gray-200/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Quick Actions</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <button className="w-full group flex items-center justify-between p-4 text-left rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200/50 transition-all duration-200 hover:shadow-md">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500 rounded-lg group-hover:scale-110 transition-transform">
                      <Video className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-gray-700">Schedule PTM</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </button>
                
                <button className="w-full group flex items-center justify-between p-4 text-left rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border border-green-200/50 transition-all duration-200 hover:shadow-md">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-500 rounded-lg group-hover:scale-110 transition-transform">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-gray-700">Pay Fees</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors" />
                </button>
                
                <button className="w-full group flex items-center justify-between p-4 text-left rounded-xl bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 border border-red-200/50 transition-all duration-200 hover:shadow-md">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-500 rounded-lg group-hover:scale-110 transition-transform">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-gray-700">Health Report</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                </button>
                
                <button className="w-full group flex items-center justify-between p-4 text-left rounded-xl bg-gradient-to-r from-purple-50 to-violet-50 hover:from-purple-100 hover:to-violet-100 border border-purple-200/50 transition-all duration-200 hover:shadow-md">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-500 rounded-lg group-hover:scale-110 transition-transform">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-gray-700">Observations</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
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