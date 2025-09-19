import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Calendar, Clock, CheckCircle, Circle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { Batch, apiService } from '../../services/api';
import { showToast, handleApiError } from '../../utils/toast';

const BatchDetails: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBatchDetails();
  }, []);

  const fetchBatchDetails = async () => {
    if (!batchId) {
      navigate('/batches');
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.getBatchById(batchId);
      if (response.success) {
        setBatch(response.data);
      } else {
        showToast.error('Failed to load batch details');
        navigate('/batches');
      }
    } catch (error) {
      handleApiError(error, 'Failed to fetch batch details');
      navigate('/batches');
      console.error('Error fetching batch details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const timeDiff = end.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff;
  };

  const getBatchStatus = (batch: Batch) => {
    const now = new Date();
    const startDate = new Date(batch.startDate);
    const endDate = new Date(batch.endDate);

    if (now < startDate) return { status: 'upcoming', color: 'bg-blue-100 text-blue-800' };
    if (now > endDate) return { status: 'completed', color: 'bg-gray-100 text-gray-800' };

    const daysToEnd = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysToEnd <= 7) return { status: 'expiring', color: 'bg-yellow-100 text-yellow-800' };

    return { status: 'active', color: 'bg-green-100 text-green-800' };
  };

  if (loading && !batch) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <p className="mt-2 text-gray-600">Loading batch details...</p>
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Batch not found</p>
          <button
            onClick={() => navigate('/batches')}
            className="mt-4 text-red-600 hover:text-red-800 font-medium"
          >
            ← Back to Batches
          </button>
        </div>
      </div>
    );
  }

  const batchStatus = getBatchStatus(batch);
  const daysRemaining = getDaysRemaining(batch.endDate);
  const totalLectures = batch.subjects.reduce((acc, subject) => acc + subject.totalLectures, 0);

  return (
    <div className="space-y-6 m-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/batches')}
          className="flex items-center space-x-2 text-red-600 hover:text-red-800 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Batches</span>
        </button>
      </div>

      {/* Batch Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{batch.name}</h1>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`inline-block px-3 py-1 text-sm rounded-full ${batchStatus.color}`}>
                  {batchStatus.status}
                </span>
                <span className="text-sm text-gray-600">
                  {new Date(batch.startDate).toLocaleDateString()} - {new Date(batch.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Days Remaining</p>
              <p className={`text-2xl font-bold ${
                daysRemaining <= 0 ? 'text-red-600' : 
                daysRemaining <= 7 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {daysRemaining <= 0 ? 'Expired' : `${daysRemaining}`}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Subjects</p>
                <p className="font-medium text-gray-900">{batch.subjects.length}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Timing</p>
                <p className="font-medium text-gray-900">{batch.time}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Lectures</p>
                <p className="font-medium text-gray-900">{totalLectures}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Start Date</p>
                <p className="font-medium text-gray-900">{new Date(batch.startDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Calendar className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">End Date</p>
                <p className="font-medium text-gray-900">{new Date(batch.endDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subjects and Faculty */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Subjects & Faculty Assignments</h2>
        </div>
        <div className="p-6">
          {batch.subjects.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No subjects assigned</h3>
              <p className="text-gray-600">This batch doesn't have any subjects assigned yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {batch.subjects.map((subject, index) => (
                <div key={subject._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {index + 1}. {subject.title}
                      </h3>
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">
                          Faculty: {subject.facultyId.firstName} {subject.facultyId.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{subject.facultyId.email}</p>
                        {subject.facultyId.facultyProfile?.department && (
                          <p className="text-xs text-gray-500">
                            Department: {subject.facultyId.facultyProfile.department}
                          </p>
                        )}
                        {subject.facultyId.facultyProfile?.specialization && 
                         subject.facultyId.facultyProfile.specialization.length > 0 && (
                          <p className="text-xs text-gray-500">
                            Specialization: {subject.facultyId.facultyProfile.specialization.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total Lectures</p>
                      <p className="font-medium text-gray-900">{subject.totalLectures}</p>
                    </div>
                  </div>

                  {/* Topics */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Topics ({subject.topics.length})</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {subject.topics.map((topic, topicIndex) => (
                        <div key={topic._id} className="bg-gray-50 rounded-lg p-3">
                          <h5 className="font-medium text-gray-900 text-sm mb-2">
                            {index + 1}.{topicIndex + 1} {topic.title}
                          </h5>
                          <div className="space-y-1">
                            {topic.lectures.map((lecture, lectureIndex) => (
                              <div key={lecture._id} className="flex items-center space-x-2 text-xs">
                                {lecture.completedAt ? (
                                  <CheckCircle className="w-3 h-3 text-green-600" />
                                ) : (
                                  <Circle className="w-3 h-3 text-gray-400" />
                                )}
                                <span className="text-gray-700">
                                  {index + 1}.{topicIndex + 1}.{lectureIndex + 1} {lecture.title}
                                </span>
                                {lecture.completedAt && (
                                  <span className="text-xs text-green-600 bg-green-100 px-1 py-0.5 rounded">
                                    ✓
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchDetails;