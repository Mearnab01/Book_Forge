import { Book, BookOpen, Copy } from 'lucide-react';
import type { Book as BookType } from '@/types';
import { cn } from '@/lib/utils';

interface BookCardProps {
  book: BookType;
  onView?: (book: BookType) => void;
  onEdit?: (book: BookType) => void;
  onViewCopies?: (book: BookType) => void;
  showActions?: boolean;
}

export function BookCard({ book, onView, onViewCopies, showActions = true }: BookCardProps) {
  const isAvailable = book.availableCopies > 0;

  return (
    <div className="group relative overflow-hidden rounded-2xl border-2 border-gray-800 bg-linear-to-br from-gray-900 to-gray-800 transition-all duration-500 hover:scale-[1.03] hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-900/20">
      {/* Glow effect */}
      <div className="absolute -inset-0.5 bg-linear-to-r from-blue-500 to-purple-500 opacity-0 blur transition-opacity duration-500 group-hover:opacity-20"></div>
      
      {/* Book Cover */}
      <div className="relative aspect-3/4 overflow-hidden rounded-t-xl bg-linear-to-br from-blue-900/20 to-purple-900/20">
        {book.coverImage ? (
          <img 
            src={book.coverImage} 
            alt={book.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-6">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-purple-500 rounded-full opacity-20 blur-xl"></div>
              <BookOpen className="relative h-16 w-16 text-blue-300" />
            </div>
            <p className="text-center text-sm text-gray-400">No cover image</p>
          </div>
        )}
        
        {/* Availability Badge */}
        <div className={cn(
          "absolute right-3 top-3 rounded-full px-3 py-1.5 text-xs font-bold shadow-lg",
          isAvailable 
            ? "bg-emerald-900/80 text-emerald-300 border border-emerald-700/50 backdrop-blur-sm" 
            : "bg-red-900/80 text-red-300 border border-red-700/50 backdrop-blur-sm"
        )}>
          {isAvailable ? `${book.availableCopies} Available` : 'Unavailable'}
        </div>
      </div>

      <div className="p-5">
        {/* Category */}
        <span className="inline-block rounded-full bg-blue-900/40 px-3 py-1 text-xs font-medium text-blue-300 border border-blue-700/50 mb-3">
          {book.category}
        </span>

        {/* Title & Author */}
        <h3 className="font-serif text-xl font-bold text-white line-clamp-2 mb-2">
          {book.title}
        </h3>
        <div className="flex items-center gap-2 text-gray-400 mb-4">
          <span className="text-sm">by</span>
          <p className="text-sm text-gray-300 font-medium">{book.author}</p>
        </div>

        {/* ISBN & Year */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-gray-400">
              <Copy className="h-3.5 w-3.5" />
              <span className="font-mono text-gray-300">{book.isbn}</span>
            </div>
          </div>
          <span className="rounded-full bg-gray-800/50 px-3 py-1 text-xs text-gray-400">
            {book.publishedYear}
          </span>
        </div>
      </div>

      {showActions && (
        <div className="flex gap-3 border-t border-gray-800/50 bg-gray-900/50 p-4">
          <button 
            onClick={() => onView?.(book)}
            className="group/btn flex-1 rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-sm font-medium text-gray-300 transition-all duration-300 hover:bg-linear-to-r hover:from-blue-900/30 hover:to-transparent hover:border-blue-500 hover:text-white"
          >
            <div className="flex items-center justify-center gap-2">
              <Book className="h-4 w-4 group-hover/btn:text-blue-400" />
              <span>View Details</span>
            </div>
          </button>
          <button 
            onClick={() => onViewCopies?.(book)}
            className="rounded-lg border border-gray-700 bg-gray-800/50 p-2.5 text-gray-400 transition-all duration-300 hover:border-purple-500 hover:bg-linear-to-r hover:from-purple-900/30 hover:to-transparent hover:text-white"
            title="View Copies"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}