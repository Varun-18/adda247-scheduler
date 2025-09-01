import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  BarChart3,
  CheckSquare,
  Clock,
  X,
} from "lucide-react";
import Logo from "../../assets/header-logo.png";
import { useAuth } from "../../contexts/AuthContext";

interface SidebarProps {
  showMenu: boolean;
  setShowMenu: (val: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ showMenu, setShowMenu }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const businessMenuItems = [
    {
      id: "dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
    },
    { id: "teachers", path: "/teachers", icon: Users, label: "Teachers" },
    { id: "courses", path: "/courses", icon: BookOpen, label: "Courses" },
    { id: "batches", path: "/batches", icon: Calendar, label: "Batches" },
    {
      id: "lectures",
      path: "/lectures",
      icon: Clock,
      label: "Lecture Tracking",
    },
  ];

  const teacherMenuItems = [
    {
      id: "dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
    },
    {
      id: "my-courses",
      path: "/my-courses",
      icon: BookOpen,
      label: "My Courses",
    },
    { id: "lectures", path: "/lectures", icon: Clock, label: "My Lectures" },
    { id: "progress", path: "/progress", icon: CheckSquare, label: "Progress" },
  ];

  const menuItems =
    user?.role === "business" ? businessMenuItems : teacherMenuItems;

  const handleNavigation = (path: string) => {
    navigate(path);
    // Close mobile menu after navigation
    if (window.innerWidth < 1024) {
      setShowMenu(false);
    }
  };

  return (
    <div className="h-full bg-white shadow-lg border-r border-gray-200 flex flex-col">
      {/* Logo + Close button */}
      <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center">
        <img
          src={Logo}
          alt="EduTracker Logo"
          className="w-10 h-10 sm:w-32 lg:w-40 sm:h-12 lg:h-16 object-contain"
        />
        <button
          onClick={() => setShowMenu(false)}
          className="lg:hidden p-2 rounded hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 sm:p-4 overflow-y-auto">
        <ul className="space-y-1 sm:space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-left transition-all duration-200 ${
                    isActive
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="font-medium text-sm sm:text-base truncate">
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
