import React, { useState, useEffect } from 'react';
import { Search, Calendar, Clock, User, BookOpen, TrendingUp, Filter, RefreshCw, Target, CheckCircle, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService, BusinessOverviewItem, BusinessActivity, BusinessOverviewFilters } from '../../services/api';
import { showToast, handleApiError } from '../../utils/toast';

const LectureTracking: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'assignments' | 'activity'>('assignments');
  const [searchTerm, setSearchTerm] = useState('');
  const [facultyFilter, setFacultyFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [overview, setOverview] = useState<BusinessOverviewItem[]>([]);
  const [recentActivity, setRecentActivity] = useState<BusinessActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get filtered data based on current filters
  const getFilteredData = () => {
    let filtered = overview;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        (item.faculty.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
         item.faculty.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
         item.subjectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
         item.batchName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply faculty filter
    if (facultyFilter) {
      filtered = filtered.filter(item => 
        `${item.faculty.firstName} ${item.faculty.lastName}` === facultyFilter
      );
    }
    
    // Apply batch filter
    if (batchFilter) {
      filtered = filtered.filter(item => item.batchName === batchFilter);
    }
    
    return filtered;
  };

  const filteredOverview = getFilteredData();

  // Get available faculty options based on current batch filter
  const getAvailableFaculty = () => {
    let dataToFilter = overview;
    
    // If batch is selected, only show faculty from that batch
    if (batchFilter) {
      dataToFilter = overview.filter(item => item.batchName === batchFilter);
    }
    
    // Apply search filter if exists
    if (searchTerm) {
      dataToFilter = dataToFilter.filter(item =>
        (item.faculty.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
         item.faculty.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
         item.subjectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
         item.batchName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return Array.from(
      new Set(dataToFilter.map(item => `${item.faculty.firstName} ${item.faculty.lastName}`))
    ).sort();
  };

  // Get available batch options based on current faculty filter
  const getAvailableBatches = () => {
    let dataToFilter = overview;
    
    // If faculty is selected, only show batches for that faculty
    if (facultyFilter) {
      dataToFilter = overview.filter(item => 
        `${item.faculty.firstName} ${item.faculty.lastName}` === facultyFilter
      );
    }
    
    // Apply search filter if exists
    if (searchTerm) {
      dataToFilter = dataToFilter.filter(item =>
        (item.faculty.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
         item.faculty.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
         item.subjectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
         item.batchName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return Array.from(
      new Set(dataToFilter.map(item => item.batchName))
    ).sort();
  };

  const availableFaculty = getAvailableFaculty();
  const availableBatches = getAvailableBatches();

  // Handle faculty filter change
  const handleFacultyFilterChange = (selectedFaculty: string) => {
    setFacultyFilter(selectedFaculty);
    
    // If a faculty is selected, check if current batch filter is still valid
    if (selectedFaculty && batchFilter) {
      const facultyBatches = overview
        .filter(item => `${item.faculty.firstName} ${item.faculty.lastName}` === selectedFaculty)
        .map(item => item.batchName);
      
      // If current batch is not available for selected faculty, clear batch filter
      if (!facultyBatches.includes(batchFilter)) {
        setBatchFilter('');
      }
    }
  };

  // Handle batch filter change
  const handleBatchFilterChange = (selectedBatch: string) => {
    setBatchFilter(selectedBatch);
    
    // If a batch is selected, check if current faculty filter is still valid
    if (selectedBatch && facultyFilter) {
      const batchFaculty = overview
        .filter(item => item.batchName === selectedBatch)
        .map(item => `${item.faculty.firstName} ${item.faculty.lastName}`);
      
      // If current faculty is not available for selected batch, clear faculty filter
      if (!batchFaculty.includes(facultyFilter)) {
        setFacultyFilter('');
      }
    }
  };
  useEffect(() => {
    fetchLectureData();
  }, []);

  const fetchLectureData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [overviewResponse, activityResponse] = await Promise.all([
        apiService.getBusinessOverview(),
        apiService.getBusinessActivity()
      ]);

      if (overviewResponse.success) {
        setOverview(overviewResponse.data);
      } else {
        throw new Error('Failed to fetch overview data');
      }

      if (activityResponse.success) {
        setRecentActivity(activityResponse.data);
      } else {
        throw new Error('Failed to fetch activity data');
      }

    } catch (error) {
      handleApiError(error, 'Failed to fetch lecture tracking data');
      
      // If it's an auth error, don't set error state as user needs to login
      if (error?.isAuthError || error?.status === 401 || error?.status === 403) {
        return;
      }
      
      setError('Failed to load lecture tracking data');
      console.error('Error fetching lecture tracking data:', error);
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


  const filteredActivity = recentActivity.filter(activity =>
    activity.batchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.subjectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.lectureTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.topicTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const clearFilters = () => {
    setFacultyFilter('');
    setBatchFilter('');
  };
  const calculateSummaryStats = () => {
    const totalLectures = overview.reduce((acc, item) => acc + item.totalLectures, 0);
    const completedLectures = overview.reduce((acc, item) => acc + item.completedLectures, 0);
    const activeTeachers = new Set(overview.map(item => item.facultyId)).size;
    const averageCompletion = overview.length > 0 
      ? Number((overview.reduce((acc, item) => acc + item.completionRate, 0) / overview.length).toFixed(2))
      : 0;

    return { totalLectures, completedLectures, activeTeachers, averageCompletion };
  };

  const summaryStats = calculateSummaryStats();

  const handleViewFacultyDetails = (assignment: BusinessOverviewItem) => {
    navigate(`/faculty-details/${assignment.batchId}/${assignment.subjectId}`, {
      state: {
        facultyInfo: assignment.faculty,
        batchName: assignment.batchName,
        subjectTitle: assignment.subjectTitle,
        facultyId: assignment.facultyId
      }
    });
  };

  const renderAssignmentsTab = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{summaryStats.activeTeachers}</h3>
              <p className="text-sm text-gray-600">Active Teachers</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{summaryStats.totalLectures}</h3>
              <p className="text-sm text-gray-600">Total Lectures</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 sm:p-3 bg-red-100 rounded-lg">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{summaryStats.completedLectures}</h3>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{summaryStats.averageCompletion}%</h3>
              <p className="text-sm text-gray-600">Average Progress</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lecture Assignments Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Lecture Assignments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Batch</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Remaining</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Last Lecture</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOverview.map((assignment, index) => (
                <tr key={`${assignment.batchId}-${assignment.subjectId}-${index}`} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {assignment.faculty.firstName} {assignment.faculty.lastName}
                        </div>
                        <div className="text-xs text-gray-500 truncate sm:hidden">
                          {assignment.batchName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 truncate max-w-32 sm:max-w-none">{assignment.subjectTitle}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                    <div className="text-sm text-gray-900 truncate">{assignment.batchName}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="w-12 sm:w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            assignment.completionRate === 100 ? 'bg-green-600' :
                            assignment.completionRate >= 75 ? 'bg-blue-600' :
                            assignment.completionRate >= 50 ? 'bg-yellow-600' : 'bg-red-600'
                          }`}
                          style={{ width: `${assignment.completionRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900 w-8 text-right">{assignment.completionRate}%</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {assignment.completedLectures}/{assignment.totalLectures}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      assignment.remainingLectures === 0 ? 'bg-green-100 text-green-800' :
                      assignment.remainingLectures <= 5 ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {assignment.remainingLectures} left
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                    {assignment.lastLecture ? new Date(assignment.lastLecture).toLocaleDateString() : 'No lectures yet'}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleViewFacultyDetails(assignment)}
                      className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">View Details</span>
                      <span className="sm:hidden">Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderActivityTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Lecture Activity</h2>
        </div>
        <div className="p-4 sm:p-6">
          {filteredActivity.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredActivity.map((activity, index) => (
                <div key={`${activity.lectureId}-${index}`} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{activity.lectureTitle}</h3>
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 flex-shrink-0">
                      Completed
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Subject:</span>
                      <span className="text-gray-900 truncate ml-2">{activity.subjectTitle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Batch:</span>
                      <span className="text-gray-900 truncate ml-2">{activity.batchName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Topic:</span>
                      <span className="text-gray-900 truncate ml-2">{activity.topicTitle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completed:</span>
                      <span className="text-gray-900">{formatDate(activity.completedAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h3>
              <p className="text-gray-600">No lectures have been completed recently</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading && overview.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <p className="mt-2 text-gray-600">Loading lecture tracking data...</p>
        </div>
      </div>
    );
  }

  if (error && overview.length === 0) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
        <button
          onClick={fetchLectureData}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Lecture Tracking</h1>
          <p className="text-sm sm:text-base text-gray-600">Monitor lecture assignments and activity</p>
        </div>
        <button
          onClick={fetchLectureData}
          disabled={loading}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6">
            {[
              { id: 'assignments', label: 'Assignments', icon: BookOpen },
              { id: 'activity', label: 'Recent Activity', icon: Calendar }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.id === 'assignments' ? 'Assign' : 'Activity'}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Search Bar */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="space-y-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={activeTab === 'assignments' ? "Search by teacher, subject, or batch..." : "Search by batch, subject, or lecture..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            
            {/* Filters - Only show for assignments tab */}
            {activeTab === 'assignments' && (
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filter by Faculty
                  </label>
                  <select
                    value={facultyFilter}
                    onChange={(e) => handleFacultyFilterChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">All Faculty</option>
                    {availableFaculty.map((faculty) => (
                      <option key={faculty} value={faculty}>
                        {faculty}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filter by Batch
                  </label>
                  <select
                    value={batchFilter}
                    onChange={(e) => handleBatchFilterChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">All Batches</option>
                    {availableBatches.map((batch) => (
                      <option key={batch} value={batch}>
                        {batch}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Clear Filters Button */}
                {(facultyFilter || batchFilter) && (
                  <div className="flex items-end">
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Results Info */}
            <div className="text-sm text-gray-600">
              {activeTab === 'assignments' ? (
                <>
                  Showing {filteredOverview.length} of {overview.length} assignments
                  {(facultyFilter || batchFilter || searchTerm) && (
                    <span className="ml-2 text-gray-500">
                      (filtered)
                    </span>
                  )}
                </>
              ) : (
                <>
                  Showing {filteredActivity.length} activities
                  {searchTerm && (
                    <span className="ml-2 text-gray-500">
                      (filtered)
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'assignments' && renderAssignmentsTab()}
      {activeTab === 'activity' && renderActivityTab()}
    </div>
  );
};

export default LectureTracking;