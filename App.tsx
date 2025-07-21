import React, { ReactNode, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LibraryProvider } from './context/LibraryContext';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import CategoriesPage from './pages/CategoriesPage';
import BookDetailPage from './pages/BookDetailPage';
import AdminPage from './pages/AdminPage';
import AiRecsPage from './pages/AiRecsPage';

const NotFoundPage: React.FC = () => (
    <div className="text-center py-20">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold mt-4 text-secondary-800">Page Not Found</h2>
        <p className="mt-2 text-secondary-600">The page you are looking for does not exist.</p>
    </div>
);

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center h-[calc(100vh-128px)]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
    </div>
);


const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !user) {
            navigate('/auth', { replace: true });
        }
    }, [user, loading, navigate]);

    if (loading) return <LoadingSpinner />;

    return user ? children : null;
};

const AdminRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (loading) return;

        if (!user) {
            navigate('/auth', { replace: true });
        } else if (user.role !== 'admin') {
            navigate('/dashboard', { replace: true });
        }
    }, [user, loading, navigate]);

    if (loading) return <LoadingSpinner />;
    
    return user && user.role === 'admin' ? children : null;
};

const AppRoutes: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-grow">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/categories" element={<CategoriesPage />} />
                    <Route path="/book/:id" element={<BookDetailPage />} />
                    
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />
                     <Route path="/ai-recs" element={
                        <ProtectedRoute>
                            <AiRecsPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin" element={
                        <AdminRoute>
                            <AdminPage />
                        </AdminRoute>
                    } />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </main>
            <footer className="bg-secondary-900 text-secondary-300 py-6">
                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
                    <p>&copy; {new Date().getFullYear()} MAV LIBRARY. All rights reserved.</p>
                    <p className="mt-1">A demonstration of a modern library management system.</p>
                </div>
            </footer>
        </div>
    );
};

const App: React.FC = () => {
  const { user, isGuest, loading } = useAuth();

  if (loading) {
    return <div className="w-full text-center py-16 text-secondary-600 text-lg">Loading...</div>;
  }

  // If not authenticated and not guest, force to /auth
  const isAuthenticated = !!user || isGuest;

  return (
    <HashRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        {!isAuthenticated && <Route path="*" element={<Navigate to="/auth" replace />} />}
        {isAuthenticated && (
          <>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/book/:id" element={<BookDetailPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/ai-recs" element={<AiRecsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </HashRouter>
  );
};

export default App;