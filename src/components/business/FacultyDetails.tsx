import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  User,
  BookOpen,
  Clock,
  CheckCircle,
  Calendar,
  TrendingUp,
  RefreshCw,
  Filter,
  X,
} from "lucide-react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { apiService, FacultyCompletedLecture } from "../../services/api";
import { showToast, handleApiError } from "../../utils/toast";

const FacultyDetails: React.FC = () => {
  const { batchId, subjectId } = useParams<{
    batchId: string;
    subjectId: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [completedLectures, setCompletedLectures] = useState<
    FacultyCompletedLecture[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Date range filter state
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filteredLectures, setFilteredLectures] = useState<
    FacultyCompletedLecture[]
  >([]);

  // Get faculty info from location state if available
  const facultyInfo = location.state?.facultyInfo || null;
  const batchName = location.state?.batchName || "Unknown Batch";
  const subjectTitle = location.state?.subjectTitle || "Unknown Subject";

  useEffect(() => {
    if (batchId && subjectId) {
      fetchFacultyCompletedLectures();
    } else {
      navigate("/lectures");
    }
  }, [batchId, subjectId]);

  // Filter lectures based on date range
  useEffect(() => {
    if (!startDate && !endDate) {
      setFilteredLectures(completedLectures);
      return;
    }

    const filtered = completedLectures.filter((lecture) => {
      const lectureDate = new Date(lecture.completedAt);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      // Set end date to end of day for inclusive filtering
      if (end) {
        end.setHours(23, 59, 59, 999);
      }

      if (start && end) {
        return lectureDate >= start && lectureDate <= end;
      } else if (start) {
        return lectureDate >= start;
      } else if (end) {
        return lectureDate <= end;
      }

      return true;
    });

    setFilteredLectures(filtered);
  }, [completedLectures, startDate, endDate]);
  const fetchFacultyCompletedLectures = async () => {
    if (!batchId || !subjectId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getFacultyCompletedLectures({
        batchId,
        subjectId,
        facultyId: facultyInfo?._id || "",
      });

      if (response.success) {
        setCompletedLectures(response.data);
      } else {
        throw new Error("Failed to fetch faculty completed lectures");
      }
    } catch (error) {
      handleApiError(error, "Failed to fetch faculty lecture details");

      if (
        error?.isAuthError ||
        error?.status === 401 ||
        error?.status === 403
      ) {
        return;
      }

      setError("Failed to load faculty lecture details");
      console.error("Error fetching faculty completed lectures:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
    setShowDateFilter(false);
  };

  const applyDateFilter = () => {
    setShowDateFilter(false);
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const calculateStats = (lectures: FacultyCompletedLecture[]) => {
    const totalLectures = lectures.length;
    const uniqueTopics = new Set(
      lectures.map((lecture) => lecture.topicId)
    ).size;

    // Calculate lectures per day
    const lecturesByDate = lectures.reduce((acc, lecture) => {
      const date = new Date(lecture.completedAt).toDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const averageLecturesPerDay =
      Object.keys(lecturesByDate).length > 0
        ? Math.round(
            (totalLectures / Object.keys(lecturesByDate).length) * 10
          ) / 10
        : 0;

    // Get most recent lecture
    const mostRecentLecture =
      lectures.length > 0
        ? lectures.reduce((latest, current) =>
            new Date(current.completedAt) > new Date(latest.completedAt)
              ? current
              : latest
          )
        : null;

    return {
      totalLectures,
      uniqueTopics,
      averageLecturesPerDay,
      mostRecentLecture,
      activeDays: Object.keys(lecturesByDate).length,
    };
  };

  const stats = calculateStats(filteredLectures);
  const allTimeStats = calculateStats(completedLectures);

  // Group lectures by topic for better organization
  const lecturesByTopic = filteredLectures.reduce((acc, lecture) => {
    if (!acc[lecture.topicTitle]) {
      acc[lecture.topicTitle] = [];
    }
    acc[lecture.topicTitle].push(lecture);
    return acc;
  }, {} as Record<string, FacultyCompletedLecture[]>);

  // Sort topics by most recent lecture
  const sortedTopics = Object.entries(lecturesByTopic).sort(
    ([, lecturesA], [, lecturesB]) => {
      const latestA = Math.max(
        ...lecturesA.map((l) => new Date(l.completedAt).getTime())
      );
      const latestB = Math.max(
        ...lecturesB.map((l) => new Date(l.completedAt).getTime())
      );
      return latestB - latestA;
    }
  );

  if (loading && filteredLectures.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <p className="mt-2 text-gray-600">Loading faculty details...</p>
        </div>
      </div>
    );
  }

  if (error && filteredLectures.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/lectures")}
            className="flex items-center space-x-2 text-red-600 hover:text-red-800 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Lecture Tracking</span>
          </button>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
        <button
          onClick={fetchFacultyCompletedLectures}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 m-4">
      {/* Header */}
      <div className="flex items-center justify-between ">
        <button
          onClick={() => navigate("/lectures")}
          className="flex items-center space-x-2 text-red-600 hover:text-red-800 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Lecture Tracking</span>
        </button>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowDateFilter(!showDateFilter)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Date Filter</span>
          </button>
          <button
            onClick={fetchFacultyCompletedLectures}
            disabled={loading}
            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Date Filter Panel */}
      {showDateFilter && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filter by Date Range</h3>
            <button
              onClick={() => setShowDateFilter(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={applyDateFilter}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply Filter
            </button>
            <button
              onClick={clearDateFilter}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Clear Filter
            </button>
          </div>
          
          {(startDate || endDate) && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Active Filter:</strong> 
                {startDate && endDate 
                  ? ` ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`
                  : startDate 
                  ? ` From ${new Date(startDate).toLocaleDateString()}`
                  : ` Until ${new Date(endDate).toLocaleDateString()}`
                }
                {` (${filteredLectures.length} lectures found)`}
              </p>
            </div>
          )}
        </div>
      )}
      {/* Faculty Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {facultyInfo
                  ? `${facultyInfo.firstName} ${facultyInfo.lastName}`
                  : "Faculty Details"}
              </h1>
              <p className="text-gray-600">
                {subjectTitle} • {batchName}
              </p>
              {facultyInfo?.email && (
                <p className="text-sm text-gray-500">{facultyInfo.email}</p>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="p-6">
          {(startDate || endDate) && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">Filtered Results</h3>
              <p className="text-sm text-yellow-700">
                Showing {filteredLectures.length} lectures out of {completedLectures.length} total lectures
                {startDate && endDate 
                  ? ` between ${new Date(startDate).toLocaleDateString()} and ${new Date(endDate).toLocaleDateString()}`
                  : startDate 
                  ? ` from ${new Date(startDate).toLocaleDateString()}`
                  : ` until ${new Date(endDate).toLocaleDateString()}`
                }
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-blue-600">
                {stats.totalLectures}
              </h3>
              <p className="text-sm text-gray-600">
                {(startDate || endDate) ? "Filtered" : "Total"} Lectures
              </p>
              {(startDate || endDate) && (
                <p className="text-xs text-gray-500 mt-1">
                  All time: {allTimeStats.totalLectures}
                </p>
              )}
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <BookOpen className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-green-600">
                {stats.uniqueTopics}
              </h3>
              <p className="text-sm text-gray-600">Topics Covered</p>
              {(startDate || endDate) && (
                <p className="text-xs text-gray-500 mt-1">
                  All time: {allTimeStats.uniqueTopics}
                </p>
              )}
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-purple-600">
                {stats.averageLecturesPerDay}
              </h3>
              <p className="text-sm text-gray-600">Avg/Day</p>
              {(startDate || endDate) && (
                <p className="text-xs text-gray-500 mt-1">
                  All time: {allTimeStats.averageLecturesPerDay}
                </p>
              )}
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Calendar className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-yellow-600">
                {stats.activeDays}
              </h3>
              <p className="text-sm text-gray-600">Active Days</p>
              {(startDate || endDate) && (
                <p className="text-xs text-gray-500 mt-1">
                  All time: {allTimeStats.activeDays}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {stats.mostRecentLecture && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {(startDate || endDate) ? "Most Recent Activity (Filtered)" : "Most Recent Activity"}
            </h2>
          </div>
          <div className="p-6">
            <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">
                  {stats.mostRecentLecture.lectureTitle}
                </h3>
                <p className="text-sm text-gray-600">
                  {stats.mostRecentLecture.topicTitle}
                </p>
                <p className="text-xs text-gray-500">
                  Completed on{" "}
                  {formatDate(stats.mostRecentLecture.completedAt).date} at{" "}
                  {formatDate(stats.mostRecentLecture.completedAt).time}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lectures by Topic */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {(startDate || endDate) ? "Filtered Lectures by Topic" : "Completed Lectures by Topic"}
          </h2>
          {(startDate || endDate) && (
            <p className="text-sm text-gray-600 mt-1">
              Showing {filteredLectures.length} of {completedLectures.length} total lectures
            </p>
          )}
        </div>
        <div className="p-6">
          {sortedTopics.length > 0 ? (
            <div className="space-y-6">
              {sortedTopics.map(([topicTitle, lectures]) => (
                <div
                  key={topicTitle}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">{topicTitle}</h3>
                    <span className="text-sm text-gray-500">
                      {lectures.length} lecture
                      {lectures.length !== 1 ? "s" : ""}
                      {(startDate || endDate) && " (filtered)"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {lectures
                      .sort(
                        (a, b) =>
                          new Date(b.completedAt).getTime() -
                          new Date(a.completedAt).getTime()
                      )
                      .map((lecture, index) => {
                        const { date, time } = formatDate(lecture.completedAt);
                        return (
                          <div
                            key={`${lecture.lectureId}-${index}`}
                            className="bg-gray-50 rounded-lg p-3"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-gray-900 text-sm">
                                {lecture.lectureTitle}
                              </h4>
                              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 ml-2" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1 text-xs text-gray-600">
                                <Calendar className="w-3 h-3" />
                                <span>{date}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-xs text-gray-600">
                                <Clock className="w-3 h-3" />
                                <span>{time}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {(startDate || endDate) 
                  ? "No lectures found in the selected date range" 
                  : "No completed lectures found"
                }
              </h3>
              <p className="text-gray-600">
                {(startDate || endDate) 
                  ? "Try adjusting the date range to see more lectures." 
                  : "This faculty hasn't completed any lectures for this subject yet."
                }
              </p>
              {(startDate || endDate) && completedLectures.length > 0 && (
                <button
                  onClick={clearDateFilter}
                  className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear filter to see all {completedLectures.length} lectures
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyDetails;
