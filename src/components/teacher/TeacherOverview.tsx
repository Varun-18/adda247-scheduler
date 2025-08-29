import React from 'react';
import { BookOpen, Clock, CheckCircle, Calendar, TrendingUp } from 'lucide-react';
import { showToast } from '../../utils/toast';

const TeacherOverview: React.FC = () => {
  const stats = [
    {
      title: 'Assigned Courses',
      value: '3',
      change: '+1 this month',
      icon: BookOpen,
      color: 'blue'
    },
    {
      title: 'Total Lectures',
      value: '120',
      change: '45 remaining',
      icon: Clock,
      color: 'green'
    },
    {
      title: 'Completed Topics',
      value: '28',
      change: '+5 this week',
      icon: CheckCircle,
      color: 'purple'
    },
    {
      title: 'Average Progress',
      value: '72%',
      change: '+8% improvement',
      icon: TrendingUp,
      color: 'red'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'lecture',
      message: 'Completed Mathematics lecture for Batch A',
      time: '2 hours ago',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      id: 2,
      type: 'topic',
      message: 'Marked "Linear Algebra" as completed',
      time: '1 day ago',
      icon: BookOpen,
      color: 'text-blue-600'
    },
    {
      id: 3,
      type: 'assignment',
      message: 'New Physics course assigned',
      time: '2 days ago',
      icon: Calendar,
      color: 'text-purple-600'
    }
  ];

  const upcomingLectures = [
    {
      id: 1,
      subject: 'Mathematics',
      batch: 'Math Batch A',
      time: '10:00 AM',
      date: 'Today',
      duration: '60 min'
    },
    {
      id: 2,
      subject: 'Physics',
      batch: 'Physics Batch B',
      time: '2:00 PM',
      date: 'Tomorrow',
      duration: '45 min'
    },
    {
      id: 3,
      subject: 'Mathematics',
      batch: 'Math Batch A',
      time: '11:00 AM',
      date: 'Dec 28',
      duration: '60 min'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      purple: 'bg-purple-50 text-purple-600',
      red: 'bg-red-50 text-red-600'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Teacher Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600">Track your courses, lectures, and student progress</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className={`p-2 sm:p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
              <p className="text-xs text-gray-500">{stat.change}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className={`p-2 rounded-full bg-gray-100 ${activity.color} flex-shrink-0`}>
                    <activity.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 mb-1">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Lectures */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Lectures</h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {upcomingLectures.map((lecture) => (
                <div key={lecture.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{lecture.subject}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{lecture.batch}</p>
                  </div>
                  <div className="text-right ml-3">
                    <p className="text-sm font-medium text-gray-900">{lecture.time}</p>
                    <p className="text-xs text-gray-500">{lecture.date} • {lecture.duration}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 text-sm text-red-600 hover:text-red-800 font-medium">
              View All Lectures
            </button>
          </div>
        </div>
      </div>

      {/* Course Progress Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Course Progress Overview</h2>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {[
              { course: 'Advanced Mathematics', progress: 75, topics: '15/20' },
              { course: 'Basic Physics', progress: 60, topics: '12/20' },
              { course: 'Applied Chemistry', progress: 90, topics: '18/20' }
            ].map((course, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">{course.course}</h3>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="text-gray-900">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Topics Completed:</span>
                    <span className="text-gray-900">{course.topics}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <button className="p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-left">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 mb-2" />
            <h3 className="font-medium text-gray-900 text-sm sm:text-base">Mark Lecture Taken</h3>
            <p className="text-xs sm:text-sm text-gray-600">Update today's lecture status</p>
          </button>
          <button className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left">
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mb-2" />
            <h3 className="font-medium text-gray-900 text-sm sm:text-base">Complete Topic</h3>
            <p className="text-xs sm:text-sm text-gray-600">Mark a topic as finished</p>
          </button>
          <button className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left sm:col-span-2 lg:col-span-1">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mb-2" />
            <h3 className="font-medium text-gray-900 text-sm sm:text-base">View Assignments</h3>
            <p className="text-xs sm:text-sm text-gray-600">Check lecture assignments</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherOverview;