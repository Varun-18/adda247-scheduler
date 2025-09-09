import React, { useState, useEffect } from 'react';
import { TrendingUp, BookOpen, Clock, Target, Calendar, Award, RefreshCw } from 'lucide-react';
import { apiService, FacultyProgressBatch, FacultyAnalytics } from '../../services/api';
import { showToast, handleApiError } from '../../utils/toast';

const Progress: React.FC = () => {
  const [progressData, setProgressData] = useState<FacultyProgressBatch[]>([]);
  const [analytics, setAnalytics] = useState<FacultyAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchProgressData();
  }, [refreshKey]);

  // Listen for lecture completion events
  useEffect(() => {
    const handleLectureCompleted = () => {
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener('lectureCompleted', handleLectureCompleted);
    
    return () => {
      window.removeEventListener('lectureCompleted', handleLectureCompleted);
    };
  }, []);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [progressResponse, analyticsResponse] = await Promise.all([
        apiService.getFacultyProgress(),
        apiService.getFacultyAnalytics()
      ]);

      if (progressResponse.success) {
        setProgressData(progressResponse.data);
      } else {
        throw new Error('Failed to fetch progress data');
      }

      if (analyticsResponse.success) {
        setAnalytics(analyticsResponse.data);
      } else {
        throw new Error('Failed to fetch analytics');
      }

    } catch (error) {
      handleApiError(error, 'Failed to fetch progress data');
      
      // If it's an auth error, don't set error state as user needs to login
      if (error?.isAuthError || error?.status === 401 || error?.status === 403) {
        return;
      }
      
      setError('Failed to load progress data');
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallStats = () => {
    const totalSubjects = progressData.reduce((acc, batch) => acc + batch.subjects.length, 0);
    const completedSubjects = progressData.reduce(
      (acc, batch) => acc + batch.subjects.filter(subject => subject.completionRate === 100).length,
      0
    );
    const averageCompletion = progressData.length > 0 
      ? Math.round(
          progressData.reduce(
            (acc, batch) => acc + batch.subjects.reduce((subAcc, subject) => subAcc + subject.completionRate, 0) / batch.subjects.length,
            0
          ) / progressData.length
        )
      : 0;

    return {
      totalBatches: progressData.length,
      totalSubjects,
      completedSubjects,
      averageCompletion
    };
  };

  const overallStats = calculateOverallStats();

  const achievements = [
    {
      title: 'High Completion Rate',
      description: `Achieved ${Math.round(analytics?.completionRate || 0)}% overall completion rate`,
      date: new Date().toISOString(),
      icon: Award,
      color: 'text-yellow-600 bg-yellow-100'
    },
    {
      title: 'Active Teaching',
      description: `Managing ${analytics?.assignedBatches || 0} active batches`,
      date: new Date().toISOString(),
      icon: Target,
      color: 'text-green-600 bg-green-100'
    },
    {
      title: 'Lectures Completed',
      description: `${analytics?.completedLectures || 0} lectures successfully delivered`,
      date: new Date().toISOString(),
      icon: TrendingUp,
      color: 'text-blue-600 bg-blue-100'
    }
  ];

  if (loading && progressData.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <p className="mt-2 text-gray-600">Loading progress data...</p>
        </div>
      </div>
    );
  }

  if (error && progressData.length === 0) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
        <button
          onClick={fetchProgressData}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Progress</h1>
          <p className="text-gray-600">Track your teaching performance and achievements</p>
        </div>
        <button
          onClick={fetchProgressData}
          disabled={loading}
          className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{overallStats.totalBatches}</h3>
              <p className="text-sm text-gray-600">Active Batches</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{overallStats.totalSubjects}</h3>
              <p className="text-sm text-gray-600">Total Subjects</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{analytics?.completedLectures || 0}</h3>
              <p className="text-sm text-gray-600">Lectures Given</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{Math.round(analytics?.completionRate || 0)}%</h3>
              <p className="text-sm text-gray-600">Completion Rate</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Batch Progress Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Batch Progress Details</h2>
        </div>
        <div className="p-6">
          {progressData.length > 0 ? (
            <div className="space-y-6">
              {progressData.map((batch, index) => {
                const batchCompletion = Number((
                  batch.subjects.reduce((acc, subject) => acc + subject.completionRate, 0) / batch.subjects.length
                ).toFixed(2));
                const totalLectures = batch.subjects.reduce((acc, subject) => acc + subject.totalLectures, 0);
                const completedLectures = batch.subjects.reduce((acc, subject) => acc + subject.completedLectures, 0);

                return (
                  <div key={batch.batchId} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{batch.batchName}</h3>
                        <p className="text-sm text-gray-600">{batch.subjects.length} subjects assigned</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-red-600">{batchCompletion}%</p>
                        <p className="text-sm text-gray-600">Complete</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-xl font-bold text-blue-600">{batch.subjects.length}</p>
                        <p className="text-sm text-gray-600">Subjects</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-xl font-bold text-green-600">{completedLectures}/{totalLectures}</p>
                        <p className="text-sm text-gray-600">Lectures</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Overall Progress</span>
                        <span className="font-medium text-gray-900">{batchCompletion}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-red-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${batchCompletion}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Subject Details */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-700">Subject Progress</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {batch.subjects.map((subject) => (
                          <div key={subject.subjectId} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-gray-900 text-sm">{subject.subjectTitle}</h5>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                subject.completionRate === 100 
                                  ? 'bg-green-100 text-green-800' 
                                  : subject.completionRate >= 50 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {subject.completionRate}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-600">
                              <span>Lectures: {subject.completedLectures}/{subject.totalLectures}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                              <div 
                                className="bg-red-600 h-1 rounded-full transition-all duration-300"
                                style={{ width: `${subject.completionRate}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No progress data available</h3>
              <p className="text-gray-600">You don't have any assigned batches yet.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Progress;