import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { useAuth } from '../context/AuthContext';
import BookCard from '../components/BookCard';
import { TagIcon, StarIcon, MicroscopeIcon, WandSparklesIcon, HeartIcon, BookIcon, BookOpenIcon, UserIcon as BiographyIcon } from '../components/ui/Icons';
import { Book } from '../types';
import GlobalSearch from '../components/GlobalSearch';
import { useSearch } from '../hooks/useSearch';

interface CategoryVisuals {
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    color: string;
    ring: string;
    text: string;
    subtext: string;
}

const categoryVisualsMap: { [key: string]: CategoryVisuals } = {
    'Science': { icon: MicroscopeIcon, color: 'from-green-500 to-green-600', ring: 'ring-green-500/30', text: 'text-white', subtext: 'text-green-100' },
    'Fantasy': { icon: WandSparklesIcon, color: 'from-purple-500 to-purple-600', ring: 'ring-purple-500/30', text: 'text-white', subtext: 'text-purple-100' },
    'Romance': { icon: HeartIcon, color: 'from-pink-500 to-pink-600', ring: 'ring-pink-500/30', text: 'text-white', subtext: 'text-pink-100' },
    'History': { icon: BookOpenIcon, color: 'from-yellow-500 to-yellow-600', ring: 'ring-yellow-500/30', text: 'text-white', subtext: 'text-yellow-100' },
    'Fiction': { icon: BookIcon, color: 'from-blue-500 to-blue-600', ring: 'ring-blue-500/30', text: 'text-white', subtext: 'text-blue-100' },
    'Biography': { icon: BiographyIcon, color: 'from-orange-500 to-orange-600', ring: 'ring-orange-500/30', text: 'text-white', subtext: 'text-orange-100' },
    'Science Fiction': { icon: TagIcon, color: 'from-cyan-500 to-cyan-600', ring: 'ring-cyan-500/30', text: 'text-white', subtext: 'text-cyan-100' },
    'Default': { icon: TagIcon, color: 'from-slate-500 to-slate-600', ring: 'ring-slate-500/30', text: 'text-white', subtext: 'text-slate-100' },
};

interface CategoryStat {
    name: string;
    totalBooks: number;
    available: number;
    avgRating: number;
    mostPopularBook: string;
}

const CategoriesPage: React.FC = () => {
    const { books, borrowBook, isBookBorrowedByUser } = useLibrary();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get('category'));
    const [selectedAuthor, setSelectedAuthor] = useState<string | null>(searchParams.get('author'));
    const [searchQuery, setSearchQuery] = useState('');
    const globalSearchResults = useSearch(searchQuery, user);

    const categoryStats = useMemo(() => {
        const stats: { [key: string]: CategoryStat } = {};
        books.forEach(book => {
            if (!stats[book.category]) {
                stats[book.category] = {
                    name: book.category,
                    totalBooks: 0,
                    available: 0,
                    avgRating: 0,
                    mostPopularBook: '',
                };
            }
            stats[book.category].totalBooks++;
            if (book.isAvailable && book.availableCopies > 0) {
                stats[book.category].available++;
            }
            stats[book.category].avgRating += book.rating;
        });

        // Calculate average rating and find most popular book
        for (const categoryName in stats) {
            stats[categoryName].avgRating /= stats[categoryName].totalBooks;
            const booksInCategory = books.filter(b => b.category === categoryName);
            const mostPopular = booksInCategory ? booksInCategory.sort((a, b) => b.rating - a.rating)[0] : null;
            stats[categoryName].mostPopularBook = mostPopular ? mostPopular.title : '';
        }

        return Object.values(stats);
    }, [books]);

    const searchBookIds = useMemo(() => new Set(globalSearchResults.books.map(b => (b.data as Book)?.id).filter(Boolean) as string[]), [globalSearchResults.books]);
    const filteredBooks = useMemo(() => {
        let filtered = [...books];
        if (searchQuery) {
            filtered = filtered.filter(b => searchBookIds.has(b.id));
        } else if (selectedCategory) {
            filtered = filtered.filter(book => book.category === selectedCategory);
        } else if (selectedAuthor) {
            filtered = filtered.filter(book => book.author === selectedAuthor);
        }
        return filtered;
    }, [books, searchQuery, searchBookIds, selectedCategory, selectedAuthor]);
    
    const handleSelectCategory = (category: string) => {
        setSelectedCategory(category);
        setSelectedAuthor(null);
        setSearchParams({ category });
    };
    

    const handleBreadcrumbClick = () => {
        setSelectedCategory(null);
        setSelectedAuthor(null);
        setSearchParams({});
    };

    const handleBorrow = async (bookId: string) => {
        if (!user) {
            navigate('/auth', { replace: true });
            return;
        }
        await borrowBook(bookId);
    };

    // Smart breadcrumbs
    const breadcrumbs = [
        { label: 'Categories', onClick: handleBreadcrumbClick }
    ];
    if (selectedCategory) breadcrumbs.push({ label: selectedCategory, onClick: () => {} });
    if (selectedAuthor) breadcrumbs.push({ label: selectedAuthor, onClick: () => {} });
    if (searchQuery) breadcrumbs.push({ label: `Search: "${searchQuery}"`, onClick: () => setSearchQuery('') });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8">
                <GlobalSearch />
                <input
                    type="text"
                    className="hidden"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    tabIndex={-1}
                    aria-hidden="true"
                />
            </div>
            <nav className="mb-6 flex items-center gap-2 text-sm text-secondary-600" aria-label="Breadcrumb">
                {breadcrumbs.map((crumb, idx) => (
                    <span key={idx} className="flex items-center">
                        {idx > 0 && <span className="mx-2">/</span>}
                        <button onClick={crumb.onClick} className="hover:underline focus:outline-none">{crumb.label}</button>
                    </span>
                ))}
            </nav>
            <h1 className="text-4xl font-bold text-secondary-900 mb-2">Book Categories</h1>
            <p className="text-lg text-secondary-600 mb-10">Discover new worlds, one category at a time.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categoryStats.map(cat => {
                    const visuals = categoryVisualsMap[cat.name] || categoryVisualsMap['Default'];
                    const isSelected = selectedCategory === cat.name;
                    return (
                        <button
                            key={cat.name}
                            onClick={() => handleSelectCategory(cat.name)}
                            className={`p-6 rounded-xl text-left transition-all duration-300 transform hover:-translate-y-1 ${
                                isSelected ? `bg-gradient-to-br ${visuals.color} ${visuals.text} shadow-xl ring-4 ${visuals.ring}` : 'bg-white text-secondary-800 shadow-md hover:shadow-lg'
                            }`}
                        >
                            <visuals.icon className={`h-8 w-8 mb-4 ${isSelected ? visuals.text : 'text-primary'}`} />
                            <h3 className="text-xl font-bold">{cat.name}</h3>
                            <div className={`mt-3 text-sm space-y-1 ${isSelected ? visuals.subtext : 'text-secondary-600'}`}>
                                <p>{cat.totalBooks} books ({cat.available} available)</p>
                                <div className="flex items-center">
                                    <StarIcon className={`h-4 w-4 mr-1 ${isSelected ? 'text-yellow-300' : 'text-yellow-400'}`} filled />
                                    <span>{cat.avgRating} avg rating</span>
                                </div>
                                <p className="truncate">Popular: {cat.mostPopularBook}</p>
                            </div>
                        </button>
                    )
                })}
            </div>
            {(selectedCategory || selectedAuthor || searchQuery) && (
                <div className="mt-16">
                    <div className="flex justify-between items-center mb-8">
                         <h2 className="text-3xl font-bold text-secondary-900">
                            {searchQuery ? `Search Results` : selectedCategory ? `${selectedCategory} Books` : `${selectedAuthor} Books`}
                         </h2>
                         <button onClick={handleBreadcrumbClick} className="text-sm font-medium text-primary hover:underline">
                            Clear selection
                        </button>
                    </div>
                   
                    {filteredBooks.length > 0 ? (
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {filteredBooks.map(book => (
                                <BookCard key={book.id} book={book} onBorrow={handleBorrow} isBorrowedByUser={isBookBorrowedByUser(book.id)} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-secondary-700">{searchQuery ? 'No books found for your search.' : 'No books found in this category.'}</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default CategoriesPage;