import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { Book, User, BorrowedBook } from '../types';
import BookCard from '../components/BookCard';
import BookFormModal from '../components/BookFormModal';
import { BookIcon, UsersIcon, CalendarIcon, AlertTriangleIcon } from '../components/ui/Icons';
import GlobalSearch from '../components/GlobalSearch';
import { useSearch } from '../hooks/useSearch';
import { useSearchParams } from 'react-router-dom';


type AdminTab = 'books' | 'users' | 'borrowed';

const StatCard: React.FC<{ title: string, value: string | number, icon: React.ReactNode, color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-white p-4 rounded-lg shadow-md flex items-center gap-4 transition-all hover:shadow-lg hover:-translate-y-px">
        <div className={`p-3 rounded-lg ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-secondary-600">{title}</p>
            <p className="text-2xl font-bold text-secondary-900">{value}</p>
        </div>
    </div>
);

const AdminPage: React.FC = () => {
    const { user } = useAuth();
    const { books, users, borrowedBooks, addBook, updateBook, deleteBook } = useLibrary();
    
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTab = (searchParams.get('tab') as AdminTab) || 'books';
    const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBook, setEditingBook] = useState<Book | null>(null);
    const [globalSearchQuery, setGlobalSearchQuery] = useState('');
    const globalSearchResults = useSearch(globalSearchQuery, user);

    const stats = useMemo(() => ({
        totalBooks: books.length,
        totalUsers: users.length,
        totalBorrowed: borrowedBooks.length,
        totalOverdue: borrowedBooks.filter(b => b.isOverdue).length,
    }), [books, users, borrowedBooks]);

    // Tab-specific global search filtering
    const searchBookIds = new Set(globalSearchResults.books.map(b => b.data?.id));
    const searchUserIds = new Set(globalSearchResults.users.map(u => u.data?.id));
    const filteredBooks = useMemo(() => {
        if (globalSearchQuery) {
            return books.filter(b => searchBookIds.has(b.id));
        }
        return books.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()) || b.author.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [books, searchTerm, globalSearchQuery, searchBookIds]);

    const filteredUsers = useMemo(() => {
        if (globalSearchQuery) {
            return users.filter(u => searchUserIds.has(u.id));
        }
        return users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [users, searchTerm, globalSearchQuery, searchUserIds]);

    const filteredBorrowed = useMemo(() => {
        if (globalSearchQuery) {
            return borrowedBooks.filter(b => searchBookIds.has(b.book.id) || searchUserIds.has(b.userId));
        }
        return borrowedBooks.filter(b => b.book.title.toLowerCase().includes(searchTerm.toLowerCase()) || users.find(u => u.id === b.userId)?.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [borrowedBooks, searchTerm, users, globalSearchQuery, searchBookIds, searchUserIds]);

    if (user?.role !== 'admin') {
        return <div className="text-center p-8 text-error">Access Denied. Admin privileges required.</div>;
    }
    
    const handleOpenAddModal = () => {
        setEditingBook(null);
        setIsModalOpen(true);
    }
    
    const handleOpenEditModal = (book: Book) => {
        setEditingBook(book);
        setIsModalOpen(true);
    };

    const handleDeleteBook = (bookId: string) => {
        if(window.confirm("Are you sure you want to delete this book? This action cannot be undone.")) {
            deleteBook(bookId);
        }
    };

    const handleFormSubmit = (data: Book | Omit<Book, 'id' | 'isAvailable' | 'availableCopies'>) => {
        if ('id' in data) {
            updateBook(data as Book);
        } else {
            addBook(data as Omit<Book, 'id' | 'isAvailable' | 'availableCopies'>);
        }
    }

    const renderBooksTab = () => (
        filteredBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredBooks.map(book => (
                    <BookCard
                        key={book.id}
                        book={book}
                        isAdmin={true}
                        onEdit={handleOpenEditModal}
                        onDelete={handleDeleteBook}
                    />
                ))}
            </div>
        ) : (
            <div className="text-center text-secondary-700 py-8">{globalSearchQuery ? 'No books found for your search.' : 'No books found.'}</div>
        )
    );

    const renderUsersTab = () => (
        filteredUsers.length > 0 ? (
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left text-secondary-600">
                    <thead className="text-xs text-secondary-700 uppercase bg-secondary-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Name</th>
                            <th scope="col" className="px-6 py-3">Email</th>
                            <th scope="col" className="px-6 py-3">Role</th>
                            <th scope="col" className="px-6 py-3">Member Since</th>
                            <th scope="col" className="px-6 py-3">Books Read</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(u => (
                            <tr key={u.id} className="border-b hover:bg-secondary-50">
                                <td className="px-6 py-4 font-medium text-secondary-900 whitespace-nowrap">{u.name}</td>
                                <td className="px-6 py-4">{u.email}</td>
                                <td className="px-6 py-4 capitalize">{u.role}</td>
                                <td className="px-6 py-4">{new Date(u.membershipDate).toLocaleDateString()}</td>
                                <td className="px-6 py-4">{u.borrowHistory?.length || 0}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ) : (
            <div className="text-center text-secondary-700 py-8">{globalSearchQuery ? 'No users found for your search.' : 'No users found.'}</div>
        )
    );

    const renderBorrowedTab = () => (
        filteredBorrowed.length > 0 ? (
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left text-secondary-600">
                    <thead className="text-xs text-secondary-700 uppercase bg-secondary-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Book Title</th>
                            <th scope="col" className="px-6 py-3">User</th>
                            <th scope="col" className="px-6 py-3">Due Date</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBorrowed.map(b => {
                            const borrower = users.find(u => u.id === b.userId);
                            return (
                                <tr key={b.id} className="border-b hover:bg-secondary-50">
                                    <td className="px-6 py-4 font-medium text-secondary-900 whitespace-nowrap">{b.book.title}</td>
                                    <td className="px-6 py-4">{borrower?.name || 'Unknown User'}</td>
                                    <td className="px-6 py-4">{new Date(b.dueDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${b.isOverdue ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                            {b.isOverdue ? 'Overdue' : 'Active'}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        ) : (
            <div className="text-center text-secondary-700 py-8">{globalSearchQuery ? 'No borrowed books found for your search.' : 'No borrowed books found.'}</div>
        )
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8">
                <GlobalSearch />
                <input
                    type="text"
                    className="hidden"
                    value={globalSearchQuery}
                    onChange={e => setGlobalSearchQuery(e.target.value)}
                    tabIndex={-1}
                    aria-hidden="true"
                />
            </div>
            <h1 className="text-4xl font-bold text-secondary-900 mb-8">Admin Dashboard</h1>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard title="Total Books" value={stats.totalBooks} icon={<BookIcon className="h-6 w-6 text-white"/>} color="bg-primary-500" />
                <StatCard title="Active Users" value={stats.totalUsers} icon={<UsersIcon className="h-6 w-6 text-white"/>} color="bg-info" />
                <StatCard title="Borrowed Books" value={stats.totalBorrowed} icon={<CalendarIcon className="h-6 w-6 text-white"/>} color="bg-warning" />
                <StatCard title="Overdue Books" value={stats.totalOverdue} icon={<AlertTriangleIcon className="h-6 w-6 text-white"/>} color="bg-error" />
            </div>
            
            <div className="mb-8">
                <div className="border-b border-secondary-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button onClick={() => {setActiveTab('books'); setSearchTerm(''); setGlobalSearchQuery(''); setSearchParams({ tab: 'books' });}} className={`${activeTab === 'books' ? 'border-primary-500 text-primary-600' : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Books</button>
                        <button onClick={() => {setActiveTab('users'); setSearchTerm(''); setGlobalSearchQuery(''); setSearchParams({ tab: 'users' });}} className={`${activeTab === 'users' ? 'border-primary-500 text-primary-600' : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Users</button>
                        <button onClick={() => {setActiveTab('borrowed'); setSearchTerm(''); setGlobalSearchQuery(''); setSearchParams({ tab: 'borrowed' });}} className={`${activeTab === 'borrowed' ? 'border-primary-500 text-primary-600' : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Borrowed Books</button>
                    </nav>
                </div>
            </div>

            <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                 {!globalSearchQuery && (
                     <input
                        type="text"
                        placeholder={`Search in ${activeTab}...`}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full md:w-auto md:max-w-sm px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
                    />
                 )}
                {activeTab === 'books' && (
                     <button onClick={handleOpenAddModal} className="w-full md:w-auto px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition">
                        Add New Book
                    </button>
                )}
            </div>

            <div>
                {activeTab === 'books' && renderBooksTab()}
                {activeTab === 'users' && renderUsersTab()}
                {activeTab === 'borrowed' && renderBorrowedTab()}
            </div>
            <BookFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={editingBook}
            />
        </div>
    );
};

export default AdminPage;