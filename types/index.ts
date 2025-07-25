export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  description: string;
  coverImage: string;
  isAvailable: boolean;
  totalCopies: number;
  availableCopies: number;
  publishedYear: number;
  rating: number; // 0-5 scale
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  membershipDate: string;
  borrowHistory?: BorrowedBook[];
  borrowedBooks?: string[];
  token?: string;
  expiresAt?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BorrowedBook {
  id: string;
  bookId: string;
  userId: string;
  book: Book;
  borrowDate: string;
  dueDate: string;
  isOverdue: boolean;
  renewalCount: number; // max 2 renewals
  returnDate?: string;
}

export interface SearchResult {
  id: string;
  type: 'book' | 'author' | 'category' | 'user' | 'page' | 'feature';
  title: string;
  subtitle?: string;
  description?: string;
  route: string;
  data?: unknown;
  priority: number;
}
