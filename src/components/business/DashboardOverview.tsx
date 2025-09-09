import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Calendar, TrendingUp, Clock, CheckCircle, RefreshCw, User, Target } from 'lucide-react';
import { apiService, BusinessAnalytics, BusinessActivity, BusinessOverviewItem } from '../../services/api';
import { showToast, handleApiError } from '../../utils/toast';

const DashboardOverview: React.FC = () => {
  const [analytics, setAnalytics] = useState<BusinessAnalytics | null>(null);
  const [recentActivity, setRecentActivity] = useState<BusinessActivity[]>([]);
  const [overview, setOverview] = useState<BusinessOverviewItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [analyticsResponse, activityResponse, overviewResponse] = await Promise.all([
        apiService.getBusinessAnalytics(),
        apiService.getBusinessActivity(),
        apiService.getBusinessOverview()
      ]);

      if (analyticsResponse.success) {
        setAnalytics(analyticsResponse.data);
      } else {
        throw new Error('Failed to fetch analytics');
      }

      if (activityResponse.success) {
        setRecentActivity(activityResponse.data.slice(0, 8)); // Show only 8 recent activities
      } else {
        throw new Error('Failed to fetch recent activity');
      }

      if (overviewResponse.success) {
        setOverview(overviewResponse.data);
      } else {
        throw new Error('Failed to fetch overview');
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

  const calculateOverallStats = () => {
    if (!analytics || !overview.length) return { totalLectures: 0, completedLectures: 0, overallCompletion: 0 };

    const totalLectures = overview.reduce((acc, item) => acc + item.totalLectures, 0);
    const completedLectures = overview.reduce((acc, item) => acc + item.completedLectures, 0);
    const overallCompletion = totalLectures > 0 ? Number(((completedLectures / totalLectures) * 100).toFixed(2)) : 0;

    return { totalLectures, completedLectures, overallCompletion };
  };

  const overallStats = calculateOverallStats();

  const stats = [
    {
      title: 'Total Teachers',
      value: analytics?.totalTeachers?.toString() || '0',
      change: 'Active faculty members',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Active Courses',
      value: analytics?.activeCourses?.toString() || '0',
      change: 'Running courses',
      icon: BookOpen,
      color: 'green'
    },
    {
      title: 'Active Batches',
      value: analytics?.activeBatches?.toString() || '0',
      change: 'Current batches',
      icon: Calendar,
      color: 'yellow'
    },
    {
      title: 'Overall Progress',
      value: `${overallStats.overallCompletion}%`,
      change: `${overallStats.completedLectures}/${overallStats.totalLectures} lectures`,
      icon: TrendingUp,
      color: 'red'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      yellow: 'bg-yellow-50 text-yellow-600',
      red: 'bg-red-50 text-red-600'
    };
    return colors[color as keyof typeof colors] || colors.blue;
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

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
          <p className="text-sm sm:text-base text-gray-600">Monitor your institution's performance at a glance</p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
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
            <h2 className="text-lg font-semibold text-gray-900">Recent Lecture Activity</h2>
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
                        <span className="font-medium">{activity.lectureTitle}</span> completed in {activity.subjectTitle}
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

        {/* Batch Completion Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Batch Completion Status</h2>
          </div>
          <div className="p-4 sm:p-6">
            {analytics?.batchCompletion && analytics.batchCompletion.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {analytics.batchCompletion.slice(0, 6).map((batch) => (
                  <div key={batch.batchId} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{batch.batchName}</h3>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {batch.completedLectures}/{batch.totalLectures} lectures completed
                      </p>
                    </div>
                    <div className="text-right ml-3 flex-shrink-0">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 sm:w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              batch.completionRate === 100 ? 'bg-green-600' :
                              batch.completionRate >= 75 ? 'bg-blue-600' :
                              batch.completionRate >= 50 ? 'bg-yellow-600' : 'bg-red-600'
                            }`}
                            style={{ width: `${batch.completionRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-10 text-right">
                          {batch.completionRate}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {analytics.batchCompletion.length > 6 && (
                  <button 
                    onClick={() => window.location.href = '/batches'}
                    className="w-full mt-4 text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    View All Batches ({analytics.batchCompletion.length})
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No batch data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assignment Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Assignment Overview</h2>
        </div>
        <div className="p-4 sm:p-6">
          {overview.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faculty</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Batch</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Last Lecture</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {overview.slice(0, 10).map((item, index) => (
                    <tr key={`${item.batchId}-${item.subjectId}-${index}`} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {item.faculty.firstName} {item.faculty.lastName}
                            </div>
                            <div className="text-xs text-gray-500 truncate sm:hidden">
                              {item.batchName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 truncate max-w-32 sm:max-w-none">{item.subjectTitle}</div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                        <div className="text-sm text-gray-900 truncate">{item.batchName}</div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="w-12 sm:w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                item.completionRate === 100 ? 'bg-green-600' :
                                item.completionRate >= 75 ? 'bg-blue-600' :
                                item.completionRate >= 50 ? 'bg-yellow-600' : 'bg-red-600'
                              }`}
                              style={{ width: `${item.completionRate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900 w-8 text-right">{item.completionRate}%</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {item.completedLectures}/{item.totalLectures}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                        {item.lastLecture ? new Date(item.lastLecture).toLocaleDateString() : 'No lectures yet'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {overview.length > 10 && (
                <div className="mt-4 text-center">
                  <button 
                    onClick={() => window.location.href = '/lectures'}
                    className="text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    View All Assignments ({overview.length})
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments yet</h3>
              <p className="text-gray-600">Create batches and assign faculty to see assignment data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;