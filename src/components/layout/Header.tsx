import React from "react";
import { Bell, Settings, LogOut, Menu } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface HeaderProps {
  showMenu: boolean;
  setShowMenu: (tab: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ setShowMenu, showMenu }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded hover:bg-gray-100 transition-colors"
            onClick={() => setShowMenu(!showMenu)}
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
          </button>

          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
              Welcome back, {user?.name}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 capitalize hidden sm:block">
              {user?.role} Dashboard
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Notifications */}
          {/* <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button> */}

          {/* Settings - Hidden on mobile */}
          {/* <button className="hidden sm:block p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Settings className="w-6 h-6" />
          </button> */}

          {/* User Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* <img
              src={user?.avatar || `https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?w=150`}
              alt={user?.name}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
            /> */}
            {/* <span className="text-sm font-medium text-gray-700 hidden sm:inline-block truncate max-w-24">
              {user?.name}
            </span> */}
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
