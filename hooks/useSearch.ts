import { useState, useEffect, useMemo } from 'react';
import { SearchResult, User } from '../types';
import { mockBooks, mockUsers } from '../data/mockData';

const pages: Omit<SearchResult, 'id' | 'priority'>[] = [
    { type: 'page', title: 'Home', route: '/', description: 'Go to the main page' },
    { type: 'page', title: 'Dashboard', route: '/dashboard', description: 'View your personal dashboard' },
    { type: 'page', title: 'Categories', route: '/categories', description: 'Browse books by category' },
    { type: 'page', title: 'Admin Panel', route: '/admin', description: 'Manage library resources' },
    { type: 'feature', title: 'Borrow Books', route: '/', description: 'Find and borrow a new book' },
    { type: 'feature', title: 'Return Books', route: '/dashboard', description: 'Manage your borrowed books' },
];

export interface GroupedSearchResults {
    books: SearchResult[];
    authors: SearchResult[];
    categories: SearchResult[];
    users: SearchResult[];
    pages: SearchResult[];
    features: SearchResult[];
    all: SearchResult[];
}

export const useSearch = (query: string, user: User | null): GroupedSearchResults => {
    const [groupedResults, setGroupedResults] = useState<GroupedSearchResults>({
        books: [], authors: [], categories: [], users: [], pages: [], features: [], all: []
    });

    const allBooks = useMemo(() => mockBooks, []);
    const allUsers = useMemo(() => mockUsers, []);

    useEffect(() => {
        if (!query.trim()) {
            setGroupedResults({ books: [], authors: [], categories: [], users: [], pages: [], features: [], all: [] });
            return;
        }

        const lowerCaseQuery = query.toLowerCase();
        const allResults: SearchResult[] = [];

        // Helper for exact match boost
        const isExact = (str: string) => str.toLowerCase() === lowerCaseQuery;

        // Books
        const bookResults = allBooks
            .filter(book =>
                book.title.toLowerCase().includes(lowerCaseQuery) ||
                book.author.toLowerCase().includes(lowerCaseQuery) ||
                book.isbn.includes(lowerCaseQuery) ||
                book.category.toLowerCase().includes(lowerCaseQuery)
            )
            .map(book => ({
                id: `book-${book.id}`,
                type: 'book' as const,
                title: book.title,
                subtitle: `by ${book.author}`,
                description: book.description,
                route: `/book/${book.id}`,
                data: book,
                priority: isExact(book.title) ? 0 : 1
            }));
        allResults.push(...bookResults);

        // Authors
        const authorResults = [...new Set(allBooks.map(b => b.author))]
            .filter(author => (author as string).toLowerCase().includes(lowerCaseQuery))
            .map(author => ({
                id: `author-${author}`,
                type: 'author' as const,
                title: author as string,
                subtitle: 'Author',
                route: `/categories?author=${encodeURIComponent(author as string)}`,
                priority: isExact(author as string) ? 0 : 2
            }));
        allResults.push(...authorResults);

        // Categories
        const categoryResults = [...new Set(allBooks.map(b => b.category))]
            .filter(category => (category as string).toLowerCase().includes(lowerCaseQuery))
            .map(category => ({
                id: `category-${category}`,
                type: 'category' as const,
                title: category as string,
                subtitle: 'Category',
                route: `/categories?category=${encodeURIComponent(category as string)}`,
                priority: isExact(category as string) ? 0 : 3
            }));
        allResults.push(...categoryResults);

        // Pages & Features
        const pageResults = pages
            .filter(page => page.title.toLowerCase().includes(lowerCaseQuery))
            .filter(page => !(page.title === 'Admin Panel' && user?.role !== 'admin'))
            .map((page, index) => ({
                ...page,
                id: `page-${index}`,
                type: page.type,
                priority: isExact(page.title) ? 0 : (page.type === 'feature' ? 5 : 4)
            }));
        allResults.push(...pageResults);

        // Users (Admin only)
        let userResults: SearchResult[] = [];
        if (user?.role === 'admin') {
            userResults = allUsers
                .filter(u =>
                    u.name.toLowerCase().includes(lowerCaseQuery) ||
                    u.email.toLowerCase().includes(lowerCaseQuery)
                )
                .map(u => ({
                    id: `user-${u.id}`,
                    type: 'user' as const,
                    title: u.name,
                    subtitle: u.email,
                    route: '/admin?tab=users',
                    data: u,
                    priority: isExact(u.name) || isExact(u.email) ? 0 : 2
                }));
            allResults.push(...userResults);
        }

        // Sort by priority, then by type, then by title
        allResults.sort((a, b) => {
            if (a.priority !== b.priority) return a.priority - b.priority;
            if (a.type !== b.type) return String(a.type).localeCompare(String(b.type));
            return a.title.localeCompare(b.title);
        });

        // Group by type
        const grouped: GroupedSearchResults = {
            books: allResults.filter(r => r.type === 'book'),
            authors: allResults.filter(r => r.type === 'author'),
            categories: allResults.filter(r => r.type === 'category'),
            users: allResults.filter(r => r.type === 'user'),
            pages: allResults.filter(r => r.type === 'page'),
            features: allResults.filter(r => r.type === 'feature'),
            all: allResults.slice(0, 15)
        };
        setGroupedResults(grouped);
    }, [query, allBooks, allUsers, user]);

    return groupedResults;
};