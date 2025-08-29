import React, { useState } from 'react';
import { Search, Calendar, Clock, User, BookOpen, TrendingUp, Filter } from 'lucide-react';
import { showToast } from '../../utils/toast';

interface LectureAssignment {
  id: string;
  teacher: string;
  subject: string;
  totalLectures: number;
  completedLectures: number;
  remainingLectures: number;
  batch: string;
  lastLectureDate: string;
}

interface LectureRecord {
  id: string;
  teacher: string;
  subject: string;
  batch: string;
  date: string;
  duration: number;
  status: 'completed' | 'missed' | 'rescheduled';
}

const LectureTracking: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'assignments' | 'daily' | 'monthly'>('assignments');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for lecture assignments
  const lectureAssignments: LectureAssignment[] = [
    {
      id: '1',
      teacher: 'Sarah Johnson',
      subject: 'Mathematics',
      totalLectures: 80,
      completedLectures: 45,
      remainingLectures: 35,
      batch: 'Math Batch A',
      lastLectureDate: '2024-01-25'
    },
    {
      id: '2',
      teacher: 'Sarah Johnson',
      subject: 'Physics',
      totalLectures: 60,
      completedLectures: 20,
      remainingLectures: 40,
      batch: 'Physics Batch A',
      lastLectureDate: '2024-01-24'
    },
    {
      id: '3',
      teacher: 'Michael Brown',
      subject: 'Chemistry',
      totalLectures: 70,
      completedLectures: 35,
      remainingLectures: 35,
      batch: 'Chemistry Batch B',
      lastLectureDate: '2024-01-26'
    },
    {
      id: '4',
      teacher: 'Emily Davis',
      subject: 'English',
      totalLectures: 50,
      completedLectures: 42,
      remainingLectures: 8,
      batch: 'Writing Batch C',
      lastLectureDate: '2024-01-25'
    }
  ];

  // Mock data for daily lecture records
  const dailyRecords: LectureRecord[] = [
    {
      id: '1',
      teacher: 'Sarah Johnson',
      subject: 'Mathematics',
      batch: 'Math Batch A',
      date: '2024-01-26',
      duration: 60,
      status: 'completed'
    },
    {
      id: '2',
      teacher: 'Michael Brown',
      subject: 'Chemistry',
      batch: 'Chemistry Batch B',
      date: '2024-01-26',
      duration: 45,
      status: 'completed'
    },
    {
      id: '3',
      teacher: 'Emily Davis',
      subject: 'English',
      batch: 'Writing Batch C',
      date: '2024-01-25',
      duration: 50,
      status: 'completed'
    },
    {
      id: '4',
      teacher: 'Dr. Wilson',
      subject: 'Physics',
      batch: 'Physics Batch D',
      date: '2024-01-25',
      duration: 0,
      status: 'missed'
    }
  ];

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'missed':
        return 'bg-red-100 text-red-800';
      case 'rescheduled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderAssignmentsTab = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">4</h3>
              <p className="text-sm text-gray-600">Active Teachers</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">260</h3>
              <p className="text-sm text-gray-600">Total Lectures</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <Clock className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">142</h3>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">55%</h3>
              <p className="text-sm text-gray-600">Average Progress</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lecture Assignments Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Lecture Assignments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Lecture</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lectureAssignments.map((assignment) => {
                const progress = (assignment.completedLectures / assignment.totalLectures) * 100;
                return (
                  <tr key={assignment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{assignment.teacher}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{assignment.subject}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{assignment.batch}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-600 h-2 rounded-full"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{Math.round(progress)}%</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {assignment.completedLectures}/{assignment.totalLectures}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        assignment.remainingLectures <= 10 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {assignment.remainingLectures} left
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(assignment.lastLectureDate).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderDailyTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Today's Lecture Records</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dailyRecords.map((record) => (
              <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{record.subject}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(record.status)}`}>
                    {record.status}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Teacher:</span>
                    <span className="text-gray-900">{record.teacher}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Batch:</span>
                    <span className="text-gray-900">{record.batch}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="text-gray-900">{record.duration} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span className="text-gray-900">{new Date(record.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMonthlyTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">156</div>
            <p className="text-gray-600">Total Lectures</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">142</div>
            <p className="text-gray-600">Completed</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">8</div>
            <p className="text-gray-600">Missed</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">6</div>
            <p className="text-gray-600">Rescheduled</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Lecture Tracking</h1>
        <p className="text-gray-600">Monitor lecture assignments and daily progress</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'assignments', label: 'Assignments', icon: BookOpen },
              { id: 'daily', label: 'Daily Tracking', icon: Calendar },
              { id: 'monthly', label: 'Monthly View', icon: TrendingUp }
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
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by teacher, subject, or batch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700">Filter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'assignments' && renderAssignmentsTab()}
      {activeTab === 'daily' && renderDailyTab()}
      {activeTab === 'monthly' && renderMonthlyTab()}
    </div>
  );
};

export default LectureTracking;