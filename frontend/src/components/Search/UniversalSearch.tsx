import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2 } from 'lucide-react';
import searchService, { SearchResult } from '../../services/searchService';
import API_BASE_URL from '../../config';

interface UniversalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const UniversalSearch: React.FC<UniversalSearchProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const searchDelayed = setTimeout(() => {
      if (query.length >= 2) {
        performSearch();
      } else {
        setResults([]);
      }
    }, 300); // Debounce

    return () => clearTimeout(searchDelayed);
  }, [query]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const response = await searchService.search(query, undefined, 10);
      setResults(response.results);
      setSelectedIndex(0);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (result: SearchResult) => {
    navigate(result.url);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const getTypeColor = (type: string) => {
    const color = searchService.getColorForType(type);
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-700',
      green: 'bg-green-100 text-green-700',
      purple: 'bg-purple-100 text-purple-700',
      yellow: 'bg-yellow-100 text-yellow-700',
      gray: 'bg-gray-100 text-gray-700',
      indigo: 'bg-indigo-100 text-indigo-700',
      red: 'bg-red-100 text-red-700',
    };
    return colorMap[color] || 'bg-gray-100 text-gray-700';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Search Modal */}
      <div className="flex min-h-screen items-start justify-center p-4 pt-20">
        <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl">
          {/* Search Input */}
          <div className="flex items-center px-4 py-4 border-b border-gray-200">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search for people, tasks, projects, and more..."
              className="flex-1 text-lg outline-none placeholder-gray-400"
            />
            {loading && <Loader2 className="w-5 h-5 text-gray-400 animate-spin mr-3" />}
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {query.length > 0 && query.length < 2 && (
              <div className="p-8 text-center text-gray-500">
                Type at least 2 characters to search
              </div>
            )}

            {query.length >= 2 && !loading && results.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No results found for "{query}"
              </div>
            )}

            {results.length > 0 && (
              <div className="py-2">
                {results.map((result, index) => {
                  const avatarUrl = result.avatar_url
                    ? result.avatar_url.startsWith('http')
                      ? result.avatar_url
                      : `${API_BASE_URL}${result.avatar_url}`
                    : null;

                  return (
                    <div
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleSelect(result)}
                      className={`px-4 py-3 cursor-pointer transition-colors ${
                        index === selectedIndex
                          ? 'bg-primary-50 border-l-4 border-primary'
                          : 'hover:bg-gray-50 border-l-4 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar or Icon */}
                        <div className="flex-shrink-0">
                          {avatarUrl && result.type === 'user' ? (
                            <img
                              src={avatarUrl}
                              alt={result.title}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg">
                              {searchService.getIconForType(result.type)}
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-900 truncate">
                              {result.title}
                            </h3>
                            <span
                              className={`px-2 py-0.5 text-xs font-medium rounded ${getTypeColor(
                                result.type
                              )}`}
                            >
                              {searchService.getLabelForType(result.type)}
                            </span>
                          </div>
                          {result.subtitle && (
                            <p className="text-sm text-gray-600 truncate">
                              {result.subtitle}
                            </p>
                          )}
                          {result.description && (
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              {result.description}
                            </p>
                          )}
                        </div>

                        {/* Keyboard hint */}
                        {index === selectedIndex && (
                          <div className="flex-shrink-0 text-xs text-gray-400">
                            Enter ↵
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-between rounded-b-xl">
            <div className="flex items-center gap-4">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>ESC Close</span>
            </div>
            {results.length > 0 && (
              <span>{results.length} results</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversalSearch;

