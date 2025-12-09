import { useState } from 'react';
import { Plus, Filter, Grid, List, Search } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { BookCard } from '@/components/books/BookCard';
import { SearchBar } from '@/components/ui/searchbar';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { mockBooks } from '@/data/MockData';

const categories = ['All', 'Fiction', 'Non-Fiction', 'Science Fiction', 'Self-Help', 'Philosophy', 'History'];

export default function Books() {
  const { hasRole } = useAuth();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const canManageBooks = hasRole(['ADMIN', 'LIBRARIAN']);

  const filteredBooks = mockBooks.filter(book => {
    const matchesSearch = 
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase()) ||
      book.isbn.includes(search);
    const matchesCategory = category === 'All' || book.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <MainLayout title="Books Catalog">
      <div className="animate-fade-in space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Books Catalog</h1>
            <p className="text-gray-400">
              Browse and manage the library's book collection
            </p>
          </div>
          {canManageBooks && (
            <Button className="bg-linear-to-r from-blue-600 to-purple-600 text-white font-medium shadow-lg hover:from-blue-700 hover:to-purple-700 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Plus className="mr-2 h-4 w-4" />
              Add New Book
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by title, author, or ISBN..."
            />
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 z-10" />
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-48 pl-10 bg-gray-800/50 border-gray-700 text-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700 text-white">
                  {categories.map((cat) => (
                    <SelectItem 
                      key={cat} 
                      value={cat}
                      className="focus:bg-gray-800 focus:text-white"
                    >
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex rounded-lg border border-gray-800 bg-gray-900/50 p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="icon"
                className={`h-9 w-9 rounded-md transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-linear-to-r from-blue-500 to-purple-500 text-white shadow-md' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="icon"
                className={`h-9 w-9 rounded-md transition-all ${
                  viewMode === 'list' 
                    ? 'bg-linear-to-r from-blue-500 to-purple-500 text-white shadow-md' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Showing <span className="font-bold text-white">{filteredBooks.length}</span> of <span className="font-bold text-white">{mockBooks.length}</span> books
          </p>
          <div className="flex gap-2">
            <span className="text-xs text-gray-500 bg-gray-800/50 px-3 py-1 rounded-full">
              {category === 'All' ? 'All Categories' : category}
            </span>
            {search && (
              <span className="text-xs text-blue-400 bg-blue-900/30 px-3 py-1 rounded-full">
                Search: "{search}"
              </span>
            )}
          </div>
        </div>

        {/* Books Grid */}
        <div className={`${viewMode === 'grid' ? 'card-grid' : 'space-y-3'}`}>
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              showActions={true}
            />
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border-2 border-dashed border-gray-800 bg-gray-900/30">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-purple-500 rounded-full opacity-20 blur-xl"></div>
              <Search className="relative h-16 w-16 text-gray-600 mx-auto" />
            </div>
            <p className="text-xl font-bold text-white mb-2">No books found</p>
            <p className="text-gray-400 max-w-md">
              Try adjusting your search or filter criteria to find what you're looking for
            </p>
          </div>
        )}

      </div>
    </MainLayout>
  );
}