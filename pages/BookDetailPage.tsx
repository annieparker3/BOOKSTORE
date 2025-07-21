import React, { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import BookCard from '../components/BookCard';
import { StarIcon } from '../components/ui/Icons';
import { useAuth } from '../context/AuthContext';


const NotFound = () => (
    <div className="text-center py-20">
        <h1 className="text-4xl font-bold">404 - Book Not Found</h1>
        <p className="mt-4 text-lg">We couldn't find the book you were looking for.</p>
        <Link to="/" className="mt-8 inline-block px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition">
            Back to Home
        </Link>
    </div>
);

const BookDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { books, borrowBook, isBookBorrowedByUser } = useLibrary();
    
    const book = useMemo(() => books.find(b => b.id === id), [id, books]);
    
    const relatedBooks = useMemo(() => {
        if (!book) return [];
        return books
            .filter(b => b.category === book.category && b.id !== book.id)
            .sort((a,b) => b.rating - a.rating)
            .slice(0, 4);
    }, [book, books]);

    const handleBorrow = async (bookId: string) => {
        if (!user) {
            navigate('/auth', { replace: true });
            return;
        }
        await borrowBook(bookId);
    };

    if (!book) {
        return <NotFound />;
    }
    
    const isBookAvailable = book.isAvailable && book.availableCopies > 0;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column: Cover & Actions */}
                <div className="lg:col-span-1">
                    <img src={book.coverImage} alt={`Cover of ${book.title}`} className="w-full rounded-xl shadow-2xl aspect-[2/3] object-cover" />
                    <button 
                        onClick={() => handleBorrow(book.id)}
                        disabled={!isBookAvailable || isBookBorrowedByUser(book.id)}
                        className="mt-6 w-full py-4 text-lg font-bold text-white bg-primary rounded-lg hover:bg-primary-dark transition disabled:bg-secondary-400 disabled:cursor-not-allowed"
                    >
                        {isBookBorrowedByUser(book.id) ? 'Already Borrowed' : (isBookAvailable ? 'Borrow This Book' : 'Currently Unavailable')}
                    </button>
                    <div className="mt-4 text-center text-sm text-secondary-600">
                        {book.availableCopies} of {book.totalCopies} copies available
                    </div>
                </div>

                {/* Right Column: Details */}
                <div className="lg:col-span-2">
                    <p className="text-sm font-semibold uppercase tracking-wider text-primary">{book.category}</p>
                    <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 mt-2">{book.title}</h1>
                    <p className="text-xl text-secondary-600 mt-2">by <span className="font-medium text-secondary-800">{book.author}</span></p>
                    
                    <div className="flex items-center mt-4">
                        {[...Array(5)].map((_, i) => (
                            <StarIcon key={i} className={`h-6 w-6 ${book.rating > i ? 'text-yellow-400' : 'text-secondary-300'}`} filled={book.rating > i} />
                        ))}
                        <span className="ml-3 text-lg text-secondary-600">{book.rating.toFixed(1)}/5.0</span>
                    </div>

                    <div className="mt-8 prose prose-lg max-w-none text-secondary-700">
                        <p>{book.description}</p>
                    </div>

                    <div className="mt-10 pt-8 border-t border-secondary-200">
                        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Book Details</h3>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-secondary-700">
                            <div><strong className="font-medium text-secondary-800">Published:</strong> {book.publishedYear}</div>
                            <div><strong className="font-medium text-secondary-800">ISBN:</strong> {book.isbn}</div>
                            <div><strong className="font-medium text-secondary-800">Total Copies:</strong> {book.totalCopies}</div>
                            <div><strong className="font-medium text-secondary-800">Available:</strong> {book.availableCopies}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Books */}
            {relatedBooks.length > 0 && (
                <div className="mt-20">
                    <h2 className="text-3xl font-bold text-secondary-900 mb-8">Related Books in {book.category}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {relatedBooks.map(relatedBook => (
                            <BookCard 
                                key={relatedBook.id}
                                book={relatedBook}
                                onBorrow={() => handleBorrow(relatedBook.id)}
                                isBorrowedByUser={isBookBorrowedByUser(relatedBook.id)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookDetailPage;