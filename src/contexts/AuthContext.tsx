import React, { createContext, useContext, useState, useEffect } from "react";
import { apiService, User as ApiUser } from "../services/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: "business" | "faculty";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Try to get current user details (cookie will be sent automatically)
    apiService.getCurrentUser()
      .then(response => {
        if (response.success) {
          const apiUser = response.data;
          const user: User = {
            id: apiUser._id,
            name: `${apiUser.firstName} ${apiUser.lastName}`,
            email: apiUser.email,
            role: apiUser.role === "faculty" ? "faculty" : "business"
          };
          setUser(user);
          setIsAuthenticated(true);
        }
      })
      .catch(() => {
        // User not authenticated or token expired
        console.log("User not authenticated");
      });
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiService.login({ email, password });

      if (response.success && response.token) {
        // Get user details
        const userResponse = await apiService.getCurrentUser();
        if (userResponse.success) {
          const apiUser = userResponse.data;
          const user: User = {
            id: apiUser._id,
            name: `${apiUser.firstName} ${apiUser.lastName}`,
            email: apiUser.email,
            role: apiUser.role === "faculty" ? "faculty" : "business"
          };
          setUser(user);
          setIsAuthenticated(true);
          return true;
        }
      }
    } catch (error) {
      console.error("Login failed:", error);
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    // You might want to call a logout API endpoint here to clear the cookie on the server
    // For now, we'll just clear the user state
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
