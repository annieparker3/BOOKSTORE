import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import BookCard from '../components/BookCard';
import { useNavigate, Link } from 'react-router-dom';
import { SearchIcon, TagIcon, BookIcon, CalendarIcon, AlertTriangleIcon, CheckCircleIcon } from '../components/ui/Icons';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const { books, users, borrowedBooks, returnBook, renewBook, borrowBook, isBookBorrowedByUser } = useLibrary();
    const navigate = useNavigate();

    const currentUserData = useMemo(() => users.find(u => u.id === user?.id), [users, user]);

    const userBorrowedBooks = useMemo(() => {
        if (!user) return [];
        return borrowedBooks.filter(b => b.userId === user.id);
    }, [user, borrowedBooks]);
    
    const stats = useMemo(() => {
        const now = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(now.getDate() + 7);

        return {
            borrowed: userBorrowedBooks.length,
            dueThisWeek: userBorrowedBooks.filter(b => new Date(b.dueDate) <= nextWeek && new Date(b.dueDate) >= now).length,
            overdue: userBorrowedBooks.filter(b => b.isOverdue).length,
            read: currentUserData?.borrowHistory?.length || 0,
        };
    }, [userBorrowedBooks, currentUserData]);
    
    const handleReturn = async (borrowedBookId: string) => {
        await returnBook(borrowedBookId);
    };
    
    const handleRenew = async (borrowedBookId: string) => {
        const success = await renewBook(borrowedBookId);
        if(!success) {
            alert("Could not renew this book. Maximum renewals reached.");
        }
    };
    
    const handleBorrow = async (bookId: string) => {
        await borrowBook(bookId);
    }

    if (!user) {
        // This should be handled by a protected route, but as a fallback:
        return (
            <div className="text-center p-8">
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p>Please log in to view your dashboard.</p>
                <Link to="/auth" className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded">Login</Link>
            </div>
        );
    }
    
    const recommendedBooks = books
        .filter(b => !userBorrowedBooks.some(bb => bb.bookId === b.id) && b.isAvailable)
        .sort((a,b) => b.rating - a.rating)
        .slice(0, 4);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Welcome Header */}
            <div className="bg-white p-6 rounded-xl shadow-md mb-8">
                <h1 className="text-3xl font-bold text-secondary-900">Welcome back, {user.name.split(' ')[0]}!</h1>
                <p className="text-secondary-600 mt-1">Here's your library summary.</p>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                <div className="bg-white p-4 rounded-lg shadow-md flex items-center gap-4 transition-all hover:shadow-lg hover:-translate-y-px">
                    <div className="p-3 rounded-lg bg-primary-500">
                        <BookIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-secondary-600">Books Borrowed</p>
                        <p className="text-2xl font-bold text-secondary-900">{stats.borrowed}</p>
                    </div>
                </div>
                 <div className="bg-white p-4 rounded-lg shadow-md flex items-center gap-4 transition-all hover:shadow-lg hover:-translate-y-px">
                    <div className="p-3 rounded-lg bg-warning">
                        <CalendarIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-secondary-600">Due This Week</p>
                        <p className="text-2xl font-bold text-secondary-900">{stats.dueThisWeek}</p>
                    </div>
                </div>
                 <div className="bg-white p-4 rounded-lg shadow-md flex items-center gap-4 transition-all hover:shadow-lg hover:-translate-y-px">
                    <div className="p-3 rounded-lg bg-error">
                        <AlertTriangleIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-secondary-600">Overdue</p>
                        <p className="text-2xl font-bold text-secondary-900">{stats.overdue}</p>
                    </div>
                </div>
                 <div className="bg-white p-4 rounded-lg shadow-md flex items-center gap-4 transition-all hover:shadow-lg hover:-translate-y-px">
                    <div className="p-3 rounded-lg bg-success">
                        <CheckCircleIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-secondary-600">Total Books Read</p>
                        <p className="text-2xl font-bold text-secondary-900">{stats.read}</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <section className="mb-12">
                <h2 className="text-2xl font-bold text-secondary-900 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <button onClick={() => navigate('/')} className="flex items-center justify-center gap-3 p-6 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                        <SearchIcon className="h-8 w-8" />
                        <span className="text-xl font-semibold">Browse & Search Books</span>
                    </button>
                    <button onClick={() => navigate('/categories')} className="flex items-center justify-center gap-3 p-6 bg-gradient-to-br from-success to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                        <TagIcon className="h-8 w-8" />
                        <span className="text-xl font-semibold">Explore Categories</span>
                    </button>
                </div>
            </section>
            
            {/* My Borrowed Books */}
            <section>
                <h2 className="text-2xl font-bold text-secondary-900 mb-6">My Borrowed Books</h2>
                {userBorrowedBooks.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {userBorrowedBooks.map(borrowed => (
                            <BookCard
                                key={borrowed.id}
                                book={borrowed.book}
                                onReturn={() => handleReturn(borrowed.id)}
                                onRenew={() => handleRenew(borrowed.id)}
                                borrowedBookId={borrowed.id}
                                dueDate={borrowed.dueDate}
                                isOverdue={borrowed.isOverdue}
                                renewalCount={borrowed.renewalCount}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                        <h3 className="text-xl font-semibold text-secondary-800">You haven't borrowed any books yet.</h3>
                        <p className="text-secondary-600 mt-2">Time to explore the library!</p>
                        <button onClick={() => navigate('/')} className="mt-6 px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition">Browse Books</button>
                    </div>
                )}
            </section>
            
            {/* Recommended Books */}
            <section className="mt-16">
                <h2 className="text-2xl font-bold text-secondary-900 mb-6">Recommended For You</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {recommendedBooks.map(book => (
                        <BookCard 
                            key={book.id} 
                            book={book} 
                            onBorrow={handleBorrow} 
                            isBorrowedByUser={isBookBorrowedByUser(book.id)}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Dashboard;