import React, { useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Clock,
  Users,
  CheckCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  apiService,
  Course,
  CreateCoursePayload,
  UpdateCoursePayload,
  PaginationParams,
} from "../../services/api";
import { showToast, handleApiError } from "../../utils/toast";

const CourseManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    courseCode: "",
    durationValue: 1,
    durationUnit: "months",
    status: "active" as "active" | "inactive" | "draft",
  });

  React.useEffect(() => {
    fetchCourses();
  }, [currentPage, itemsPerPage, sortBy, sortOrder, searchTerm, statusFilter]);

  // Add debounced search effect
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1); // Reset to first page when search/filter changes
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const paginationParams: PaginationParams = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy,
        sortOrder,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
      };

      const response = await apiService.getCourses(paginationParams);
      if (response.success) {
        setCourses(response.data);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
          setTotalItems(response.pagination.totalItems);
        }
      } else {
        showToast.error('Failed to fetch courses');
      }
    } catch (error) {
      handleApiError(error, 'Failed to fetch courses');
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload: CreateCoursePayload = {
        title: formData.title,
        description: formData.description,
        courseCode: formData.courseCode,
        duration: {
          value: formData.durationValue,
          unit: formData.durationUnit,
        },
        status: formData.status,
      };

      const response = await apiService.createCourse(payload);
      if (response.success) {
        showToast.success('Course created successfully');
        setShowAddModal(false);
        setFormData({
          title: "",
          description: "",
          courseCode: "",
          durationValue: 1,
          durationUnit: "months",
          status: "active",
        });
        fetchCourses(); // Revalidate data
      } else {
        showToast.error('Failed to create course');
      }
    } catch (error) {
      handleApiError(error, 'Failed to create course');
      console.error("Error creating course:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      courseCode: course.courseCode,
      durationValue: course.duration.value,
      durationUnit: course.duration.unit,
      status: course.status,
    });
    setShowAddModal(true);
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    try {
      setLoading(true);
      const payload: UpdateCoursePayload = {
        courseId: editingCourse._id,
        title: formData.title,
        description: formData.description,
        courseCode: formData.courseCode,
        duration: {
          value: formData.durationValue,
          unit: formData.durationUnit,
        },
        status: formData.status,
      };

      const response = await apiService.updateCourse(payload);
      if (response.success) {
        showToast.success('Course updated successfully');
        setShowAddModal(false);
        setEditingCourse(null);
        setFormData({
          title: "",
          description: "",
          courseCode: "",
          durationValue: 1,
          durationUnit: "months",
          status: "active",
        });
        fetchCourses(); // Revalidate data
      } else {
        showToast.error('Failed to update course');
      }
    } catch (error) {
      handleApiError(error, 'Failed to update course');
      console.error("Error updating course:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowAddModal(false);
    setEditingCourse(null);
    setFormData({
      title: "",
      description: "",
      courseCode: "",
      durationValue: 1,
      durationUnit: "months",
      status: "active",
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1); // Reset to first page
  };

  const handleSortChange = (field: string) => {
    if (field === sortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Course Management
          </h1>
          <p className="text-gray-600">
            Create and manage courses with detailed roadmaps
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create Course</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Search, Filters, and Sorting */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search courses by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split("-");
              setSortBy(field);
              setSortOrder(order as "asc" | "desc");
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="title-asc">Title A-Z</option>
            <option value="title-desc">Title Z-A</option>
            <option value="status-asc">Status A-Z</option>
          </select>
        </div>

        {/* Results Info */}
        <div className="mt-4 text-sm text-gray-600">
          {totalItems > 0 ? (
            <>
              Showing{" "}
              {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} to{" "}
              {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
              courses
            </>
          ) : (
            "No courses found"
          )}
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <p className="mt-2 text-gray-600">Loading courses...</p>
        </div>
      )}

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {courses.map((course) => (
          <div
            key={course._id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {course.description}
                  </p>
                  <p className="text-gray-500 text-xs mb-3">
                    Code: {course.courseCode}
                  </p>
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(
                      course.status
                    )}`}
                  >
                    {course.status}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditCourse(course)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Course Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>
                      {course.duration.value} {course.duration.unit}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Duration</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{course.subjects.length}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Subjects</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>
                      {course.subjects.reduce(
                        (acc, subject) => acc + subject.topics.length,
                        0
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Topics</p>
                </div>
              </div>

              {/* Subjects Preview */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Subjects
                </h4>
                <div className="space-y-1">
                  {course.subjects.slice(0, 3).map((subject) => (
                    <div
                      key={subject._id}
                      className="flex items-center space-x-2 text-sm"
                    >
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-900">{subject.title}</span>
                    </div>
                  ))}
                  {course.subjects.length > 3 && (
                    <p className="text-xs text-gray-500 ml-6">
                      +{course.subjects.length - 3} more subjects
                    </p>
                  )}
                  {course.subjects.length === 0 && (
                    <p className="text-xs text-gray-500">
                      No subjects added yet
                    </p>
                  )}
                </div>
              </div>

              {/* Created By */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Created By
                </h4>
                <p className="text-sm text-gray-600">
                  {course.createdBy.firstName} {course.createdBy.lastName}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-xs text-gray-500">
                  Created {new Date(course.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => navigate(`/courses/${course._id}`)}
                  className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages} ({totalItems} total courses)
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page Numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 rounded-md text-sm ${
                      pageNum === currentPage
                        ? "bg-red-600 text-white"
                        : "border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingCourse ? "Edit Course" : "Create New Course"}
            </h2>
            <form
              onSubmit={editingCourse ? handleUpdateCourse : handleCreateCourse}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter course title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter course description"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Code
                </label>
                <input
                  type="text"
                  value={formData.courseCode}
                  onChange={(e) =>
                    setFormData({ ...formData, courseCode: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g., SSC101"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration Value
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.durationValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        durationValue: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="6"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration Unit
                  </label>
                  <select
                    value={formData.durationUnit}
                    onChange={(e) =>
                      setFormData({ ...formData, durationUnit: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as "active" | "inactive" | "draft",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex items-center space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading
                    ? editingCourse
                      ? "Updating..."
                      : "Creating..."
                    : editingCourse
                    ? "Update Course"
                    : "Create Course"}
                </button>
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
