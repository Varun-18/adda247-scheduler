import React, { useState } from "react";
import {
  Search,
  BookOpen,
  Users,
  Clock,
  CheckCircle,
  Circle,
  Play,
} from "lucide-react";
import { apiService, FacultyBatch } from "../../services/api";
import { showToast, handleApiError } from "../../utils/toast";

const MyCourses: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<FacultyBatch | null>(null);
  const [batches, setBatches] = useState<FacultyBatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completingLecture, setCompletingLecture] = useState<string | null>(
    null
  );

  React.useEffect(() => {
    fetchFacultySubjects();
  }, []);

  const fetchFacultySubjects = async () => {
    try {
      setLoading(true);
      const response = await apiService.getFacultySubjects();
      if (response.success) {
        setBatches(response.data);
      } else {
        showToast.error('Failed to fetch your courses');
      }
    } catch (error) {
      handleApiError(error, 'Failed to fetch your courses');
      console.error("Error fetching faculty subjects:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBatches = batches.filter(
    (batch) =>
      batch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.subjects.some((subject) =>
        subject.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const handleMarkLectureCompleted = async (
    batch: FacultyBatch,
    subject: any,
    topic: any,
    lecture: any
  ) => {
    try {
      setCompletingLecture(lecture.lectureId);
      const response = await apiService.markLectureCompleted({
        batchId: batch._id,
        subjectId: subject.subjectId,
        topicId: topic.topicId,
        lectureId: lecture.lectureId,
      });

      if (response.success) {
        showToast.success('Lecture marked as completed');
        
        // Update the local state immediately for better UX
        setBatches(prevBatches => 
          prevBatches.map(batch => {
            if (batchItem._id === batch._id) {
              return {
                ...batchItem,
                subjects: batchItem.subjects.map(subjectItem => {
                  if (subjectItem.subjectId === subject.subjectId) {
                    return {
                      ...subjectItem,
                      topics: subjectItem.topics.map(topicItem => {
                        if (topicItem.topicId === topic.topicId) {
                          return {
                            ...topicItem,
                            lectures: topicItem.lectures.map(lectureItem => {
                              if (lectureItem.lectureId === lecture.lectureId) {
                                return {
                                  ...lectureItem,
                                  completedAt: new Date().toISOString(),
                                  completedBy: 'current-user'
                                };
                              }
                              return lectureItem;
                            })
                          };
                        }
                        return topicItem;
                      })
                    };
                  }
                  return subjectItem;
                })
              };
            }
            return batchItem;
          })
        );
        
        // Update selectedBatch if it's the current batch being viewed
        if (selectedBatch && selectedBatch._id === batch._id) {
          setSelectedBatch(prevSelected => {
            if (!prevSelected) return null;
            return {
              ...prevSelected,
              subjects: prevSelected.subjects.map(subjectItem => {
                if (subjectItem.subjectId === subject.subjectId) {
                  return {
                    ...subjectItem,
                    topics: subjectItem.topics.map(topicItem => {
                      if (topicItem.topicId === topic.topicId) {
                        return {
                          ...topicItem,
                          lectures: topicItem.lectures.map(lectureItem => {
                            if (lectureItem.lectureId === lecture.lectureId) {
                              return {
                                ...lectureItem,
                                completedAt: new Date().toISOString(),
                                completedBy: 'current-user'
                              };
                            }
                            return lectureItem;
                          })
                        };
                      }
                      return topicItem;
                    })
                  };
                }
                return subjectItem;
              })
            };
          });
        }
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('lectureCompleted', {
          detail: { 
            batchId: batch._id, 
            subjectId: subject.subjectId, 
            topicId: topic.topicId, 
            lectureId: lecture.lectureId 
          }
        }));
        
        // Also fetch fresh data to ensure consistency
        setTimeout(() => {
          fetchFacultySubjects();
        }, 500);
      } else {
        showToast.error('Failed to mark lecture as completed');
      }
    } catch (error) {
      handleApiError(error, 'Failed to mark lecture as completed');
      console.error("Error marking lecture as completed:", error);
    } finally {
      setCompletingLecture(null);
    }
  };

  const calculateProgress = (batch: FacultyBatch) => {
    const totalLectures = batch.subjects.reduce(
      (acc, subject) => acc + subject.totalLectures,
      0
    );
    const completedLectures = batch.subjects.reduce(
      (acc, subject) =>
        acc +
        subject.topics.reduce(
          (topicAcc, topic) =>
            topicAcc +
            topic.lectures.filter(
              (lecture) => lecture.completedAt && lecture.completedBy
            ).length,
          0
        ),
      0
    );
    return totalLectures > 0
      ? Math.round((completedLectures / totalLectures) * 100)
      : 0;
  };

  if (selectedBatch) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedBatch(null)}
            className="text-red-600 hover:text-red-800 font-medium"
          >
            ← Back to My Courses
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {selectedBatch.name}
                </h1>
                <p className="text-gray-600 mt-1">Batch Details</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Overall Progress</p>
                <p className="text-2xl font-bold text-red-600">
                  {calculateProgress(selectedBatch)}%
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Subjects & Topics
            </h2>
            <div className="space-y-4">
              {selectedBatch.subjects.map((subject, subjectIndex) => (
                <div
                  key={subject.subjectId}
                  className="border rounded-lg p-4 border-gray-200 hover:border-gray-300"
                >
                  <h3 className="font-medium text-gray-900 mb-3">
                    {subjectIndex + 1}. {subject.title}
                  </h3>

                  <div className="space-y-3 ml-4">
                    {subject.topics.map((topic, topicIndex) => (
                      <div
                        key={topic.topicId}
                        className="border border-gray-100 rounded-lg p-3 bg-blue-50"
                      >
                        <h4 className="font-medium text-gray-900 mb-2">
                          {subjectIndex + 1}.{topicIndex + 1} {topic.title}
                        </h4>

                        <div className="space-y-2 ml-4">
                          {topic.lectures.map((lecture, lectureIndex) => {
                            const isCompleted =
                              lecture.completedAt && lecture.completedBy;
                            return (
                              <div
                                key={lecture.lectureId}
                                className="flex items-center justify-between p-2 bg-white rounded border"
                              >
                                <div className="flex items-center space-x-2">
                                  {isCompleted ? (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <Circle className="w-4 h-4 text-gray-400" />
                                  )}
                                  <span className="text-sm text-gray-900">
                                    {subjectIndex + 1}.{topicIndex + 1}.
                                    {lectureIndex + 1} {lecture.title}
                                  </span>
                                  {isCompleted && (
                                    <span className="text-xs text-gray-500 bg-green-100 px-2 py-1 rounded-full">
                                      Completed
                                    </span>
                                  )}
                                </div>
                                {!isCompleted && (
                                  <button
                                    onClick={() =>
                                      handleMarkLectureCompleted(
                                        selectedBatch,
                                        subject,
                                        topic,
                                        lecture
                                      )
                                    }
                                    disabled={completingLecture === lecture.lectureId}
                                    className="text-xs text-red-600 hover:text-red-800 font-medium"
                                  >
                                    {completingLecture === lecture.lectureId
                                      ? "Marking..."
                                      : "Mark as Completed"}
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
        <p className="text-gray-600">
          Manage your assigned courses and track topic completion
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search courses by title or batch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <p className="mt-2 text-gray-600">Loading your courses...</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredBatches.map((batch) => {
          const progress = calculateProgress(batch);
          return (
            <div
              key={batch._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {batch.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Duration: {new Date(batch.startDate).toLocaleDateString()}{" "}
                      - {new Date(batch.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium text-gray-900">
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-xs text-gray-500">
                    Started {new Date(batch.startDate).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => setSelectedBatch(batch)}
                    className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    <Play className="w-4 h-4" />
                    <span>Manage Batch</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!loading && filteredBatches.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No courses assigned
          </h3>
          <p className="text-gray-600">
            You don't have any courses assigned yet. Contact your administrator
            for course assignments.
          </p>
        </div>
      )}
    </div>
  );
};

export default MyCourses;
