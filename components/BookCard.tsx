import React from 'react';
import { Book } from '../types';
import { StarIcon } from './ui/Icons';
import { Link } from 'react-router-dom';

interface BookCardProps {
    book: Book;
    onBorrow?: (bookId: string) => void;
    onReturn?: (borrowedBookId: string) => void;
    onRenew?: (borrowedBookId: string) => void;
    borrowedBookId?: string;
    dueDate?: string;
    isOverdue?: boolean;
    isAdmin?: boolean;
    onEdit?: (book: Book) => void;
    onDelete?: (bookId: string) => void;
    isBorrowedByUser?: boolean;
    showActions?: boolean;
    renewalCount?: number;
    recommendationReason?: string;
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
            <StarIcon
                key={i}
                className={`h-5 w-5 ${rating > i ? 'text-yellow-400' : 'text-secondary-300'}`}
                filled={rating > i}
            />
        ))}
        <span className="ml-2 text-sm text-secondary-600">{rating.toFixed(1)}</span>
    </div>
);


const BookCard: React.FC<BookCardProps> = ({
    book,
    onBorrow,
    onReturn,
    onRenew,
    borrowedBookId,
    dueDate,
    isOverdue,
    isAdmin,
    onEdit,
    onDelete,
    isBorrowedByUser,
    showActions = true,
    renewalCount,
    recommendationReason,
}) => {
    const isBookAvailableForBorrowing = book.availableCopies > 0 && book.isAvailable;
    const canRenew = onRenew && typeof renewalCount !== 'undefined' && renewalCount < 2;

    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group transform hover:-translate-y-0.5">
            <div className="relative">
                 <Link to={`/book/${book.id}`} className="block">
                    <img className="h-48 w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105" src={book.coverImage} alt={`Cover of ${book.title}`} />
                 </Link>
                 <div className="absolute top-2 left-2">
                      <span className="px-2 py-1 bg-primary-600/90 text-white text-xs font-bold rounded-full backdrop-blur-sm">{book.category}</span>
                 </div>
                 <div className="absolute top-2 right-2">
                     {book.isAvailable && book.availableCopies > 0 ? (
                        <span className="px-2 py-1 bg-success/90 text-white text-xs font-bold rounded-full backdrop-blur-sm">Available</span>
                     ) : (
                        <span className="px-2 py-1 bg-error/90 text-white text-xs font-bold rounded-full backdrop-blur-sm">Unavailable</span>
                     )}
                 </div>
            </div>
            <div className="p-4 flex flex-col flex-grow">
                 {recommendationReason && (
                    <div className="mb-3 p-2.5 bg-primary-50 border-l-4 border-primary-300 rounded-r-md">
                        <p className="text-xs text-primary-800 italic leading-snug">
                            <span className="font-semibold">AI Rec:</span> "{recommendationReason}"
                        </p>
                    </div>
                )}
                <Link to={`/book/${book.id}`} className="block">
                    <h3 className="text-md font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors line-clamp-2 h-[48px] leading-tight">{book.title}</h3>
                </Link>
                <p className="mt-1 text-sm text-secondary-600">by {book.author}</p>
                <div className="mt-2">
                    <StarRating rating={book.rating} />
                </div>
                 <p className="mt-2 text-xs text-secondary-500 line-clamp-2 h-[32px]">
                    {book.description}
                </p>
                
                {dueDate && (
                     <div className={`mt-2 p-2 rounded-md text-sm ${isOverdue ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        <p className="font-semibold">Due: {new Date(dueDate).toLocaleDateString()}</p>
                        {isOverdue && <p>This book is overdue!</p>}
                    </div>
                )}
                
                <div className="mt-auto pt-3">
                    {showActions && (
                        <>
                        {isAdmin && onEdit && onDelete ? (
                            <div className="flex space-x-2">
                                <button onClick={() => onEdit(book)} className="w-full text-sm font-semibold py-2 px-4 rounded-lg bg-secondary-200 hover:bg-secondary-300 text-secondary-800 transition">Edit</button>
                                <button onClick={() => onDelete(book.id)} className="w-full text-sm font-semibold py-2 px-4 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 transition">Delete</button>
                            </div>
                        ) : borrowedBookId && onReturn && onRenew ? (
                             <div className="flex flex-col space-y-2">
                                <button onClick={() => onReturn(borrowedBookId)} className="w-full text-sm font-semibold py-2 px-4 rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition">Return Book</button>
                                <button 
                                    onClick={() => onRenew(borrowedBookId)} 
                                    disabled={!canRenew}
                                    className="w-full text-sm font-semibold py-2 px-4 rounded-lg bg-secondary-200 hover:bg-secondary-300 text-secondary-800 transition disabled:bg-secondary-200/50 disabled:cursor-not-allowed"
                                >
                                    {canRenew ? `Renew (${2 - (renewalCount || 0)} left)` : 'No Renewals Left'}
                                </button>
                            </div>
                        ) : onBorrow ? (
                            <button
                                onClick={() => onBorrow(book.id)}
                                disabled={!isBookAvailableForBorrowing || isBorrowedByUser}
                                className="w-full text-sm font-semibold py-2 px-4 rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition disabled:bg-secondary-300 disabled:cursor-not-allowed"
                            >
                                {isBorrowedByUser ? 'Already Borrowed' : (isBookAvailableForBorrowing ? 'Borrow' : 'Unavailable')}
                            </button>
                        ) : null}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookCard;