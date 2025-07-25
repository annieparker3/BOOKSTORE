import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Book, User, BorrowedBook } from '../types';
import { mockBooks, mockUsers, mockBorrowedBooks } from '../data/mockData';
import { useAuth } from './AuthContext';
import { fetchBooksByGenres } from '../data/fetchBooks';

interface LibraryContextType {
  books: Book[];
  users: User[];
  borrowedBooks: BorrowedBook[];
  borrowBook: (bookId: string) => Promise<boolean>;
  returnBook: (borrowedBookId: string) => Promise<boolean>;
  renewBook: (borrowedBookId: string) => Promise<boolean>;
  addBook: (book: Omit<Book, 'id' | 'isAvailable' | 'availableCopies'>) => Promise<boolean>;
  updateBook: (updatedBook: Book) => Promise<boolean>;
  deleteBook: (bookId: string) => Promise<boolean>;
  isBookBorrowedByUser: (bookId: string) => boolean;
  loadingBooks: boolean;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

/* eslint-disable react-refresh/only-export-components */
export const LibraryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>(mockBorrowedBooks);
  const [loadingBooks, setLoadingBooks] = useState(true);

  useEffect(() => {
    // Periodically check for overdue books
    const interval = setInterval(() => {
        const today = new Date();
        setBorrowedBooks(prev => prev.map(bb => ({
            ...bb,
            isOverdue: new Date(bb.dueDate) < today,
        })));
    }, 1000 * 60 * 60); // check every hour
    return () => clearInterval(interval);
  }, []);

  // Fetch books from Open Library on first load
  useEffect(() => {
    let mounted = true;
    async function loadBooks() {
      setLoadingBooks(true);
      try {
        const genres = [
          'Romance', 'Animation', 'Adventure', 'Comics', 'Articles', 'History',
          'Science', 'Fantasy', 'Biography', 'Fiction', 'Mystery', 'Horror',
          'Poetry', 'Children', 'Science Fiction'
        ];
        const fetched = await fetchBooksByGenres(genres, 10);
        if (mounted && fetched.length > 0) {
          setBooks(fetched);
        } else if (mounted) {
          setBooks(mockBooks);
        }
      } catch {
        if (mounted) setBooks(mockBooks);
      } finally {
        if (mounted) setLoadingBooks(false);
      }
    }
    loadBooks();
    return () => { mounted = false; };
  }, []);

  const isBookBorrowedByUser = (bookId: string): boolean => {
      if (!user) return false;
      return borrowedBooks.some(bb => bb.userId === user.id && bb.bookId === bookId);
  }

  const borrowBook = async (bookId: string): Promise<boolean> => {
    if (!user) return false;

    const book = books.find(b => b.id === bookId);
    if (!book || book.availableCopies <= 0) return false;

    // Update book copies
    setBooks(prev => prev.map(b => 
      b.id === bookId ? { ...b, availableCopies: b.availableCopies - 1, isAvailable: b.availableCopies - 1 > 0 } : b
    ));

    // Add to borrowed books
    const today = new Date();
    const newBorrow: BorrowedBook = {
        id: `borrow-${Date.now()}`,
        bookId,
        userId: user.id,
        book: book,
        borrowDate: today.toISOString().split('T')[0],
        dueDate: addDays(today, 14).toISOString().split('T')[0],
        isOverdue: false,
        renewalCount: 0,
    };
    setBorrowedBooks(prev => [...prev, newBorrow]);

    return true;
  };

  const returnBook = async (borrowedBookId: string): Promise<boolean> => {
    const borrowed = borrowedBooks.find(b => b.id === borrowedBookId);
    if (!borrowed) return false;

    // Update book copies
    setBooks(prev => prev.map(b => 
      b.id === borrowed.bookId ? { ...b, availableCopies: b.availableCopies + 1, isAvailable: true } : b
    ));

    // Update user history
    setUsers(prev => prev.map(u => {
      if (u.id === borrowed.userId) {
        const history = u.borrowHistory || [];
        return { ...u, borrowHistory: [...history, { ...borrowed, returnDate: new Date().toISOString().split('T')[0] }] };
      }
      return u;
    }));

    // Remove from active borrows
    setBorrowedBooks(prev => prev.filter(b => b.id !== borrowedBookId));

    return true;
  };

  const renewBook = async (borrowedBookId: string): Promise<boolean> => {
     const borrowed = borrowedBooks.find(b => b.id === borrowedBookId);
     if (!borrowed || borrowed.renewalCount >= 2) return false;

     setBorrowedBooks(prev => prev.map(b => {
         if (b.id === borrowedBookId) {
             const newDueDate = addDays(new Date(b.dueDate), 14);
             return {
                 ...b,
                 dueDate: newDueDate.toISOString().split('T')[0],
                 renewalCount: b.renewalCount + 1,
                 isOverdue: newDueDate < new Date(),
             };
         }
         return b;
     }));

     return true;
  };

  const addBook = async (newBookData: Omit<Book, 'id' | 'isAvailable' | 'availableCopies'>) : Promise<boolean> => {
      const newBook: Book = {
          ...newBookData,
          id: `book-${Date.now()}`,
          isAvailable: newBookData.totalCopies > 0,
          availableCopies: newBookData.totalCopies,
      }
      setBooks(prev => [newBook, ...prev]);
      return true;
  }
  
  const updateBook = async (updatedBook: Book): Promise<boolean> => {
      setBooks(prev => prev.map(b => b.id === updatedBook.id ? updatedBook : b));
      // Also update book info in borrowed list
      setBorrowedBooks(prev => prev.map(bb => bb.bookId === updatedBook.id ? {...bb, book: updatedBook } : bb));
      return true;
  }
  
  const deleteBook = async (bookId: string): Promise<boolean> => {
      // Prevent deletion if book is currently borrowed
      if(borrowedBooks.some(bb => bb.bookId === bookId)) {
          alert("Cannot delete book that is currently borrowed by a user.");
          return false;
      }
      setBooks(prev => prev.filter(b => b.id !== bookId));
      return true;
  }


  return (
    <LibraryContext.Provider value={{ books, users, borrowedBooks, borrowBook, returnBook, renewBook, addBook, updateBook, deleteBook, isBookBorrowedByUser, loadingBooks }}>
      {loadingBooks ? <div className="w-full text-center py-16 text-secondary-600 text-lg">Loading books from the internet...</div> : children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (context === undefined) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};
