import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch, GroupedSearchResults } from '../hooks/useSearch';
import { useAuth } from '../context/AuthContext';
import { SearchResult } from '../types';
import { SearchIcon, BookIcon, FileTextIcon, UserIcon, TagIcon, XIcon } from './ui/Icons';

const ResultTypeIcon = ({ type }: { type: SearchResult['type'] }) => {
    switch (type) {
        case 'book':
            return <BookIcon className="h-5 w-5 text-secondary-500" />;
        case 'author':
            return <UserIcon className="h-5 w-5 text-secondary-500" />;
        case 'category':
            return <TagIcon className="h-5 w-5 text-secondary-500" />;
        case 'user':
            return <UserIcon className="h-5 w-5 text-secondary-500" />;
        default:
            return <FileTextIcon className="h-5 w-5 text-secondary-500" />;
    }
};

const groupLabels: Record<string, string> = {
    books: 'Books',
    authors: 'Authors',
    categories: 'Categories',
    users: 'Users',
    pages: 'Pages',
    features: 'Features',
};

const groupOrder: (keyof GroupedSearchResults)[] = [
    'books', 'authors', 'categories', 'users', 'pages', 'features'
];

const GlobalSearch: React.FC = () => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();
    const groupedResults = useSearch(query, user);
    const navigate = useNavigate();
    const searchRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(-1);

    // Flattened list for keyboard navigation
    const flatResults = useMemo(() => groupOrder.flatMap(group => groupedResults[group]).slice(0, 15), [groupedResults]);

    const handleNavigation = useCallback((route: string) => {
        setIsOpen(false);
        setQuery('');
        navigate(route);
    }, [navigate]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => (prev + 1) % flatResults.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => (prev - 1 + flatResults.length) % flatResults.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex >= 0 && flatResults[activeIndex]) {
                handleNavigation(flatResults[activeIndex].route);
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
            setActiveIndex(-1);
        }
    }, [activeIndex, flatResults, handleNavigation]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [searchRef]);

    return (
        <div className="relative w-full max-w-xs xl:max-w-md" ref={searchRef}>
            <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-500" />
                <input
                    type="text"
                    placeholder="Search books, authors, categories, users, features..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                        setActiveIndex(-1);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    className="w-full pl-10 pr-10 py-2 border border-secondary-300 rounded-lg bg-secondary-200/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                    aria-label="Global search"
                    aria-autocomplete="list"
                    aria-expanded={isOpen}
                />
                {query && (
                    <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2" aria-label="Clear search">
                        <XIcon className="h-5 w-5 text-secondary-500 hover:text-secondary-700"/>
                    </button>
                )}
            </div>
            {isOpen && query && (
                <div className="absolute z-50 mt-2 w-full bg-white rounded-lg shadow-2xl border border-secondary-200 max-h-96 overflow-y-auto" role="listbox" aria-label="Search results">
                    {flatResults.length > 0 ? (
                        groupOrder.map(group => (
                            groupedResults[group].length > 0 && (
                                <div key={group}>
                                    <div className="px-4 pt-3 pb-1 text-xs font-semibold text-secondary-500 uppercase tracking-wider" role="presentation">{groupLabels[group]}</div>
                                    <ul>
                                        {groupedResults[group].map((result: SearchResult) => {
                                            const flatIdx = flatResults.findIndex(r => r.id === result.id);
                                            return (
                                                <li key={result.id}
                                                    className={`px-4 py-3 cursor-pointer hover:bg-secondary-100 ${flatIdx === activeIndex ? 'bg-secondary-100' : ''}`}
                                                    onMouseDown={e => e.preventDefault()}
                                                    onClick={() => handleNavigation(result.route)}
                                                    onMouseEnter={() => setActiveIndex(flatIdx)}
                                                    role="option"
                                                    aria-selected={flatIdx === activeIndex}
                                                >
                                                    <div className="flex items-start space-x-3">
                                                        <ResultTypeIcon type={result.type} />
                                                        <div>
                                                            <p className="font-semibold text-secondary-800">{result.title}</p>
                                                            {result.subtitle && <p className="text-sm text-secondary-600">{result.subtitle}</p>}
                                                        </div>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )
                        ))
                    ) : (
                        <div className="p-4 text-center text-secondary-600">
                            <div>No results found for "{query}"</div>
                            <div className="mt-2 text-xs text-secondary-400">Try searching for a book title, author, category, user, or feature.</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GlobalSearch;