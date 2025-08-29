import React from 'react';
import { TrendingUp, BookOpen, Clock, Target, Calendar, Award } from 'lucide-react';
import { showToast } from '../../utils/toast';

const Progress: React.FC = () => {
  // Mock progress data
  const courseProgress = [
    {
      course: 'Advanced Mathematics',
      batch: 'Math Batch A',
      totalTopics: 20,
      completedTopics: 15,
      progress: 75,
      totalLectures: 80,
      completedLectures: 45
    },
    {
      course: 'Basic Physics',
      batch: 'Physics Batch B',
      totalTopics: 20,
      completedTopics: 12,
      progress: 60,
      totalLectures: 60,
      completedLectures: 20
    },
    {
      course: 'Applied Chemistry',
      batch: 'Chemistry Batch C',
      totalTopics: 20,
      completedTopics: 18,
      progress: 90,
      totalLectures: 70,
      completedLectures: 55
    }
  ];

  const monthlyStats = [
    { month: 'Jan', lectures: 22, topics: 8 },
    { month: 'Feb', lectures: 20, topics: 6 },
    { month: 'Mar', lectures: 25, topics: 10 },
    { month: 'Apr', lectures: 18, topics: 7 }
  ];

  const achievements = [
    {
      title: 'High Completion Rate',
      description: 'Achieved 90% lecture completion in Chemistry',
      date: '2024-01-20',
      icon: Award,
      color: 'text-yellow-600 bg-yellow-100'
    },
    {
      title: 'Consistent Teaching',
      description: 'No missed lectures for 2 months',
      date: '2024-01-15',
      icon: Target,
      color: 'text-green-600 bg-green-100'
    },
    {
      title: 'Student Excellence',
      description: 'Excellent teaching performance maintained',
      date: '2024-01-10',
      icon: TrendingUp,
      color: 'text-blue-600 bg-blue-100'
    }
  ];

  const overallStats = {
    totalCourses: courseProgress.length,
    totalTopicsCompleted: courseProgress.reduce((acc, course) => acc + course.completedTopics, 0),
    totalLecturesGiven: courseProgress.reduce((acc, course) => acc + course.completedLectures, 0),
    averageCompletion: Math.round(courseProgress.reduce((acc, course) => acc + course.progress, 0) / courseProgress.length)
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Progress</h1>
        <p className="text-gray-600">Track your teaching performance and achievements</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{overallStats.totalCourses}</h3>
              <p className="text-sm text-gray-600">Active Courses</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{overallStats.totalTopicsCompleted}</h3>
              <p className="text-sm text-gray-600">Topics Completed</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{overallStats.totalLecturesGiven}</h3>
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
              <h3 className="text-2xl font-bold text-gray-900">{overallStats.averageCompletion}%</h3>
              <p className="text-sm text-gray-600">Avg Completion</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Course Progress Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Course Progress Details</h2>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {courseProgress.map((course, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{course.course}</h3>
                    <p className="text-sm text-gray-600">{course.batch}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-600">{course.progress}%</p>
                    <p className="text-sm text-gray-600">Complete</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-xl font-bold text-blue-600">{course.completedTopics}/{course.totalTopics}</p>
                    <p className="text-sm text-gray-600">Topics Done</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-xl font-bold text-green-600">{course.completedLectures}/{course.totalLectures}</p>
                    <p className="text-sm text-gray-600">Lectures</p>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Overall Progress</span>
                    <span className="font-medium text-gray-900">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-red-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Monthly Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {monthlyStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Calendar className="w-5 h-5 text-gray-600" />
                    </div>
                    <span className="font-medium text-gray-900">{stat.month} 2024</span>
                  </div>
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="text-center">
                      <p className="font-medium text-blue-600">{stat.lectures}</p>
                      <p className="text-gray-500">Lectures</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-green-600">{stat.topics}</p>
                      <p className="text-gray-500">Topics</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Achievements</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                  <div className={`p-2 rounded-lg ${achievement.color}`}>
                    <achievement.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{achievement.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(achievement.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Teaching Insights</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">Excellent</div>
              <p className="text-sm text-gray-600">Your completion rate is above average</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">Consistent</div>
              <p className="text-sm text-gray-600">Regular lecture schedule maintained</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-3xl font-bold text-yellow-600 mb-2">Improving</div>
              <p className="text-sm text-gray-600">Teaching efficiency showing upward trend</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;