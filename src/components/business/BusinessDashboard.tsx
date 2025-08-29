import React from 'react';
import { useLocation } from 'react-router-dom';
import DashboardOverview from './DashboardOverview';
import TeacherManagement from './TeacherManagement';
import CourseManagement from './CourseManagement';
import BatchManagement from './BatchManagement';
import LectureTracking from './LectureTracking';

const BusinessDashboard: React.FC = () => {
  const location = useLocation();
  
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/teachers') return 'teachers';
    if (path === '/courses') return 'courses';
    if (path === '/batches') return 'batches';
    if (path === '/lectures') return 'lectures';
    return 'dashboard';
  };

  const renderContent = () => {
    const activeTab = getActiveTab();
    
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'teachers':
        return <TeacherManagement />;
      case 'courses':
        return <CourseManagement />;
      case 'batches':
        return <BatchManagement />;
      case 'lectures':
        return <LectureTracking />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6 max-w-full">
      {renderContent()}
    </div>
  );
};

export default BusinessDashboard;