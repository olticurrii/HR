import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, User, CheckSquare, FolderOpen, Building2, MessageCircle, FileText, ArrowRight } from 'lucide-react';
import searchService, { SearchResult } from '../../services/searchService';
import API_BASE_URL from '../../config';
import TRAXCIS_COLORS from '../../theme/traxcis';

interface UniversalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const UniversalSearch: React.FC<UniversalSearchProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isDark, setIsDark] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Dark mode detection
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    
    return () => observer.disconnect();
  }, []);

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

  const getTypeIcon = (type: string) => {
    const iconMap: Record<string, any> = {
      user: User,
      task: CheckSquare,
      project: FolderOpen,
      feedback: MessageCircle,
      department: Building2,
      chat: MessageCircle,
      document: FileText,
    };
    return iconMap[type] || FileText;
  };

  const getTypeColor = (type: string) => {
    const colorMap: Record<string, { bg: string; text: string; icon: string }> = {
      user: {
        bg: isDark ? 'rgba(37, 99, 235, 0.15)' : '#EFF6FF',
        text: isDark ? '#93C5FD' : '#1E40AF',
        icon: TRAXCIS_COLORS.primary.DEFAULT,
      },
      task: {
        bg: isDark ? 'rgba(16, 185, 129, 0.15)' : '#D1FAE5',
        text: isDark ? '#6EE7B7' : '#065F46',
        icon: TRAXCIS_COLORS.status.success,
      },
      project: {
        bg: isDark ? 'rgba(168, 85, 247, 0.15)' : '#F3E8FF',
        text: isDark ? '#C084FC' : '#6B21A8',
        icon: '#A855F7',
      },
      feedback: {
        bg: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7',
        text: isDark ? '#FCD34D' : '#92400E',
        icon: TRAXCIS_COLORS.status.warning,
      },
      department: {
        bg: isDark ? 'rgba(107, 114, 128, 0.15)' : '#F3F4F6',
        text: isDark ? '#D1D5DB' : '#4B5563',
        icon: TRAXCIS_COLORS.secondary[500],
      },
      chat: {
        bg: isDark ? 'rgba(99, 102, 241, 0.15)' : '#E0E7FF',
        text: isDark ? '#A5B4FC' : '#3730A3',
        icon: '#6366F1',
      },
    };
    return colorMap[type] || colorMap.user;
  };

  const getLabelForType = (type: string): string => {
    const labelMap: Record<string, string> = {
      user: 'Person',
      task: 'Task',
      project: 'Project',
      feedback: 'Feedback',
      department: 'Department',
      chat: 'Chat',
      document: 'Document',
    };
    return labelMap[type] || type;
  };

  // Theme colors
  const cardBg = isDark ? TRAXCIS_COLORS.secondary[900] : '#FFFFFF';
  const cardBorder = isDark ? TRAXCIS_COLORS.secondary[700] : TRAXCIS_COLORS.secondary[200];
  const textColor = isDark ? TRAXCIS_COLORS.secondary[100] : TRAXCIS_COLORS.secondary.DEFAULT;
  const subTextColor = isDark ? TRAXCIS_COLORS.secondary[400] : TRAXCIS_COLORS.secondary[500];
  const inputBg = isDark ? TRAXCIS_COLORS.secondary[800] : TRAXCIS_COLORS.secondary[50];
  const hoverBg = isDark ? TRAXCIS_COLORS.secondary[800] : TRAXCIS_COLORS.secondary[50];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 transition-opacity"
          style={{ backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)' }}
          onClick={onClose}
        />

        {/* Search Modal */}
        <div className="flex min-h-screen items-start justify-center p-4 pt-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
            style={{
              backgroundColor: cardBg,
              border: `1px solid ${cardBorder}`,
            }}
          >
            {/* Search Input */}
            <div 
              className="flex items-center px-6 py-4 border-b"
              style={{ 
                borderColor: cardBorder,
                backgroundColor: inputBg,
              }}
            >
              <Search className="w-5 h-5 mr-3" style={{ color: TRAXCIS_COLORS.primary.DEFAULT }} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search for people, tasks, projects, and more..."
                style={{ 
                  backgroundColor: 'transparent',
                  color: textColor,
                }}
                className="flex-1 text-base outline-none placeholder-gray-400 dark:placeholder-gray-500 font-medium"
              />
              {loading && (
                <Loader2 className="w-5 h-5 animate-spin mr-3" style={{ color: TRAXCIS_COLORS.primary.DEFAULT }} />
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                style={{ color: subTextColor }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[500px] overflow-y-auto">
              {query.length > 0 && query.length < 2 && (
                <div className="p-12 text-center">
                  <Search className="w-12 h-12 mx-auto mb-4" style={{ color: subTextColor }} />
                  <p style={{ color: subTextColor }} className="text-sm">
                    Type at least 2 characters to search
                  </p>
                </div>
              )}

              {query.length >= 2 && !loading && results.length === 0 && (
                <div className="p-12 text-center">
                  <Search className="w-12 h-12 mx-auto mb-4" style={{ color: subTextColor }} />
                  <p style={{ color: textColor }} className="font-medium mb-1">
                    No results found
                  </p>
                  <p style={{ color: subTextColor }} className="text-sm">
                    Try different keywords
                  </p>
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

                    const typeColor = getTypeColor(result.type);
                    const TypeIcon = getTypeIcon(result.type);
                    const isSelected = index === selectedIndex;

                    return (
                      <motion.div
                        key={`${result.type}-${result.id}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleSelect(result)}
                        className="mx-2 mb-2 rounded-xl cursor-pointer transition-all group"
                        style={{
                          backgroundColor: isSelected 
                            ? (isDark ? TRAXCIS_COLORS.primary[900] + '40' : TRAXCIS_COLORS.primary[50])
                            : 'transparent',
                          borderLeft: isSelected ? `4px solid ${TRAXCIS_COLORS.primary.DEFAULT}` : '4px solid transparent',
                        }}
                        onMouseEnter={() => setSelectedIndex(index)}
                      >
                        <div className="px-4 py-3 flex items-center gap-4">
                          {/* Avatar or Icon */}
                          <div className="flex-shrink-0">
                            {avatarUrl && result.type === 'user' ? (
                              <img
                                src={avatarUrl}
                                alt={result.title}
                                className="w-12 h-12 rounded-full object-cover ring-2"
                                style={{ ringColor: isSelected ? TRAXCIS_COLORS.primary.DEFAULT : 'transparent' }}
                              />
                            ) : (
                              <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center transition-all"
                                style={{ backgroundColor: typeColor.bg }}
                              >
                                <TypeIcon className="w-6 h-6" style={{ color: typeColor.icon }} />
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 
                                style={{ color: textColor }}
                                className="font-semibold text-sm truncate"
                              >
                                {result.title}
                              </h3>
                              <span
                                style={{
                                  backgroundColor: typeColor.bg,
                                  color: typeColor.text,
                                }}
                                className="px-2.5 py-0.5 text-xs font-semibold rounded-full flex-shrink-0"
                              >
                                {getLabelForType(result.type)}
                              </span>
                            </div>
                            {result.subtitle && (
                              <p style={{ color: subTextColor }} className="text-sm truncate">
                                {result.subtitle}
                              </p>
                            )}
                            {result.description && (
                              <p style={{ color: subTextColor }} className="text-xs truncate mt-0.5 opacity-75">
                                {result.description}
                              </p>
                            )}
                          </div>

                          {/* Action hint */}
                          <div className="flex-shrink-0">
                            {isSelected ? (
                              <div 
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                                style={{ backgroundColor: TRAXCIS_COLORS.primary.DEFAULT }}
                              >
                                <span className="text-white text-xs font-medium">Enter</span>
                                <ArrowRight className="w-3 h-3 text-white" />
                              </div>
                            ) : (
                              <ArrowRight 
                                className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" 
                                style={{ color: subTextColor }}
                              />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div 
              className="px-6 py-3 border-t flex items-center justify-between"
              style={{
                backgroundColor: isDark ? TRAXCIS_COLORS.secondary[800] : TRAXCIS_COLORS.secondary[50],
                borderColor: cardBorder,
              }}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <kbd 
                    style={{ 
                      backgroundColor: cardBg,
                      borderColor: cardBorder,
                      color: subTextColor,
                    }}
                    className="px-2 py-1 text-xs font-medium border rounded shadow-sm"
                  >
                    ↑↓
                  </kbd>
                  <span style={{ color: subTextColor }} className="text-xs">Navigate</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <kbd 
                    style={{ 
                      backgroundColor: cardBg,
                      borderColor: cardBorder,
                      color: subTextColor,
                    }}
                    className="px-2 py-1 text-xs font-medium border rounded shadow-sm"
                  >
                    ↵
                  </kbd>
                  <span style={{ color: subTextColor }} className="text-xs">Select</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <kbd 
                    style={{ 
                      backgroundColor: cardBg,
                      borderColor: cardBorder,
                      color: subTextColor,
                    }}
                    className="px-2 py-1 text-xs font-medium border rounded shadow-sm"
                  >
                    ESC
                  </kbd>
                  <span style={{ color: subTextColor }} className="text-xs">Close</span>
                </div>
              </div>
              {results.length > 0 && (
                <span style={{ color: subTextColor }} className="text-xs font-medium">
                  {results.length} result{results.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default UniversalSearch;
