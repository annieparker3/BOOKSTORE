import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { User } from '../types';
import { mockUsers } from '../data/mockData';


// Simple rate limiting
const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signup: (name: string, email: string, password: string, role: 'student' | 'teacher' | 'admin') => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isGuest: boolean;
  continueAsGuest: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* eslint-disable react-refresh/only-export-components */
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

      // For consistency, ensure that if a session exists, it's treated as a user session
      const storedSession = localStorage.getItem('mav-library-session');
      if (storedSession) {
        setUser(JSON.parse(storedSession));
        localStorage.setItem('mav-library-user', storedSession);
        localStorage.removeItem('mav-library-session');
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('mav-library-user');
      localStorage.removeItem('mav-library-guest');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      // Check rate limiting
      const now = Date.now();
      const attempt = failedAttempts.get(email) || { count: 0, lastAttempt: 0 };
      
      if (attempt.count >= MAX_ATTEMPTS && (now - attempt.lastAttempt) < LOCKOUT_DURATION) {
        const remainingTime = Math.ceil((LOCKOUT_DURATION - (now - attempt.lastAttempt)) / 60000);
        return { 
          success: false, 
          message: `Too many failed attempts. Please try again in ${remainingTime} minutes.` 
        };
      }

      // In a real app, this would be an API call
      const foundUser = users.find(u => u.email === email);
      if (!foundUser) {
        // Simulate delay to prevent timing attacks
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: false, message: 'Invalid email or password' };
      }

      // In a real app, use proper password hashing with salt and compare with stored hash
      // For this mock, we'll compare directly with a hardcoded password 'password'
      if (password === 'password') {
        // Reset failed attempts on successful login
        failedAttempts.delete(email);
        
        // Create session
        const session = {
          ...foundUser,
          token: `mock-token-${foundUser.id}:${Date.now()}`,
          expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours from now
        };
        
        setUser(session);
        setIsGuest(false);
        localStorage.setItem('mav-library-user', JSON.stringify(session));
        localStorage.removeItem('mav-library-guest');
        
        return { success: true, message: 'Login successful' };
      } else {
        // Increment failed attempts
        const newCount = (attempt.count || 0) + 1;
        failedAttempts.set(email, { count: newCount, lastAttempt: now });
        
        const remainingAttempts = MAX_ATTEMPTS - newCount;
        return { 
          success: false, 
          message: `Invalid email or password. ${remainingAttempts} attempts remaining.` 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: 'An error occurred during login. Please try again later.' 
      };
    }
  };

  const signup = async (name: string, email: string, password: string, role: 'student' | 'teacher' | 'admin'): Promise<{ success: boolean; message: string }> => {
    try {
      // Validate input
      if (!name || !email || !password) {
        return { success: false, message: 'All fields are required' };
      }
      
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        return { success: false, message: 'Please enter a valid email address' };
      }
      
      if (password.length < 8) {
        return { success: false, message: 'Password must be at least 8 characters long' };
      }
      
      // Check if user already exists
      if (users.some(u => u.email === email)) {
        return { success: false, message: 'An account with this email already exists' };
      }
      
      // In a real app, hash the password before sending to the server
      
      // In a real app, this would be an API call
      const now = new Date().toISOString();
      const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        role,
        membershipDate: now.split('T')[0],
        borrowedBooks: [],
        createdAt: now,
        updatedAt: now
      };
      
      setUsers((prev: User[]) => [...prev, newUser]);
      
      // Auto-login after signup
      const session = {
        ...newUser,
        // In a real app, a token would be generated by the server
        token: `mock-token-${Date.now()}`,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours from now
      };
      
      setUser(session);
      setIsGuest(false);
      localStorage.setItem('mav-library-user', JSON.stringify(session));
      localStorage.removeItem('mav-library-guest');
      
      return { success: true, message: 'Account created successfully' };
      
    } catch (error) {
      console.error('Signup error:', error);
      return { 
        success: false, 
        message: 'An error occurred during signup. Please try again later.' 
      };
    }
  };

  const logout = useCallback(() => {
    // In a real app, this would be an API call to invalidate the session
    setUser(null);
    setIsGuest(false);
    
    // Clear all auth-related items from localStorage
    ['mav-library-session', 'mav-library-guest', 'mav-library-user'].forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Clear any service worker caches
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          caches.delete(cacheName);
        });
      });
    }
  }, []);

  const continueAsGuest = (): void => {
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