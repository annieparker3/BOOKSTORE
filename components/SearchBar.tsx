import React, { useState } from 'react';
import { SearchIcon, FilterIcon, ChevronDownIcon, XIcon } from './ui/Icons';
import { mockBooks } from '../data/mockData';

interface SearchBarProps {
    onSearchChange: (filters: { query: string; category: string; availability: string; sort: string }) => void;
}

const categories = [...new Set(mockBooks.map(book => book.category))];

const SearchBar: React.FC<SearchBarProps> = ({ onSearchChange }) => {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('all');
    const [availability, setAvailability] = useState('all');
    const [sort, setSort] = useState('rating');
    const [showFilters, setShowFilters] = useState(false);
    
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        onSearchChange({ query, category, availability, sort });
    };

    const clearFilters = () => {
        setQuery('');
        setCategory('all');
        setAvailability('all');
        setSort('rating');
        onSearchChange({ query: '', category: 'all', availability: 'all', sort: 'rating' });
    }

    const hasActiveFilters = query || category !== 'all' || availability !== 'all' || sort !== 'rating';

    return (
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg sticky top-24 z-30">
            <form onSubmit={handleSearch}>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-grow">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-500 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search by title, author, or ISBN..."
                            className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-3 rounded-lg border border-secondary-300 bg-white hover:bg-secondary-100 transition">
                            <FilterIcon className="h-5 w-5 text-secondary-600" />
                            <span className="font-medium">Filters</span>
                            <ChevronDownIcon className={`h-5 w-5 text-secondary-600 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        </button>
                        <button type="submit" className="px-6 py-3 font-semibold text-white bg-primary rounded-lg hover:bg-primary-dark transition">
                            Search
                        </button>
                    </div>
                </div>
            </form>
            {showFilters && (
                <div className="mt-4 pt-4 border-t border-secondary-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Category Filter */}
                        <div className="relative">
                            <label className="text-sm font-medium text-secondary-700 mb-1 block">Category</label>
                            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 border border-secondary-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary">
                                <option value="all">All Categories</option>
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                            <ChevronDownIcon className="absolute right-3 top-9 h-5 w-5 text-secondary-500 pointer-events-none" />
                        </div>

                        {/* Availability Filter */}
                        <div className="relative">
                            <label className="text-sm font-medium text-secondary-700 mb-1 block">Availability</label>
                            <select value={availability} onChange={e => setAvailability(e.target.value)} className="w-full p-2 border border-secondary-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary">
                                <option value="all">All</option>
                                <option value="available">Available</option>
                                <option value="unavailable">Unavailable</option>
                            </select>
                           <ChevronDownIcon className="absolute right-3 top-9 h-5 w-5 text-secondary-500 pointer-events-none" />
                        </div>

                        {/* Sort By Filter */}
                        <div className="relative">
                            <label className="text-sm font-medium text-secondary-700 mb-1 block">Sort By</label>
                            <select value={sort} onChange={e => setSort(e.target.value)} className="w-full p-2 border border-secondary-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary">
                                <option value="rating">Rating</option>
                                <option value="title_asc">Title (A-Z)</option>
                                <option value="title_desc">Title (Z-A)</option>
                                <option value="year_new">Newest First</option>
                                <option value="year_old">Oldest First</option>
                            </select>
                           <ChevronDownIcon className="absolute right-3 top-9 h-5 w-5 text-secondary-500 pointer-events-none" />
                        </div>
                    </div>
                    {hasActiveFilters &&
                        <div className="mt-4 flex justify-end">
                            <button onClick={clearFilters} className="flex items-center gap-2 text-sm text-secondary-600 hover:text-error transition">
                                <XIcon className="h-4 w-4" />
                                Clear All Filters
                            </button>
                        </div>
                    }
                </div>
            )}
        </div>
    );
};

export default SearchBar;