import { ref, computed, watch, nextTick } from 'vue';
import { debounce } from 'lodash-es';

/**
 * Composable for search functionality with performance optimizations
 * 
 * @param {Object} options - Configuration options
 * @param {Function} options.searchFn - Function to perform the actual search
 * @param {Number} options.debounceMs - Debounce delay in milliseconds
 * @param {Number} options.minSearchLength - Minimum search query length
 * @param {Boolean} options.enableHistory - Enable search history
 * @param {Number} options.maxHistoryItems - Maximum history items to keep
 * @param {String} options.historyKey - LocalStorage key for search history
 * @returns {Object} Search state and methods
 */
export function useSearch(options = {}) {
  const {
    searchFn = () => Promise.resolve([]),
    debounceMs = 300,
    minSearchLength = 1,
    enableHistory = true,
    maxHistoryItems = 10,
    historyKey = 'search-history'
  } = options;

  // Reactive state
  const query = ref('');
  const results = ref([]);
  const suggestions = ref([]);
  const isLoading = ref(false);
  const error = ref(null);
  const searchHistory = ref([]);
  const totalResults = ref(0);
  const currentPage = ref(1);
  const hasMore = ref(false);

  // Search performance tracking
  const searchStats = ref({
    lastSearchTime: 0,
    averageSearchTime: 0,
    searchCount: 0
  });

  // Computed properties
  const hasQuery = computed(() => query.value.length >= minSearchLength);
  const hasResults = computed(() => results.value.length > 0);
  const isEmpty = computed(() => !isLoading.value && !hasResults.value && hasQuery.value);

  // Debounced search function
  const debouncedSearch = debounce(async (searchQuery, options = {}) => {
    if (searchQuery.length < minSearchLength) {
      results.value = [];
      suggestions.value = [];
      totalResults.value = 0;
      hasMore.value = false;
      return;
    }

    isLoading.value = true;
    error.value = null;
    
    const startTime = performance.now();

    try {
      const searchOptions = {
        query: searchQuery,
        page: options.page || 1,
        limit: options.limit || 20,
        ...options
      };

      const response = await searchFn(searchOptions);
      
      // Handle different response formats
      let searchResults, searchSuggestions, total, more;
      
      if (Array.isArray(response)) {
        searchResults = response;
        searchSuggestions = [];
        total = response.length;
        more = false;
      } else {
        searchResults = response.results || response.data || [];
        searchSuggestions = response.suggestions || [];
        total = response.total || response.count || searchResults.length;
        more = response.hasMore || response.has_more || false;
      }

      // Update results based on pagination
      if (options.append) {
        results.value = [...results.value, ...searchResults];
      } else {
        results.value = searchResults;
      }
      
      suggestions.value = searchSuggestions;
      totalResults.value = total;
      hasMore.value = more;
      currentPage.value = options.page || 1;

      // Add to search history
      if (enableHistory && searchQuery.trim()) {
        addToHistory(searchQuery.trim());
      }

      // Update search performance stats
      const searchTime = performance.now() - startTime;
      updateSearchStats(searchTime);

    } catch (err) {
      console.error('Search error:', err);
      error.value = err.message || 'Search failed';
      results.value = [];
      suggestions.value = [];
      totalResults.value = 0;
      hasMore.value = false;
    } finally {
      isLoading.value = false;
    }
  }, debounceMs);

  // Search methods
  const search = (searchQuery = query.value, options = {}) => {
    return debouncedSearch(searchQuery, options);
  };

  const searchMore = async () => {
    if (!hasMore.value || isLoading.value) return;
    
    await search(query.value, {
      page: currentPage.value + 1,
      append: true
    });
  };

  const clearSearch = () => {
    query.value = '';
    results.value = [];
    suggestions.value = [];
    error.value = null;
    totalResults.value = 0;
    currentPage.value = 1;
    hasMore.value = false;
    debouncedSearch.cancel();
  };

  const retrySearch = () => {
    if (query.value) {
      search(query.value);
    }
  };

  // Search history management
  const addToHistory = (searchQuery) => {
    if (!enableHistory) return;

    const historyItem = {
      query: searchQuery,
      timestamp: Date.now()
    };

    // Remove existing entry if it exists
    searchHistory.value = searchHistory.value.filter(item => item.query !== searchQuery);
    
    // Add to beginning
    searchHistory.value.unshift(historyItem);
    
    // Limit history size
    if (searchHistory.value.length > maxHistoryItems) {
      searchHistory.value = searchHistory.value.slice(0, maxHistoryItems);
    }
    
    saveHistory();
  };

  const removeFromHistory = (searchQuery) => {
    searchHistory.value = searchHistory.value.filter(item => item.query !== searchQuery);
    saveHistory();
  };

  const clearHistory = () => {
    searchHistory.value = [];
    saveHistory();
  };

  const loadHistory = () => {
    if (!enableHistory) return;
    
    try {
      const saved = localStorage.getItem(historyKey);
      if (saved) {
        searchHistory.value = JSON.parse(saved);
      }
    } catch (err) {
      console.warn('Failed to load search history:', err);
      searchHistory.value = [];
    }
  };

  const saveHistory = () => {
    if (!enableHistory) return;
    
    try {
      localStorage.setItem(historyKey, JSON.stringify(searchHistory.value));
    } catch (err) {
      console.warn('Failed to save search history:', err);
    }
  };

  // Performance tracking
  const updateSearchStats = (searchTime) => {
    searchStats.value.lastSearchTime = searchTime;
    searchStats.value.searchCount += 1;
    
    // Calculate running average
    const currentAvg = searchStats.value.averageSearchTime;
    const count = searchStats.value.searchCount;
    searchStats.value.averageSearchTime = (currentAvg * (count - 1) + searchTime) / count;
  };

  const getSearchStats = () => ({
    ...searchStats.value,
    formattedLastSearchTime: `${searchStats.value.lastSearchTime.toFixed(2)}ms`,
    formattedAverageSearchTime: `${searchStats.value.averageSearchTime.toFixed(2)}ms`
  });

  // Search result highlighting
  const highlightMatches = (text, searchQuery = query.value) => {
    if (!searchQuery || !text) return text;
    
    const regex = new RegExp(`(${escapeRegExp(searchQuery)})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 text-yellow-800 px-0.5 rounded">$1</mark>');
  };

  const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  // Advanced search functionality
  const buildSearchQuery = (criteria, options = {}) => {
    const {
      matchAll = true,
      caseSensitive = false,
      exactMatch = false
    } = options;

    let queryParts = [];
    
    Object.entries(criteria).forEach(([key, value]) => {
      if (!value || (Array.isArray(value) && value.length === 0)) return;
      
      let queryPart = '';
      
      if (Array.isArray(value)) {
        queryPart = value.map(v => `${key}:"${v}"`).join(' OR ');
      } else if (exactMatch) {
        queryPart = `${key}:"${value}"`;
      } else {
        queryPart = `${key}:${value}`;
      }
      
      if (queryPart) {
        queryParts.push(queryPart);
      }
    });
    
    const operator = matchAll ? ' AND ' : ' OR ';
    return queryParts.join(operator);
  };

  // Watch for query changes
  watch(query, (newQuery) => {
    if (newQuery.length >= minSearchLength) {
      search(newQuery);
    } else {
      clearSearch();
    }
  });

  // Initialize
  loadHistory();

  return {
    // State
    query,
    results,
    suggestions,
    isLoading,
    error,
    searchHistory,
    totalResults,
    currentPage,
    hasMore,
    searchStats,

    // Computed
    hasQuery,
    hasResults,
    isEmpty,

    // Methods
    search,
    searchMore,
    clearSearch,
    retrySearch,
    addToHistory,
    removeFromHistory,
    clearHistory,
    highlightMatches,
    buildSearchQuery,
    getSearchStats,

    // Advanced methods
    debouncedSearch
  };
}

/**
 * Composable for saved searches functionality
 * 
 * @param {String} storageKey - LocalStorage key for saved searches
 * @returns {Object} Saved searches state and methods
 */
export function useSavedSearches(storageKey = 'saved-searches') {
  const savedSearches = ref([]);

  const loadSavedSearches = () => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        savedSearches.value = JSON.parse(saved);
      }
    } catch (err) {
      console.warn('Failed to load saved searches:', err);
      savedSearches.value = [];
    }
  };

  const saveSavedSearches = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(savedSearches.value));
    } catch (err) {
      console.warn('Failed to save searches:', err);
    }
  };

  const saveSearch = (searchData) => {
    const search = {
      id: Date.now().toString(),
      ...searchData,
      createdAt: new Date().toISOString()
    };

    // Check if search with same name exists
    const existingIndex = savedSearches.value.findIndex(s => s.name === search.name);
    
    if (existingIndex >= 0) {
      // Update existing search
      savedSearches.value[existingIndex] = search;
    } else {
      // Add new search
      savedSearches.value.unshift(search);
    }

    saveSavedSearches();
    return search;
  };

  const deleteSearch = (searchId) => {
    savedSearches.value = savedSearches.value.filter(s => s.id !== searchId);
    saveSavedSearches();
  };

  const updateSearch = (searchId, updates) => {
    const index = savedSearches.value.findIndex(s => s.id === searchId);
    if (index >= 0) {
      savedSearches.value[index] = {
        ...savedSearches.value[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      saveSavedSearches();
    }
  };

  const getSearch = (searchId) => {
    return savedSearches.value.find(s => s.id === searchId);
  };

  // Initialize
  loadSavedSearches();

  return {
    savedSearches,
    saveSearch,
    deleteSearch,
    updateSearch,
    getSearch,
    loadSavedSearches
  };
}

export default useSearch;