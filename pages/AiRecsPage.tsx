import React, { useState } from 'react';

import { useLibrary } from '../context/LibraryContext';
import { useAuth } from '../context/AuthContext';
import BookCard from '../components/BookCard';
import { WandSparklesIcon } from '../components/ui/Icons';
import { Book } from '../types';
import { useNavigate } from 'react-router-dom';



interface Recommendation {
    book: Book;
    reason: string;
}

const AiRecsPage: React.FC = () => {
    const { books, borrowBook, isBookBorrowedByUser } = useLibrary();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

    const handleGetRecommendations = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError('');
        setRecommendations([]);

        try {
            // Mock AI recommendation for demonstration purposes
            // In a real application, this would involve an actual API call to an AI service.
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call delay

            const mockRecommendedTitles = [
                { title: 'The Cosmic Web', reason: 'This book offers a fascinating journey through the universe, perfect for those curious about science.' },
                { title: 'Echoes of Eternity', reason: 'For a gripping fantasy epic with deep lore and intense battles, this is an excellent choice.' },
                { title: 'Sapiens: A Brief History of Humankind', reason: 'A thought-provoking read that re-examines human history and our place in the world.' },
                { title: 'Dune', reason: 'A classic science fiction masterpiece with intricate world-building and political intrigue.' },
            ];

            const finalRecs = mockRecommendedTitles.map(rec => {
                const book = books.find(b => b.title.toLowerCase() === rec.title.toLowerCase());
                return book ? { book, reason: rec.reason } : null;
            }).filter((item): item is Recommendation => item !== null);
            
            if(finalRecs.length === 0){
                setError("I couldn't find any matching books in our collection for that request. Please try a different query!");
            }

            setRecommendations(finalRecs);

        } catch (err) {
            console.error("Error getting recommendations:", err);
            setError("Sorry, something went wrong while getting your recommendations. Please try again later.");
        } finally {
            setLoading(false);
        }
    };
    
     const handleBorrow = async (bookId: string) => {
        if (!user) {
            navigate('/auth', { replace: true });
            return;
        }
        await borrowBook(bookId);
    };

    const suggestionPrompts = [
        { title: 'Based on my mood', prompt: "I'm in the mood for something... " },
        { title: 'Find books like...', prompt: "Find me books similar to... " },
        { title: 'Surprise me!', prompt: "Recommend a hidden gem or a classic I might have missed." },
    ]

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
                 <WandSparklesIcon className="mx-auto h-12 w-12 text-primary" />
                <h1 className="text-4xl font-bold text-secondary-900 mt-4">AI Book Recommender</h1>
                <p className="mt-2 text-lg text-secondary-600">Discover your next favorite book with a little help from our AI librarian.</p>
            </div>

            <div className="max-w-2xl mx-auto mt-10">
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <form onSubmit={handleGetRecommendations}>
                        <label htmlFor="ai-query" className="block text-sm font-medium text-secondary-700 mb-2">
                           What are you looking for? (e.g., "a fast-paced sci-fi adventure" or "a cozy romance novel")
                        </label>
                        <textarea
                            id="ai-query"
                            rows={4}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Tell me what you'd like to read..."
                            className="w-full p-3 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300 transition"
                        />
                        <div className="flex flex-wrap gap-2 mt-3">
                            {suggestionPrompts.map(p => (
                                <button key={p.title} type="button" onClick={() => setQuery(p.prompt)} className="px-3 py-1 text-xs font-medium bg-secondary-100 text-secondary-700 rounded-full hover:bg-secondary-200 transition">
                                    {p.title}
                                </button>
                            ))}
                        </div>
                         <button
                            type="submit"
                            disabled={loading || !query.trim()}
                            className="w-full mt-4 flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary/50 disabled:cursor-not-allowed transition"
                        >
                            {loading ? (
                                <>
                                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                 Thinking...
                                </>
                            ) : (
                                <>
                                 <WandSparklesIcon className="h-5 w-5"/>
                                 Get Recommendations
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            <div className="mt-12">
                {error && <div className="text-center p-4 bg-red-100 text-red-700 rounded-lg max-w-2xl mx-auto">{error}</div>}
                
                {recommendations.length > 0 && (
                     <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-secondary-900">Here are some ideas for you...</h2>
                    </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {recommendations.map(({ book, reason }) => (
                        <BookCard
                            key={book.id}
                            book={book}
                            recommendationReason={reason}
                            onBorrow={handleBorrow}
                            isBorrowedByUser={isBookBorrowedByUser(book.id)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AiRecsPage;