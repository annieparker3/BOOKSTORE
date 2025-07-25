import { Book } from '../types';

interface OpenLibraryBook {
  key: string;
  title: string;
  author_name: string[];
  isbn: string[];
  first_sentence: string | string[];
  cover_i: string;
  cover_edition_key: string;
  first_publish_year: number;
}

const GENRE_QUERIES: Record<string, string> = {
  Romance: 'romance',
  Animation: 'animation',
  Adventure: 'adventure',
  Comics: 'comics',
  Articles: 'articles',
  History: 'history',
  Science: 'science',
  Fantasy: 'fantasy',
  Biography: 'biography',
  Fiction: 'fiction',
  Mystery: 'mystery',
  Horror: 'horror',
  Poetry: 'poetry',
  Children: 'children',
  "Science Fiction": 'science_fiction',
};

const normalizeBook = (doc: OpenLibraryBook, genre: string): Book => ({
  id: doc.key ? doc.key.replace('/works/', '') : doc.cover_edition_key || doc.title,
  title: doc.title,
  author: doc.author_name ? doc.author_name[0] : 'Unknown',
  isbn: doc.isbn ? doc.isbn[0] : doc.cover_edition_key || doc.key || doc.title,
  category: genre,
  description: doc.first_sentence ? (Array.isArray(doc.first_sentence) ? doc.first_sentence[0] : doc.first_sentence) : 'No description available.',
  coverImage: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : '',
  isAvailable: true,
  totalCopies: 5,
  availableCopies: 5,
  publishedYear: doc.first_publish_year || 2000,
  rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // Random 3-5
});

export async function fetchBooksByGenres(genres: string[], booksPerGenre = 10): Promise<Book[]> {
  const allBooks: Book[] = [];
  for (const genre of genres) {
    const query = GENRE_QUERIES[genre] || genre.toLowerCase();
    try {
      const res = await fetch(`https://openlibrary.org/search.json?subject=${encodeURIComponent(query)}&limit=${booksPerGenre}`);
      const data = await res.json();
      if (data.docs && Array.isArray(data.docs)) {
        allBooks.push(...data.docs.map((doc: OpenLibraryBook) => normalizeBook(doc, genre)));
      }
    } catch (e) {
      // Ignore errors for individual genres
    }
  }
  return allBooks;
} 