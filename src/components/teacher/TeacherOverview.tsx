import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, CheckCircle, Calendar, TrendingUp, Users } from 'lucide-react';
import { apiService, FacultyAnalytics, FacultyRecentActivity, FacultyLecture } from '../../services/api';
import { showToast, handleApiError } from '../../utils/toast';

const TeacherOverview: React.FC = () => {
  const [analytics, setAnalytics] = useState<FacultyAnalytics | null>(null);
  const [recentActivity, setRecentActivity] = useState<FacultyRecentActivity[]>([]);
  const [upcomingLectures, setUpcomingLectures] = useState<FacultyLecture[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, [refreshKey]);

  // Listen for lecture completion events from other components
  useEffect(() => {
    const handleLectureCompleted = () => {
      // Trigger a refresh of dashboard data
      setRefreshKey(prev => prev + 1);
    };

    // You can use custom events or a more sophisticated state management solution
    window.addEventListener('lectureCompleted', handleLectureCompleted);
    
    return () => {
      window.removeEventListener('lectureCompleted', handleLectureCompleted);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [analyticsResponse, activityResponse, lecturesResponse] = await Promise.all([
        apiService.getFacultyAnalytics(),
        apiService.getFacultyRecentActivity(),
        apiService.getFacultyLectures()
      ]);

      if (analyticsResponse.success) {
        setAnalytics(analyticsResponse.data);
      } else {
        throw new Error('Failed to fetch analytics');
      }

      if (activityResponse.success) {
        setRecentActivity(activityResponse.data.slice(0, 5)); // Show only 5 recent activities
      } else {
        throw new Error('Failed to fetch recent activity');
      }

      if (lecturesResponse.success) {
        setUpcomingLectures(lecturesResponse.data.slice(0, 5)); // Show only 5 upcoming lectures
      } else {
        throw new Error('Failed to fetch upcoming lectures');
      }

    } catch (error) {
      handleApiError(error, 'Failed to fetch dashboard data');
      
      // If it's an auth error, don't set error state as user needs to login
      if (error?.isAuthError || error?.status === 401 || error?.status === 403) {
        return;
      }
      
      setError('Failed to load dashboard data');
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
        <button
          onClick={fetchDashboardData}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const stats = [
    {
      title: 'Assigned Batches',
      value: analytics?.assignedBatches?.toString() || '0',
      change: 'Active batches',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Total Lectures',
      value: analytics?.totalLectures?.toString() || '0',
      change: `${analytics?.completedLectures || 0} completed`,
      icon: Clock,
      color: 'green'
    },
    {
      title: 'Completed Lectures',
      value: analytics?.completedLectures?.toString() || '0',
      change: `${analytics ? analytics.totalLectures - analytics.completedLectures : 0} remaining`,
      icon: CheckCircle,
      color: 'purple'
    },
    {
      title: 'Completion Rate',
      value: `${Math.round(analytics?.completionRate || 0)}%`,
      value: `${Number((analytics?.completionRate || 0).toFixed(2))}%`,
      change: 'Overall progress',
      icon: TrendingUp,
      color: 'red'
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Teacher Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">Track your courses, lectures, and teaching progress</p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
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
            {recentActivity.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={`${activity.lectureId}-${index}`} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="p-2 rounded-full bg-green-100 text-green-600 flex-shrink-0">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 mb-1">
                        Completed "{activity.lectureTitle}" in {activity.subjectTitle}
                      </p>
                      <p className="text-xs text-gray-600 mb-1">
                        Batch: {activity.batchName} • Topic: {activity.topicTitle}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(activity.completedAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Lectures */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Pending Lectures</h2>
          </div>
          <div className="p-4 sm:p-6">
            {upcomingLectures.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {upcomingLectures.map((lecture, index) => (
                  <div key={`${lecture.lectureId}-${index}`} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{lecture.lectureTitle}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{lecture.subjectName}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {lecture.batchName} • {lecture.topicName}
                      </p>
                    </div>
                    <div className="text-right ml-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No pending lectures</p>
              </div>
            )}
            {upcomingLectures.length > 0 && (
              <button 
                onClick={() => window.location.href = '/lectures'}
                className="w-full mt-4 text-sm text-red-600 hover:text-red-800 font-medium"
              >
                View All Lectures
              </button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default TeacherOverview;