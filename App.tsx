import { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navigation from './components/Navigation';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'));
const BookDetailPage = lazy(() => import('./pages/BookDetailPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const AiRecsPage = lazy(() => import('./pages/AiRecsPage'));

const NotFoundPage: React.FC = () => (
    <div className="text-center py-20">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold mt-4 text-secondary-800">Page Not Found</h2>
        <p className="mt-2 text-secondary-600">The page you are looking for does not exist.</p>
    </div>
);

// Loading component with better accessibility
const LoadingSpinner: React.FC<{ fullScreen?: boolean }> = ({ fullScreen = true }) => (
    <div 
        className={`flex justify-center items-center ${fullScreen ? 'h-[calc(100vh-128px)]' : 'py-16'}`}
        role="status"
        aria-live="polite"
        aria-busy="true"
    >
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600" aria-hidden="true">
            <span className="sr-only">Loading...</span>
        </div>
    </div>
);


// Removed ProtectedRoute and AdminRoute in favor of inline route protection

const App = () => {
  const { user, isGuest, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  const isAuthenticated = !!user || isGuest;
  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen flex flex-col">
      <HashRouter>
        <Navigation />
        <main className="flex-grow">
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Public routes */}
                <Route path="/auth" element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />} />
                
                {/* Protected routes */}
                <Route path="/" element={
                  isAuthenticated ? <HomePage /> : <Navigate to="/auth" replace />
                } />
                
                <Route path="/dashboard" element={
                  isAuthenticated ? <Dashboard /> : <Navigate to="/auth" replace />
                } />
                
                <Route path="/categories" element={
                  isAuthenticated ? <CategoriesPage /> : <Navigate to="/auth" replace />
                } />
                
                <Route path="/book/:id" element={
                  isAuthenticated ? <BookDetailPage /> : <Navigate to="/auth" replace />
                } />
                
                <Route path="/ai-recs" element={
                  isAuthenticated ? <AiRecsPage /> : <Navigate to="/auth" replace />
                } />
                
                {/* Admin-only routes */}
                <Route path="/admin" element={
                  isAdmin ? <AdminPage /> : <Navigate to="/" replace />
                } />
                
                {/* 404 handling */}
                <Route path="/404" element={<NotFoundPage />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>
        
        <footer className="bg-secondary-900 text-secondary-300 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} MAV LIBRARY. All rights reserved.</p>
            <p className="mt-1">A demonstration of a modern library management system.</p>
          </div>
        </footer>
      </HashRouter>
    </div>
  );
};

export default App;