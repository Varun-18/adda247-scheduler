import React, { useState } from "react";
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  BookOpen,
  Users,
  Target,
} from "lucide-react";
import { apiService, FacultyLecture } from "../../services/api";

const MyLectures: React.FC = () => {
  const [lectures, setLectures] = useState<FacultyLecture[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completingLecture, setCompletingLecture] = useState<string | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");

  React.useEffect(() => {
    fetchFacultyLectures();
  }, []);

  const fetchFacultyLectures = async () => {
    try {
      setLoading(true);
      const response = await apiService.getFacultyLectures();
      if (response.success) {
        setLectures(response.data);
      }
    } catch (error) {
      setError("Failed to fetch your lectures");
      console.error("Error fetching faculty lectures:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkLectureCompleted = async (lecture: FacultyLecture) => {
    try {
      setCompletingLecture(lecture.lectureId);
      const response = await apiService.markLectureCompleted({
        batchId: lecture.batchId,
        subjectId: lecture.subjectId,
        topicId: lecture.topicId,
        lectureId: lecture.lectureId,
      });

      if (response.success) {
        // Remove the completed lecture from the list
        setLectures((prev) =>
          prev.filter((l) => l.lectureId !== lecture.lectureId)
        );
      }
    } catch (error) {
      console.error("Error marking lecture as completed:", error);
      setError("Failed to mark lecture as completed");
    } finally {
      setCompletingLecture(null);
    }
  };

  const filteredLectures = lectures.filter(
    (lecture) =>
      lecture.lectureTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lecture.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lecture.batchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lecture.topicName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group lectures by batch for better organization
  const lecturesByBatch = filteredLectures.reduce((acc, lecture) => {
    if (!acc[lecture.batchName]) {
      acc[lecture.batchName] = [];
    }
    acc[lecture.batchName].push(lecture);
    return acc;
  }, {} as Record<string, FacultyLecture[]>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Lectures</h1>
        <p className="text-gray-600">View and manage your pending lectures</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <Target className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {lectures.length}
              </h3>
              <p className="text-sm text-gray-600">Pending Lectures</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {Object.keys(lecturesByBatch).length}
              </h3>
              <p className="text-sm text-gray-600">Active Batches</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {[...new Set(lectures.map((l) => l.subjectName))].length}
              </h3>
              <p className="text-sm text-gray-600">Subjects</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Search Lectures
          </h2>
        </div>
        <div className="p-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by lecture title, subject, batch, or topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <p className="mt-2 text-gray-600">Loading your lectures...</p>
        </div>
      )}

      {/* Lectures by Batch */}
      {Object.keys(lecturesByBatch).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(lecturesByBatch).map(([batchName, batchLectures]) => (
            <div
              key={batchName}
              className="bg-white rounded-lg shadow-sm border border-gray-200"
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {batchName}
                  </h2>
                  <span className="text-sm text-gray-600">
                    {batchLectures.length} pending lecture
                    {batchLectures.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {batchLectures.map((lecture) => (
                    <div
                      key={`${lecture.batchId}-${lecture.lectureId}`}
                      className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                    >
                      <div className="mb-3">
                        <h3 className="font-medium text-gray-900 mb-1">
                          {lecture.lectureTitle}
                        </h3>
                        <p className="text-sm text-gray-600 mb-1">
                          {lecture.subjectName}
                        </p>
                        <p className="text-xs text-gray-500">
                          Topic: {lecture.topicName}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          Ready to deliver
                        </div>
                        <button
                          onClick={() => handleMarkLectureCompleted(lecture)}
                          disabled={completingLecture === lecture.lectureId}
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {completingLecture === lecture.lectureId
                            ? "Marking..."
                            : "Mark Complete"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loading && (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm
                ? "No matching lectures found"
                : "All lectures completed!"}
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? "Try adjusting your search terms to find lectures."
                : "You have completed all your assigned lectures. Great work!"}
            </p>
          </div>
        )
      )}
    </div>
  );
};

export default MyLectures;
