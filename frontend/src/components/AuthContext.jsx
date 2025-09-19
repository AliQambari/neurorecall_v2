import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [logged, setLogged] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch login status once on mount
  useEffect(() => {
    const fetchAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/check-login'); // Absolute path
        if (response.ok) {
          const data = await response.json();
          setLogged(data.logged === "true");
        } else {
          console.error('Failed to fetch login status');
        }
      } catch (error) {
        console.error('Error fetching auth status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuthStatus();
  }, []);

  // Fetch admin status once on mount
  useEffect(() => {
    const fetchAdminStatus = async () => {
      try {
        const response = await fetch('/api/auth/check-admin'); // Absolute path
        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.isAdmin === "true");
        } else {
          console.error('Failed to fetch admin status');
        }
      } catch (error) {
        console.error('Error fetching admin status:', error);
      }
    };

    fetchAdminStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ logged, setLogged, isAdmin, setIsAdmin, isLoading, setIsLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
