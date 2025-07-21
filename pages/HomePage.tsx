import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import BookCard from '../components/BookCard';
import SearchBar from '../components/SearchBar';
import GlobalSearch from '../components/GlobalSearch';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { useSearch } from '../hooks/useSearch';

const HomePage: React.FC = () => {
    const { books, users, borrowBook, isBookBorrowedByUser } = useLibrary();
    const [filters, setFilters] = useState({ query: '', category: 'all', availability: 'all', sort: 'rating' });
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const globalSearchResults = useSearch(searchQuery, user);

    const featuredBooks = useMemo(() => books.slice().sort((a,b) => b.rating - a.rating).slice(0, 4), [books]);
    
    const totalBooks = useMemo(() => books.length, [books]);
    const activeMembers = useMemo(() => users.length, [users]);

    // If search is active, show only books from global search results
    const searchBookIds = new Set(globalSearchResults.books.map(b => b.data?.id));
    const filteredAndSortedBooks = useMemo(() => {
        let filtered = [...books];
        if (searchQuery) {
            filtered = filtered.filter(b => searchBookIds.has(b.id));
        } else {
            // Filter by availability
            if (filters.availability === 'available') {
                filtered = filtered.filter(b => b.isAvailable && b.availableCopies > 0);
            } else if (filters.availability === 'unavailable') {
                filtered = filtered.filter(b => !b.isAvailable || b.availableCopies === 0);
            }
            // Filter by category
            if (filters.category !== 'all') {
                filtered = filtered.filter(b => b.category === filters.category);
            }
            // Filter by search query (legacy local search)
            if (filters.query) {
                const q = filters.query.toLowerCase();
                filtered = filtered.filter(b =>
                    b.title.toLowerCase().includes(q) ||
                    b.author.toLowerCase().includes(q) ||
                    b.isbn.includes(q)
                );
            }
        }
        // Sort
        switch (filters.sort) {
            case 'rating':
                filtered.sort((a, b) => b.rating - a.rating);
                break;
            case 'title_asc':
                filtered.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'title_desc':
                filtered.sort((a, b) => b.title.localeCompare(a.title));
                break;
            case 'year_new':
                filtered.sort((a, b) => b.publishedYear - a.publishedYear);
                break;
            case 'year_old':
                filtered.sort((a, b) => a.publishedYear - b.publishedYear).reverse();
                break;
        }
        return filtered;
    }, [books, filters, searchQuery, searchBookIds]);
    
    const handleBorrow = async (bookId: string) => {
        if (!user) {
            navigate('/auth', { replace: true });
            return;
        }
        const success = await borrowBook(bookId);
        if (success) {
            // Maybe show a success toast in a real app
            console.log("Book borrowed successfully");
        } else {
            // Maybe show an error toast
            console.error("Failed to borrow book");
        }
    };

    return (
        <div className="space-y-16 pb-16">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-primary to-primary-darker text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">Welcome to MAV LIBRARY</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-blue-100">Your gateway to a universe of knowledge and stories. Discover, borrow, and read.</p>
                     <div className="mt-8 flex justify-center gap-4">
                        <button onClick={() => document.getElementById('all-books')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-3 bg-white text-primary font-semibold rounded-lg shadow-md hover:bg-secondary-200 transition">
                            Browse Books
                        </button>
                        {!user && 
                            <Link to="/auth" className="px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-primary transition">
                                Join Now
                            </Link>
                        }
                    </div>
                </div>
            </section>
            
            {/* Statistics */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-40 md:-mt-32 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h3 className="text-4xl font-bold text-primary">{totalBooks}+</h3>
                        <p className="mt-1 text-secondary-600">Total Books</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h3 className="text-4xl font-bold text-primary">{activeMembers}+</h3>
                        <p className="mt-1 text-secondary-600">Active Members</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h3 className="text-4xl font-bold text-primary">{[...new Set(books.map(b => b.category))].length}+</h3>
                        <p className="mt-1 text-secondary-600">Genres & Categories</p>
                    </div>
                </div>
            </section>

            {/* Featured Books */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-secondary-900 mb-8">Featured Books</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {featuredBooks.map(book => (
                        <BookCard 
                            key={book.id} 
                            book={book} 
                            onBorrow={handleBorrow}
                            isBorrowedByUser={isBookBorrowedByUser(book.id)}
                        />
                    ))}
                </div>
            </section>

            {/* All Books */}
            <section id="all-books" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                 <h2 className="text-3xl font-bold text-secondary-900 mb-8">Explore Our Collection</h2>
                <div className="mb-8">
                    <GlobalSearch />
                    <input
                        type="text"
                        className="hidden" // Hide legacy SearchBar input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        tabIndex={-1}
                        aria-hidden="true"
                    />
                </div>
                {searchQuery && (
                    <div className="mb-4 text-secondary-700 text-sm">
                        Showing results for <span className="font-semibold">"{searchQuery}"</span> ({filteredAndSortedBooks.length} books found)
                    </div>
                )}
                {!searchQuery && <SearchBar onSearchChange={setFilters} />}
                {filteredAndSortedBooks.length > 0 ? (
                    <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {filteredAndSortedBooks.map(book => (
                            <BookCard 
                                key={book.id} 
                                book={book} 
                                onBorrow={handleBorrow} 
                                isBorrowedByUser={isBookBorrowedByUser(book.id)}
                             />
                        ))}
                    </div>
                ) : (
                     <div className="mt-12 text-center py-16 bg-white rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold text-secondary-800">{searchQuery ? 'No books found for your search.' : 'No books found'}</h3>
                        <p className="text-secondary-600 mt-2">{searchQuery ? 'Try a different search term or check your spelling.' : 'Try adjusting your filters or search query.'}</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default HomePage;