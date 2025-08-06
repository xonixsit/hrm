import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { useSearch, useSavedSearches } from '@/composables/useSearch.js';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock performance.now
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => Date.now())
  }
});

describe('useSearch', () => {
  let searchFn;
  let searchComposable;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    
    searchFn = vi.fn().mockResolvedValue([
      { id: 1, title: 'Apple', category: 'Fruit' },
      { id: 2, title: 'Banana', category: 'Fruit' }
    ]);
    
    searchComposable = useSearch({
      searchFn,
      debounceMs: 50, // Shorter for testing
      minSearchLength: 2
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Basic Search Functionality', () => {
    it('initializes with correct default values', () => {
      expect(searchComposable.query.value).toBe('');
      expect(searchComposable.results.value).toEqual([]);
      expect(searchComposable.isLoading.value).toBe(false);
      expect(searchComposable.error.value).toBe(null);
      expect(searchComposable.hasQuery.value).toBe(false);
      expect(searchComposable.hasResults.value).toBe(false);
      expect(searchComposable.isEmpty.value).toBe(false);
    });

    it('updates query and triggers search', async () => {
      searchComposable.query.value = 'apple';
      
      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(searchFn).toHaveBeenCalledWith({
        query: 'apple',
        page: 1,
        limit: 20
      });
      expect(searchComposable.results.value).toHaveLength(2);
      expect(searchComposable.hasResults.value).toBe(true);
    });

    it('does not search when query is below minimum length', async () => {
      searchComposable.query.value = 'a';
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(searchFn).not.toHaveBeenCalled();
      expect(searchComposable.results.value).toEqual([]);
    });

    it('clears results when query is cleared', async () => {
      // First, perform a search
      searchComposable.query.value = 'apple';
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(searchComposable.results.value).toHaveLength(2);
      
      // Then clear the query
      searchComposable.query.value = '';
      await nextTick();
      
      expect(searchComposable.results.value).toEqual([]);
    });
  });

  describe('Search Methods', () => {
    it('search method calls searchFn with correct parameters', async () => {
      await searchComposable.search('test query', { page: 2, limit: 10 });
      
      expect(searchFn).toHaveBeenCalledWith({
        query: 'test query',
        page: 2,
        limit: 10
      });
    });

    it('searchMore method loads additional results', async () => {
      // Mock response with hasMore
      searchFn.mockResolvedValueOnce({
        results: [{ id: 1, title: 'Apple' }],
        hasMore: true,
        total: 10
      });
      
      await searchComposable.search('apple');
      expect(searchComposable.results.value).toHaveLength(1);
      expect(searchComposable.hasMore.value).toBe(true);
      
      // Mock second page
      searchFn.mockResolvedValueOnce({
        results: [{ id: 2, title: 'Apricot' }],
        hasMore: false,
        total: 10
      });
      
      await searchComposable.searchMore();
      
      expect(searchComposable.results.value).toHaveLength(2);
      expect(searchComposable.currentPage.value).toBe(2);
      expect(searchComposable.hasMore.value).toBe(false);
    });

    it('clearSearch method resets all state', () => {
      searchComposable.query.value = 'test';
      searchComposable.results.value = [{ id: 1 }];
      searchComposable.error.value = 'error';
      
      searchComposable.clearSearch();
      
      expect(searchComposable.query.value).toBe('');
      expect(searchComposable.results.value).toEqual([]);
      expect(searchComposable.error.value).toBe(null);
      expect(searchComposable.totalResults.value).toBe(0);
      expect(searchComposable.currentPage.value).toBe(1);
      expect(searchComposable.hasMore.value).toBe(false);
    });

    it('retrySearch method re-executes last search', async () => {
      searchComposable.query.value = 'apple';
      await new Promise(resolve => setTimeout(resolve, 100));
      
      searchFn.mockClear();
      
      searchComposable.retrySearch();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(searchFn).toHaveBeenCalledWith({
        query: 'apple',
        page: 1,
        limit: 20
      });
    });
  });

  describe('Loading States', () => {
    it('sets loading state during search', async () => {
      let resolveSearch;
      const searchPromise = new Promise(resolve => {
        resolveSearch = resolve;
      });
      searchFn.mockReturnValue(searchPromise);
      
      const searchPromiseResult = searchComposable.search('apple');
      
      expect(searchComposable.isLoading.value).toBe(true);
      
      resolveSearch([]);
      await searchPromiseResult;
      
      expect(searchComposable.isLoading.value).toBe(false);
    });

    it('handles search errors correctly', async () => {
      const error = new Error('Search failed');
      searchFn.mockRejectedValue(error);
      
      await searchComposable.search('apple');
      
      expect(searchComposable.error.value).toBe('Search failed');
      expect(searchComposable.results.value).toEqual([]);
      expect(searchComposable.isLoading.value).toBe(false);
    });
  });

  describe('Search History', () => {
    it('loads search history from localStorage on initialization', () => {
      const history = [
        { query: 'previous search', timestamp: Date.now() }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(history));
      
      const newComposable = useSearch({ searchFn });
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('search-history');
      expect(newComposable.searchHistory.value).toEqual(history);
    });

    it('adds search to history when search is performed', async () => {
      await searchComposable.search('apple');
      
      expect(searchComposable.searchHistory.value).toHaveLength(1);
      expect(searchComposable.searchHistory.value[0].query).toBe('apple');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'search-history',
        expect.stringContaining('apple')
      );
    });

    it('removes duplicate entries from history', async () => {
      await searchComposable.search('apple');
      await searchComposable.search('banana');
      await searchComposable.search('apple'); // Duplicate
      
      expect(searchComposable.searchHistory.value).toHaveLength(2);
      expect(searchComposable.searchHistory.value[0].query).toBe('apple'); // Most recent first
      expect(searchComposable.searchHistory.value[1].query).toBe('banana');
    });

    it('limits history to maximum items', async () => {
      const composable = useSearch({ searchFn, maxHistoryItems: 2 });
      
      await composable.search('first');
      await composable.search('second');
      await composable.search('third');
      
      expect(composable.searchHistory.value).toHaveLength(2);
      expect(composable.searchHistory.value[0].query).toBe('third');
      expect(composable.searchHistory.value[1].query).toBe('second');
    });

    it('removes item from history', async () => {
      await searchComposable.search('apple');
      await searchComposable.search('banana');
      
      searchComposable.removeFromHistory('apple');
      
      expect(searchComposable.searchHistory.value).toHaveLength(1);
      expect(searchComposable.searchHistory.value[0].query).toBe('banana');
    });

    it('clears all history', async () => {
      await searchComposable.search('apple');
      await searchComposable.search('banana');
      
      searchComposable.clearHistory();
      
      expect(searchComposable.searchHistory.value).toEqual([]);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('search-history', '[]');
    });
  });

  describe('Performance Tracking', () => {
    it('tracks search performance statistics', async () => {
      window.performance.now
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(1100); // 100ms search time
      
      await searchComposable.search('apple');
      
      const stats = searchComposable.getSearchStats();
      expect(stats.lastSearchTime).toBe(100);
      expect(stats.averageSearchTime).toBe(100);
      expect(stats.searchCount).toBe(1);
    });

    it('calculates running average of search times', async () => {
      window.performance.now
        .mockReturnValueOnce(1000).mockReturnValueOnce(1100) // 100ms
        .mockReturnValueOnce(2000).mockReturnValueOnce(2300); // 300ms
      
      await searchComposable.search('apple');
      await searchComposable.search('banana');
      
      const stats = searchComposable.getSearchStats();
      expect(stats.lastSearchTime).toBe(300);
      expect(stats.averageSearchTime).toBe(200); // (100 + 300) / 2
      expect(stats.searchCount).toBe(2);
    });
  });

  describe('Text Highlighting', () => {
    it('highlights matching text in search results', () => {
      searchComposable.query.value = 'app';
      
      const highlighted = searchComposable.highlightMatches('Apple pie');
      
      expect(highlighted).toContain('<mark');
      expect(highlighted).toContain('app');
    });

    it('handles case-insensitive highlighting', () => {
      searchComposable.query.value = 'APP';
      
      const highlighted = searchComposable.highlightMatches('Apple pie');
      
      expect(highlighted).toContain('<mark');
      expect(highlighted).toContain('App');
    });

    it('escapes special regex characters', () => {
      searchComposable.query.value = '(test)';
      
      const highlighted = searchComposable.highlightMatches('This is a (test) string');
      
      expect(highlighted).toContain('<mark');
      expect(highlighted).toContain('(test)');
    });
  });

  describe('Advanced Search Query Building', () => {
    it('builds search query from criteria with AND operator', () => {
      const criteria = {
        name: 'apple',
        category: 'fruit'
      };
      
      const query = searchComposable.buildSearchQuery(criteria, { matchAll: true });
      
      expect(query).toBe('name:apple AND category:fruit');
    });

    it('builds search query from criteria with OR operator', () => {
      const criteria = {
        name: 'apple',
        category: 'fruit'
      };
      
      const query = searchComposable.buildSearchQuery(criteria, { matchAll: false });
      
      expect(query).toBe('name:apple OR category:fruit');
    });

    it('handles array values in criteria', () => {
      const criteria = {
        tags: ['organic', 'fresh']
      };
      
      const query = searchComposable.buildSearchQuery(criteria);
      
      expect(query).toBe('tags:"organic" OR tags:"fresh"');
    });

    it('handles exact match option', () => {
      const criteria = {
        name: 'apple pie'
      };
      
      const query = searchComposable.buildSearchQuery(criteria, { exactMatch: true });
      
      expect(query).toBe('name:"apple pie"');
    });

    it('ignores empty values in criteria', () => {
      const criteria = {
        name: 'apple',
        category: '',
        tags: [],
        price: null
      };
      
      const query = searchComposable.buildSearchQuery(criteria);
      
      expect(query).toBe('name:apple');
    });
  });

  describe('Error Handling', () => {
    it('handles localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });
      
      expect(() => {
        useSearch({ searchFn });
      }).not.toThrow();
    });

    it('handles JSON parsing errors in history', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      
      const composable = useSearch({ searchFn });
      
      expect(composable.searchHistory.value).toEqual([]);
    });
  });
});

describe('useSavedSearches', () => {
  let savedSearchesComposable;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    savedSearchesComposable = useSavedSearches('test-saved-searches');
  });

  describe('Basic Functionality', () => {
    it('initializes with empty saved searches', () => {
      expect(savedSearchesComposable.savedSearches.value).toEqual([]);
    });

    it('loads saved searches from localStorage', () => {
      const savedSearches = [
        { id: '1', name: 'Test Search', criteria: { name: 'test' } }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedSearches));
      
      const composable = useSavedSearches('test-key');
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('test-key');
      expect(composable.savedSearches.value).toEqual(savedSearches);
    });
  });

  describe('Save Search', () => {
    it('saves a new search', () => {
      const searchData = {
        name: 'My Search',
        criteria: { name: 'apple' },
        options: { matchAll: true }
      };
      
      const savedSearch = savedSearchesComposable.saveSearch(searchData);
      
      expect(savedSearch.id).toBeDefined();
      expect(savedSearch.name).toBe('My Search');
      expect(savedSearch.createdAt).toBeDefined();
      expect(savedSearchesComposable.savedSearches.value).toHaveLength(1);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('updates existing search with same name', () => {
      const searchData = { name: 'Test Search', criteria: { name: 'apple' } };
      
      // Save first search
      savedSearchesComposable.saveSearch(searchData);
      expect(savedSearchesComposable.savedSearches.value).toHaveLength(1);
      
      // Save search with same name
      const updatedData = { name: 'Test Search', criteria: { name: 'banana' } };
      savedSearchesComposable.saveSearch(updatedData);
      
      expect(savedSearchesComposable.savedSearches.value).toHaveLength(1);
      expect(savedSearchesComposable.savedSearches.value[0].criteria.name).toBe('banana');
    });
  });

  describe('Delete Search', () => {
    it('deletes a saved search', () => {
      const searchData = { name: 'Test Search', criteria: { name: 'apple' } };
      const savedSearch = savedSearchesComposable.saveSearch(searchData);
      
      savedSearchesComposable.deleteSearch(savedSearch.id);
      
      expect(savedSearchesComposable.savedSearches.value).toHaveLength(0);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'test-saved-searches',
        '[]'
      );
    });
  });

  describe('Update Search', () => {
    it('updates an existing search', () => {
      const searchData = { name: 'Test Search', criteria: { name: 'apple' } };
      const savedSearch = savedSearchesComposable.saveSearch(searchData);
      
      savedSearchesComposable.updateSearch(savedSearch.id, {
        name: 'Updated Search',
        criteria: { name: 'banana' }
      });
      
      const updated = savedSearchesComposable.savedSearches.value[0];
      expect(updated.name).toBe('Updated Search');
      expect(updated.criteria.name).toBe('banana');
      expect(updated.updatedAt).toBeDefined();
    });
  });

  describe('Get Search', () => {
    it('retrieves a search by ID', () => {
      const searchData = { name: 'Test Search', criteria: { name: 'apple' } };
      const savedSearch = savedSearchesComposable.saveSearch(searchData);
      
      const retrieved = savedSearchesComposable.getSearch(savedSearch.id);
      
      expect(retrieved).toEqual(savedSearch);
    });

    it('returns undefined for non-existent search', () => {
      const retrieved = savedSearchesComposable.getSearch('non-existent');
      
      expect(retrieved).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('handles localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });
      
      expect(() => {
        useSavedSearches('test-key');
      }).not.toThrow();
    });

    it('handles JSON parsing errors', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      
      const composable = useSavedSearches('test-key');
      
      expect(composable.savedSearches.value).toEqual([]);
    });
  });
});