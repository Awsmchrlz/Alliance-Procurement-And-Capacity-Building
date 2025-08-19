import { useState, useEffect } from "react";
import { User } from "@shared/schema";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth-token");
    const userData = localStorage.getItem("user-data");
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        localStorage.removeItem("auth-token");
        localStorage.removeItem("user-data");
      }
    }
    setLoading(false);
  }, []);

  const login = (userData: User, token: string) => {
    localStorage.setItem("auth-token", token);
    localStorage.setItem("user-data", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("auth-token");
    localStorage.removeItem("user-data");
    setUser(null);
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  };
}
