import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './components/auth/LoginPage';
import BusinessDashboard from './components/business/BusinessDashboard';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import CourseDetails from './components/business/CourseDetails';
import BatchDetails from './components/business/BatchDetails';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

function AppContent() {
  const { user, isAuthenticated } = useAuth();
  const [showMenu, setShowMenu] = useState(false); // Mobile-first: hidden by default

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <Router>
      <div className="flex min-h-screen bg-gray-50">
        {/* Mobile Overlay */}
        {showMenu && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setShowMenu(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
          ${showMenu ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <Sidebar
            showMenu={showMenu}
            setShowMenu={setShowMenu}
          />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header 
            showMenu={showMenu}
            setShowMenu={setShowMenu} 
          />
          <main className="flex-1 overflow-auto">
            <Routes>
              {user?.role === 'business' ? (
                <>
                  <Route path="/dashboard" element={<BusinessDashboard />} />
                  <Route path="/teachers" element={<BusinessDashboard />} />
                  <Route path="/courses" element={<BusinessDashboard />} />
                  <Route path="/courses/:courseId" element={<CourseDetails />} />
                  <Route path="/batches" element={<BusinessDashboard />} />
                  <Route path="/batches/:batchId" element={<BatchDetails />} />
                  <Route path="/lectures" element={<BusinessDashboard />} />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </>
              ) : (
                <>
                  <Route path="/dashboard" element={<TeacherDashboard />} />
                  <Route path="/my-courses" element={<TeacherDashboard />} />
                  <Route path="/lectures" element={<TeacherDashboard />} />
                  <Route path="/progress" element={<TeacherDashboard />} />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </>
              )}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
      <Toaster />
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;