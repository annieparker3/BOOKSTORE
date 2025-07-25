import React, { useState, useEffect } from 'react';
import { Book } from '../types';
import { XIcon } from './ui/Icons';
import { mockBooks } from '../data/mockData';

type BookFormData = Omit<Book, 'id' | 'isAvailable' | 'availableCopies'>;

interface BookFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Book | BookFormData) => void;
    initialData?: Book | null;
}

const categories = [...new Set(mockBooks.map(book => book.category))];

const getInitialFormData = (initialData?: Book | null): Book | BookFormData => {
    if (initialData) {
        return initialData;
    }
    return {
        title: '',
        author: '',
        isbn: '',
        category: categories[0] || '',
        description: '',
        coverImage: 'https://picsum.photos/seed/newbook/400/600',
        totalCopies: 1,
        publishedYear: new Date().getFullYear(),
        rating: 0,
    };
};

const BookFormModal: React.FC<BookFormModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState<Book | BookFormData>(getInitialFormData(initialData));

    useEffect(() => {
        setFormData(getInitialFormData(initialData));
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isNumber = type === 'number' || name === 'publishedYear' || name === 'totalCopies' || name === 'rating';
        setFormData({ ...formData, [name]: isNumber ? Number(value) : value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };
    
    const inputClasses = "w-full p-3 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500";

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b sticky top-0 bg-white z-10">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-secondary-900">{initialData ? 'Edit Book' : 'Add New Book'}</h2>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary-100">
                            <XIcon className="h-6 w-6 text-secondary-600" />
                        </button>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Title */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-secondary-700 mb-1">Title</label>
                            <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required className={inputClasses} />
                        </div>
                        {/* Author */}
                        <div>
                            <label htmlFor="author" className="block text-sm font-medium text-secondary-700 mb-1">Author</label>
                            <input type="text" name="author" id="author" value={formData.author} onChange={handleChange} required className={inputClasses} />
                        </div>
                        {/* ISBN */}
                        <div>
                            <label htmlFor="isbn" className="block text-sm font-medium text-secondary-700 mb-1">ISBN</label>
                            <input type="text" name="isbn" id="isbn" value={formData.isbn} onChange={handleChange} required className={inputClasses} />
                        </div>
                        {/* Category */}
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-secondary-700 mb-1">Category</label>
                            <select name="category" id="category" value={formData.category} onChange={handleChange} className={inputClasses}>
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        {/* Description */}
                        <div className="md:col-span-2">
                            <label htmlFor="description" className="block text-sm font-medium text-secondary-700 mb-1">Description</label>
                            <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={4} required className={inputClasses}></textarea>
                        </div>
                        {/* Cover Image URL */}
                        <div className="md:col-span-2">
                            <label htmlFor="coverImage" className="block text-sm font-medium text-secondary-700 mb-1">Cover Image URL</label>
                            <input type="text" name="coverImage" id="coverImage" value={formData.coverImage} onChange={handleChange} required className={inputClasses} />
                        </div>
                        {/* Published Year */}
                        <div>
                            <label htmlFor="publishedYear" className="block text-sm font-medium text-secondary-700 mb-1">Published Year</label>
                            <input type="number" name="publishedYear" id="publishedYear" value={formData.publishedYear} onChange={handleChange} required className={inputClasses} />
                        </div>
                        {/* Total Copies */}
                        <div>
                            <label htmlFor="totalCopies" className="block text-sm font-medium text-secondary-700 mb-1">Total Copies</label>
                            <input type="number" name="totalCopies" id="totalCopies" value={formData.totalCopies} onChange={handleChange} required min="0" className={inputClasses} />
                        </div>
                        {/* Rating */}
                        <div>
                            <label htmlFor="rating" className="block text-sm font-medium text-secondary-700 mb-1">Rating (0-5)</label>
                            <input type="number" name="rating" id="rating" value={formData.rating} onChange={handleChange} required min="0" max="5" step="0.1" className={inputClasses} />
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 text-sm font-semibold text-secondary-700 bg-secondary-100 rounded-lg hover:bg-secondary-200 transition">Cancel</button>
                        <button type="submit" className="px-6 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition">Save Book</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookFormModal;