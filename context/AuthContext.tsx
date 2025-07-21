import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { mockUsers } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, role: 'student' | 'teacher' | 'admin') => Promise<boolean>;
  logout: () => void;
  isGuest: boolean;
  continueAsGuest: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>(mockUsers);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('mav-library-user');
      const storedGuest = localStorage.getItem('mav-library-guest');
      
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else if (storedGuest) {
        setIsGuest(JSON.parse(storedGuest));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('mav-library-user');
      localStorage.removeItem('mav-library-guest');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // In a real app, password would be hashed. Here we just simulate.
    const foundUser = users.find(u => u.email === email);
    if (foundUser) {
      // Dummy password check
      if (password === 'password') {
        setUser(foundUser);
        setIsGuest(false);
        localStorage.setItem('mav-library-user', JSON.stringify(foundUser));
        localStorage.removeItem('mav-library-guest');
        return true;
      }
    }
    return false;
  };

  const signup = async (name: string, email: string, password: string, role: 'student' | 'teacher' | 'admin'): Promise<boolean> => {
    if (users.some(u => u.email === email)) {
      return false; // User already exists
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      membershipDate: new Date().toISOString().split('T')[0],
    };
    setUsers(prev => [...prev, newUser]);
    setUser(newUser);
    setIsGuest(false);
    localStorage.setItem('mav-library-user', JSON.stringify(newUser));
    localStorage.removeItem('mav-library-guest');
    return true;
  };

  const logout = () => {
    setUser(null);
    setIsGuest(false);
    localStorage.removeItem('mav-library-user');
    localStorage.removeItem('mav-library-guest');
  };

  const continueAsGuest = () => {
    setUser(null);
    setIsGuest(true);
    localStorage.setItem('mav-library-guest', 'true');
    localStorage.removeItem('mav-library-user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isGuest, continueAsGuest, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};