import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, ChevronDown, ChevronRight, BookOpen, Clock, Play } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { Course, Subject, Topic, Lecture, apiService, AddSubjectPayload, AddTopicPayload, AddLecturePayload, UpdateSubjectPayload, UpdateTopicPayload, UpdateLecturePayload, DeleteSubjectPayload, DeleteTopicPayload, DeleteLecturePayload } from '../../services/api';
import { showToast, handleApiError } from '../../utils/toast';

const CourseDetails: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [showAddTopicModal, setShowAddTopicModal] = useState(false);
  const [showAddLectureModal, setShowAddLectureModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [editingLecture, setEditingLecture] = useState<Lecture | null>(null);

  // Delete confirmation states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteType, setDeleteType] = useState<'subject' | 'topic' | 'lecture' | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{
    subject?: Subject;
    topic?: Topic;
    lecture?: Lecture;
  }>({});

  // Form states
  const [subjectForm, setSubjectForm] = useState({
    title: '',
    description: '',
    order: 1
  });

  const [topicForm, setTopicForm] = useState({
    title: '',
    description: '',
    order: 1,
    estimatedHours: 1
  });

  const [lectureForm, setLectureForm] = useState({
    title: '',
    description: '',
    order: 1
  });

  const resetForms = () => {
    setSubjectForm({ title: '', description: '', order: 1 });
    setTopicForm({ title: '', description: '', order: 1, estimatedHours: 1 });
    setLectureForm({ title: '', description: '', order: 1 });
    setEditingSubject(null);
    setEditingTopic(null);
    setEditingLecture(null);
  };

  useEffect(() => {
    fetchCourseDetails();
  }, []);

  const fetchCourseDetails = async () => {
    if (!courseId) {
      navigate('/courses');
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.getCourseById(courseId);
      if (response.success) {
        setCourse(response.data);
      } else {
        showToast.error('Failed to load course details');
        navigate('/courses');
      }
    } catch (error) {
      handleApiError(error, 'Failed to fetch course details');
      navigate('/courses');
      console.error('Error fetching course details:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSubject = (subjectId: string) => {
    const newExpanded = new Set(expandedSubjects);
    if (newExpanded.has(subjectId)) {
      newExpanded.delete(subjectId);
    } else {
      newExpanded.add(subjectId);
    }
    setExpandedSubjects(newExpanded);
  };

  const toggleTopic = (topicId: string) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId);
    } else {
      newExpanded.add(topicId);
    }
    setExpandedTopics(newExpanded);
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;

    try {
      setLoading(true);
      const payload: AddSubjectPayload = {
        courseId: course._id,
        title: subjectForm.title,
        description: subjectForm.description,
        order: subjectForm.order
      };

      const response = await apiService.addSubject(payload);
      if (response.success) {
        showToast.success('Subject added successfully');
        setShowAddSubjectModal(false);
        setSubjectForm({ title: '', description: '', order: 1 });
        fetchCourseDetails(); // Revalidate data
      } else {
        showToast.error('Failed to add subject');
      }
    } catch (error) {
      handleApiError(error, 'Failed to add subject');
      console.error('Error adding subject:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setSubjectForm({
      title: subject.title,
      description: subject.description,
      order: subject.order
    });
    setShowAddSubjectModal(true);
  };

  const handleUpdateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject || !course) return;

    try {
      setLoading(true);
      const payload: UpdateSubjectPayload = {
        courseId: course._id,
        subjectId: editingSubject._id,
        title: subjectForm.title,
        description: subjectForm.description,
        order: subjectForm.order
      };

      const response = await apiService.updateSubject(payload);
      if (response.success) {
        showToast.success('Subject updated successfully');
        setShowAddSubjectModal(false);
        resetForms();
        fetchCourseDetails(); // Revalidate data
      } else {
        showToast.error('Failed to update subject');
      }
    } catch (error) {
      handleApiError(error, 'Failed to update subject');
      console.error('Error updating subject:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTopic = (subject: Subject, topic: Topic) => {
    setSelectedSubject(subject);
    setEditingTopic(topic);
    setTopicForm({
      title: topic.title,
      description: topic.description,
      order: topic.order,
      estimatedHours: topic.estimatedHours
    });
    setShowAddTopicModal(true);
  };

  const handleUpdateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject || !editingTopic || !course) return;

    try {
      setLoading(true);
      const payload: UpdateTopicPayload = {
        courseId: course._id,
        subjectId: selectedSubject._id,
        topicId: editingTopic._id,
        title: topicForm.title,
        description: topicForm.description,
        estimatedHours: topicForm.estimatedHours
      };

      const response = await apiService.updateTopic(payload);
      if (response.success) {
        showToast.success('Topic updated successfully');
        setShowAddTopicModal(false);
        resetForms();
        fetchCourseDetails(); // Revalidate data
      } else {
        showToast.error('Failed to update topic');
      }
    } catch (error) {
      handleApiError(error, 'Failed to update topic');
      console.error('Error updating topic:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditLecture = (subject: Subject, topic: Topic, lecture: Lecture) => {
    setSelectedSubject(subject);
    setSelectedTopic(topic);
    setEditingLecture(lecture);
    setLectureForm({
      title: lecture.title,
      description: lecture.description,
      order: lecture.order
    });
    setShowAddLectureModal(true);
  };

  const handleUpdateLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject || !selectedTopic || !editingLecture || !course) return;

    try {
      setLoading(true);
      const payload: UpdateLecturePayload = {
        courseId: course._id,
        subjectId: selectedSubject._id,
        topicId: selectedTopic._id,
        lectureId: editingLecture._id,
        title: lectureForm.title,
        description: lectureForm.description,
        durationMinutes: 60 // Default value
      };

      const response = await apiService.updateLecture(payload);
      if (response.success) {
        showToast.success('Lecture updated successfully');
        setShowAddLectureModal(false);
        resetForms();
        fetchCourseDetails(); // Revalidate data
      } else {
        showToast.error('Failed to update lecture');
      }
    } catch (error) {
      handleApiError(error, 'Failed to update lecture');
      console.error('Error updating lecture:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject || !course) return;

    try {
      setLoading(true);
      const payload: AddTopicPayload = {
        courseId: course._id,
        subjectId: selectedSubject._id,
        title: topicForm.title,
        description: topicForm.description,
        order: topicForm.order,
        estimatedHours: topicForm.estimatedHours
      };

      const response = await apiService.addTopic(payload);
      if (response.success) {
        showToast.success('Topic added successfully');
        setShowAddTopicModal(false);
        setTopicForm({ title: '', description: '', order: 1, estimatedHours: 1 });
        resetForms();
        fetchCourseDetails(); // Revalidate data
      } else {
        showToast.error('Failed to add topic');
      }
    } catch (error) {
      handleApiError(error, 'Failed to add topic');
      console.error('Error adding topic:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject || !selectedTopic || !course) return;

    try {
      setLoading(true);
      const payload: AddLecturePayload = {
        courseId: course._id,
        subjectId: selectedSubject._id,
        topicId: selectedTopic._id,
        title: lectureForm.title,
        description: lectureForm.description,
        order: lectureForm.order
      };

      const response = await apiService.addLecture(payload);
      if (response.success) {
        showToast.success('Lecture added successfully');
        setShowAddLectureModal(false);
        setLectureForm({ title: '', description: '', order: 1 });
        resetForms();
        fetchCourseDetails(); // Revalidate data
      } else {
        showToast.error('Failed to add lecture');
      }
    } catch (error) {
      handleApiError(error, 'Failed to add lecture');
      console.error('Error adding lecture:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubject = async () => {
    if (!course || !itemToDelete.subject) return;

    try {
      setLoading(true);
      const payload: DeleteSubjectPayload = {
        courseId: course._id,
        subjectId: itemToDelete.subject._id,
      };

      const response = await apiService.deleteSubject(payload);
      if (response.success) {
        showToast.success('Subject deleted successfully');
        setShowDeleteModal(false);
        resetDeleteState();
        fetchCourseDetails(); // Revalidate data
      } else {
        showToast.error('Failed to delete subject');
      }
    } catch (error) {
      handleApiError(error, 'Failed to delete subject');
      console.error('Error deleting subject:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTopic = async () => {
    if (!course || !itemToDelete.subject || !itemToDelete.topic) return;

    try {
      setLoading(true);
      const payload: DeleteTopicPayload = {
        courseId: course._id,
        subjectId: itemToDelete.subject._id,
        topicId: itemToDelete.topic._id,
      };

      const response = await apiService.deleteTopic(payload);
      if (response.success) {
        showToast.success('Topic deleted successfully');
        setShowDeleteModal(false);
        resetDeleteState();
        fetchCourseDetails(); // Revalidate data
      } else {
        showToast.error('Failed to delete topic');
      }
    } catch (error) {
      handleApiError(error, 'Failed to delete topic');
      console.error('Error deleting topic:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLecture = async () => {
    if (!course || !itemToDelete.subject || !itemToDelete.topic || !itemToDelete.lecture) return;

    try {
      setLoading(true);
      const payload: DeleteLecturePayload = {
        courseId: course._id,
        subjectId: itemToDelete.subject._id,
        topicId: itemToDelete.topic._id,
        lectureId: itemToDelete.lecture._id,
      };

      const response = await apiService.deleteLecture(payload);
      if (response.success) {
        showToast.success('Lecture deleted successfully');
        setShowDeleteModal(false);
        resetDeleteState();
        fetchCourseDetails(); // Revalidate data
      } else {
        showToast.error('Failed to delete lecture');
      }
    } catch (error) {
      handleApiError(error, 'Failed to delete lecture');
      console.error('Error deleting lecture:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (type: 'subject' | 'topic' | 'lecture', subject: Subject, topic?: Topic, lecture?: Lecture) => {
    setDeleteType(type);
    setItemToDelete({ subject, topic, lecture });
    setShowDeleteModal(true);
  };

  const resetDeleteState = () => {
    setDeleteType(null);
    setItemToDelete({});
  };

  const executeDelete = () => {
    switch (deleteType) {
      case 'subject':
        return handleDeleteSubject();
      case 'topic':
        return handleDeleteTopic();
      case 'lecture':
        return handleDeleteLecture();
      default:
        return Promise.resolve();
    }
  };

  const getDeleteMessage = () => {
    switch (deleteType) {
      case 'subject':
        return `Are you sure you want to delete the subject "${itemToDelete.subject?.title}"? This will also delete all topics and lectures within this subject.`;
      case 'topic':
        return `Are you sure you want to delete the topic "${itemToDelete.topic?.title}"? This will also delete all lectures within this topic.`;
      case 'lecture':
        return `Are you sure you want to delete the lecture "${itemToDelete.lecture?.title}"?`;
      default:
        return 'Are you sure you want to delete this item?';
    }
  };

  const openAddTopicModal = (subject: Subject) => {
    setSelectedSubject(subject);
    setTopicForm({ ...topicForm, order: subject.topics.length + 1, estimatedHours: 1 });
    setShowAddTopicModal(true);
  };

  const openAddLectureModal = (subject: Subject, topic: Topic) => {
    setSelectedSubject(subject);
    setSelectedTopic(topic);
    setLectureForm({ ...lectureForm, order: topic.lectures.length + 1 });
    setShowAddLectureModal(true);
  };

  if (loading && !course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <p className="mt-2 text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Course not found</p>
          <button
            onClick={() => navigate('/courses')}
            className="mt-4 text-red-600 hover:text-red-800 font-medium"
          >
            ← Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/courses')}
          className="flex items-center space-x-2 text-red-600 hover:text-red-800 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Courses</span>
        </button>
        <button
          onClick={() => {
            setSubjectForm({ ...subjectForm, order: course.subjects.length + 1 });
            setShowAddSubjectModal(true);
          }}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Subject</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Course Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
              <p className="text-gray-600 mt-1">{course.description}</p>
              <p className="text-sm text-gray-500 mt-1">Code: {course.courseCode}</p>
            </div>
            <div className="text-right">
              <span className={`inline-block px-3 py-1 text-sm rounded-full ${
                course.status === 'active' ? 'bg-green-100 text-green-800' :
                course.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {course.status}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-medium text-gray-900">{course.duration.value} {course.duration.unit}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Subjects</p>
                <p className="font-medium text-gray-900">{course.subjects.length}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Play className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Topics</p>
                <p className="font-medium text-gray-900">
                  {course.subjects.reduce((acc, subject) => acc + subject.topics.length, 0)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Play className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Lectures</p>
                <p className="font-medium text-gray-900">
                  {course.subjects.reduce((acc, subject) => 
                    acc + subject.topics.reduce((topicAcc, topic) => topicAcc + topic.lectures.length, 0), 0
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Structure */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Course Structure</h2>
        </div>
        <div className="p-6">
          {course.subjects.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No subjects added yet</h3>
              <p className="text-gray-600 mb-4">Start building your course by adding subjects</p>
              <button
                onClick={() => {
                  setSubjectForm({ ...subjectForm, order: 1 });
                  setShowAddSubjectModal(true);
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Add First Subject
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {course.subjects.map((subject, subjectIndex) => (
                <div key={subject._id} className="border border-gray-200 rounded-lg">
                  <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => toggleSubject(subject._id)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          {expandedSubjects.has(subject._id) ? (
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                          )}
                        </button>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {subjectIndex + 1}. {subject.title}
                          </h3>
                          <p className="text-sm text-gray-600">{subject.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {subject.topics.length} topics
                        </span>
                        <button
                          onClick={() => openAddTopicModal(subject)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="Add Topic"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditSubject(subject)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => confirmDelete('subject', subject)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {expandedSubjects.has(subject._id) && (
                    <div className="p-4">
                      {subject.topics.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-gray-600 mb-2">No topics added yet</p>
                          <button
                            onClick={() => openAddTopicModal(subject)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Add First Topic
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {subject.topics.map((topic, topicIndex) => (
                            <div key={topic._id} className="border border-gray-100 rounded-lg">
                              <div className="p-3 bg-blue-50">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <button
                                      onClick={() => toggleTopic(topic._id)}
                                      className="p-1 hover:bg-blue-100 rounded"
                                    >
                                      {expandedTopics.has(topic._id) ? (
                                        <ChevronDown className="w-4 h-4 text-gray-600" />
                                      ) : (
                                        <ChevronRight className="w-4 h-4 text-gray-600" />
                                      )}
                                    </button>
                                    <div>
                                      <h4 className="font-medium text-gray-900">
                                        {subjectIndex + 1}.{topicIndex + 1} {topic.title}
                                      </h4>
                                      <p className="text-sm text-gray-600">{topic.description}</p>
                                      <div className="flex items-center justify-between mt-1">
                                        <p className="text-xs text-gray-500">
                                          Estimated: {topic.estimatedHours} hours
                                        </p>
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                          {topic.lectures.length} lectures
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-500">
                                      {topic.lectures.length} lectures
                                    </span>
                                    <button
                                      onClick={() => openAddLectureModal(subject, topic)}
                                      className="p-1 text-green-600 hover:text-green-800"
                                      title="Add Lecture"
                                    >
                                      <Plus className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => handleEditTopic(subject, topic)}
                                      className="p-1 text-gray-400 hover:text-blue-600"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => confirmDelete('topic', subject, topic)}
                                      className="p-1 text-gray-400 hover:text-red-600"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {expandedTopics.has(topic._id) && (
                                <div className="p-3">
                                  {topic.lectures.length === 0 ? (
                                    <div className="text-center py-2">
                                      <p className="text-gray-600 mb-2 text-sm">No lectures added yet</p>
                                      <button
                                        onClick={() => openAddLectureModal(subject, topic)}
                                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                                      >
                                        Add First Lecture
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      {topic.lectures.map((lecture, lectureIndex) => (
                                        <div key={lecture._id} className="flex items-center justify-between p-2 bg-green-50 rounded">
                                          <div>
                                            <h5 className="font-medium text-gray-900 text-sm">
                                              {subjectIndex + 1}.{topicIndex + 1}.{lectureIndex + 1} {lecture.title}
                                            </h5>
                                            <p className="text-xs text-gray-600">{lecture.description}</p>
                                            <p className="text-xs text-gray-500">
                                              Duration: {lecture.durationMinutes} minutes
                                            </p>
                                          </div>
                                          <div className="flex items-center space-x-1">
                                            <button 
                                              onClick={() => handleEditLecture(subject, topic, lecture)}
                                              className="p-1 text-gray-400 hover:text-blue-600"
                                            >
                                              <Edit className="w-3 h-3" />
                                            </button>
                                            <button 
                                              onClick={() => confirmDelete('lecture', subject, topic, lecture)}
                                              className="p-1 text-gray-400 hover:text-red-600"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Subject Modal */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingSubject ? 'Edit Subject' : 'Add Subject'}
            </h2>
            <form onSubmit={editingSubject ? handleUpdateSubject : handleAddSubject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject Title</label>
                <input
                  type="text"
                  value={subjectForm.title}
                  onChange={(e) => setSubjectForm({ ...subjectForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter subject title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={3}
                  value={subjectForm.description}
                  onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter subject description"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                <input
                  type="number"
                  min="1"
                  value={subjectForm.order}
                  onChange={(e) => setSubjectForm({ ...subjectForm, order: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex items-center space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? (editingSubject ? 'Updating...' : 'Adding...') : (editingSubject ? 'Update Subject' : 'Add Subject')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddSubjectModal(false);
                    resetForms();
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Topic Modal */}
      {showAddTopicModal && selectedSubject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingTopic ? 'Edit Topic' : `Add Topic to "${selectedSubject.title}"`}
            </h2>
            <form onSubmit={editingTopic ? handleUpdateTopic : handleAddTopic} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Topic Title</label>
                <input
                  type="text"
                  value={topicForm.title}
                  onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter topic title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={3}
                  value={topicForm.description}
                  onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter topic description"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                  <input
                    type="number"
                    min="1"
                    value={topicForm.order}
                    onChange={(e) => setTopicForm({ ...topicForm, order: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Hours</label>
                  <input
                    type="number"
                   min="1"
                   step="1"
                    value={topicForm.estimatedHours}
                   onChange={(e) => setTopicForm({ ...topicForm, estimatedHours: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                   placeholder="1"
                    required
                  />
                </div>
              </div>
              <div className="hidden">
                <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                <input
                  type="number"
                  min="1"
                  value={topicForm.order}
                  onChange={(e) => setTopicForm({ ...topicForm, order: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex items-center space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? (editingTopic ? 'Updating...' : 'Adding...') : (editingTopic ? 'Update Topic' : 'Add Topic')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddTopicModal(false);
                    resetForms();
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Lecture Modal */}
      {showAddLectureModal && selectedSubject && selectedTopic && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingLecture ? 'Edit Lecture' : `Add Lecture to "${selectedTopic.title}"`}
            </h2>
            <form onSubmit={editingLecture ? handleUpdateLecture : handleAddLecture} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lecture Title</label>
                <input
                  type="text"
                  value={lectureForm.title}
                  onChange={(e) => setLectureForm({ ...lectureForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter lecture title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={3}
                  value={lectureForm.description}
                  onChange={(e) => setLectureForm({ ...lectureForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter lecture description"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                <input
                  type="number"
                  min="1"
                  value={lectureForm.order}
                  onChange={(e) => setLectureForm({ ...lectureForm, order: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex items-center space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? (editingLecture ? 'Updating...' : 'Adding...') : (editingLecture ? 'Update Lecture' : 'Add Lecture')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddLectureModal(false);
                    resetForms();
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Delete {deleteType?.charAt(0).toUpperCase() + deleteType?.slice(1)}
            </h2>
            <p className="text-gray-600 mb-6">
              {getDeleteMessage()}
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={executeDelete}
                disabled={loading}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Deleting...' : `Delete ${deleteType?.charAt(0).toUpperCase() + deleteType?.slice(1)}`}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  resetDeleteState();
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetails;