<template>
  <div class="search-bar" :class="wrapperClasses">
    <!-- Search Input -->
    <div class="relative">
      <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Icon name="search" :class="iconClasses" />
      </div>
      
      <input
        ref="searchInput"
        v-model="searchQuery"
        type="search"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="inputClasses"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
        @keyup.escape="handleEscape"
        autocomplete="off"
        role="combobox"
        :aria-expanded="showSuggestions"
        :aria-owns="suggestionsId"
        :aria-activedescendant="activeSuggestionId"
      />
      
      <!-- Clear Button -->
      <button
        v-if="searchQuery && !disabled"
        type="button"
        class="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
        @click="handleClear"
        :aria-label="clearLabel"
      >
        <Icon name="x" class="w-4 h-4" />
      </button>
    </div>

    <!-- Suggestions Dropdown -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="showSuggestions"
        :id="suggestionsId"
        class="absolute z-[9999] mt-1 w-full bg-white rounded-md shadow-lg border border-neutral-200 max-h-60 overflow-auto"
        role="listbox"
      >
        <!-- Loading State -->
        <div v-if="isLoading" class="px-4 py-3 text-sm text-neutral-500 flex items-center">
          <div class="animate-spin rounded-full h-4 w-4 border-2 border-primary-500 border-t-transparent mr-2"></div>
          Searching...
        </div>

        <!-- No Results -->
        <div v-else-if="suggestions.length === 0 && searchQuery" class="px-4 py-3 text-sm text-neutral-500">
          No results found for "{{ searchQuery }}"
        </div>

        <!-- Suggestions List -->
        <template v-else>
          <!-- Recent Searches -->
          <div v-if="showRecentSearches && recentSearches.length > 0" class="border-b border-neutral-100">
            <div class="px-4 py-2 text-xs font-medium text-neutral-500 uppercase tracking-wide">
              Recent Searches
            </div>
            <button
              v-for="(recent, index) in recentSearches"
              :key="`recent-${index}`"
              type="button"
              class="w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 flex items-center"
              @click="selectSuggestion(recent)"
            >
              <Icon name="clock" class="w-4 h-4 text-neutral-400 mr-2 flex-shrink-0" />
              <span class="truncate">{{ recent.text }}</span>
            </button>
          </div>

          <!-- Suggestions -->
          <div v-if="suggestions.length > 0">
            <div v-if="showRecentSearches && recentSearches.length > 0" class="px-4 py-2 text-xs font-medium text-neutral-500 uppercase tracking-wide">
              Suggestions
            </div>
            <button
              v-for="(suggestion, index) in suggestions"
              :key="suggestion.id || index"
              :id="getSuggestionId(index)"
              type="button"
              class="w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 focus:bg-neutral-50 flex items-center"
              :class="{
                'bg-primary-50 text-primary-700': index === activeSuggestionIndex
              }"
              @click="selectSuggestion(suggestion)"
              @mouseenter="activeSuggestionIndex = index"
              role="option"
              :aria-selected="index === activeSuggestionIndex"
            >
              <Icon 
                v-if="suggestion.icon" 
                :name="suggestion.icon" 
                class="w-4 h-4 text-neutral-400 mr-2 flex-shrink-0" 
              />
              <div class="flex-1 min-w-0">
                <div class="truncate" v-html="highlightMatch(suggestion.text || suggestion.label)"></div>
                <div v-if="suggestion.description" class="text-xs text-neutral-500 truncate">
                  {{ suggestion.description }}
                </div>
              </div>
              <div v-if="suggestion.category" class="text-xs text-neutral-400 ml-2 flex-shrink-0">
                {{ suggestion.category }}
              </div>
            </button>
          </div>
        </template>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { debounce } from 'lodash-es';
import Icon from '@/Components/Base/Icon.vue';

const props = defineProps({
  // v-model
  modelValue: {
    type: String,
    default: ''
  },
  
  // Basic props
  placeholder: {
    type: String,
    default: 'Search...'
  },
  
  disabled: {
    type: Boolean,
    default: false
  },
  
  // Size
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  
  // Suggestions
  suggestions: {
    type: Array,
    default: () => []
  },
  
  // Loading state
  loading: {
    type: Boolean,
    default: false
  },
  
  // Search configuration
  minSearchLength: {
    type: Number,
    default: 3
  },
  
  debounceMs: {
    type: Number,
    default: 300
  },
  
  // Features
  showRecentSearches: {
    type: Boolean,
    default: true
  },
  
  maxRecentSearches: {
    type: Number,
    default: 5
  },
  
  // Labels
  clearLabel: {
    type: String,
    default: 'Clear search'
  },
  
  // Additional classes
  class: {
    type: [String, Array, Object],
    default: ''
  }
});

const emit = defineEmits([
  'update:modelValue',
  'search',
  'select',
  'focus',
  'blur',
  'clear'
]);

// Refs
const searchInput = ref(null);
const searchQuery = ref(props.modelValue);
const showSuggestions = ref(false);
const activeSuggestionIndex = ref(-1);
const isLoading = ref(false);
const recentSearches = ref([]);

// Generate unique IDs for accessibility
const suggestionsId = `suggestions-${Math.random().toString(36).substr(2, 9)}`;
const getSuggestionId = (index) => `suggestion-${suggestionsId}-${index}`;

// Computed properties
const activeSuggestionId = computed(() => {
  return activeSuggestionIndex.value >= 0 ? getSuggestionId(activeSuggestionIndex.value) : null;
});

const wrapperClasses = computed(() => [
  'search-bar relative',
  props.class
]);

const inputClasses = computed(() => {
  const baseClasses = [
    'block w-full rounded-md border-0 shadow-sm ring-1 ring-inset ring-neutral-300',
    'placeholder:text-neutral-400 focus:ring-2 focus:ring-inset focus:ring-primary-600',
    'disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500',
    'transition-all duration-200 bg-white text-neutral-900'
  ];
  
  const sizeClasses = {
    sm: 'pl-9 pr-9 py-2 text-sm h-8',
    md: 'pl-10 pr-10 py-2.5 text-base h-10',
    lg: 'pl-12 pr-12 py-3 text-lg h-12'
  };
  
  return [
    ...baseClasses,
    sizeClasses[props.size]
  ];
});

const iconClasses = computed(() => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };
  
  return [
    sizes[props.size],
    'text-neutral-400'
  ];
});

// Debounced search function
const debouncedSearch = debounce((query) => {
  if (query.length >= props.minSearchLength) {
    isLoading.value = true;
    emit('search', query);
  }
}, props.debounceMs);

// Watch for external loading state changes
watch(() => props.loading, (newValue) => {
  isLoading.value = newValue;
});

// Watch for model value changes
watch(() => props.modelValue, (newValue) => {
  searchQuery.value = newValue;
});

// Watch search query changes
watch(searchQuery, (newValue) => {
  emit('update:modelValue', newValue);
  
  if (newValue.length >= props.minSearchLength) {
    showSuggestions.value = true;
    debouncedSearch(newValue);
  } else {
    // Only show recent searches if query is empty and feature is enabled
    showSuggestions.value = newValue.length === 0 && props.showRecentSearches && recentSearches.value.length > 0;
    isLoading.value = false; // Ensure loading is false if criteria not met
  }
  
  // Reset active suggestion when query changes
  activeSuggestionIndex.value = -1;
});

// Event handlers
const handleInput = (event) => {
  searchQuery.value = event.target.value;
};

const handleFocus = (event) => {
  if (searchQuery.value.length === 0 && props.showRecentSearches && recentSearches.value.length > 0) {
    showSuggestions.value = true;
  } else if (searchQuery.value.length >= props.minSearchLength) {
    showSuggestions.value = true;
  } else {
    showSuggestions.value = false; // Hide suggestions if query is too short on focus
  }
  emit('focus', event);
};

const handleBlur = (event) => {
  // Delay hiding suggestions to allow for clicks
  setTimeout(() => {
    showSuggestions.value = false;
    activeSuggestionIndex.value = -1;
  }, 150);
  emit('blur', event);
};

const handleKeydown = (event) => {
  if (!showSuggestions.value) return;
  
  const totalSuggestions = props.suggestions.length + (props.showRecentSearches ? recentSearches.value.length : 0);
  
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      activeSuggestionIndex.value = Math.min(activeSuggestionIndex.value + 1, totalSuggestions - 1);
      break;
      
    case 'ArrowUp':
      event.preventDefault();
      activeSuggestionIndex.value = Math.max(activeSuggestionIndex.value - 1, -1);
      break;
      
    case 'Enter':
      event.preventDefault();
      if (activeSuggestionIndex.value >= 0) {
        const allSuggestions = [...(props.showRecentSearches ? recentSearches.value : []), ...props.suggestions];
        selectSuggestion(allSuggestions[activeSuggestionIndex.value]);
      } else if (searchQuery.value) {
        handleSearch();
      }
      break;
      
    case 'Tab':
      showSuggestions.value = false;
      break;
  }
};

const handleEscape = () => {
  showSuggestions.value = false;
  activeSuggestionIndex.value = -1;
  searchInput.value?.blur();
};

const handleClear = () => {

  showSuggestions.value = false;
  activeSuggestionIndex.value = -1;
  emit('clear');
  nextTick(() => {
    searchInput.value?.focus();
  });
};

const handleSearch = () => {
  if (searchQuery.value) {
    addToRecentSearches(searchQuery.value);
    showSuggestions.value = false;
    emit('search', searchQuery.value);
  }
};

const selectSuggestion = (suggestion) => {
  const selectedText = suggestion.text || suggestion.label || suggestion;
  searchQuery.value = selectedText;
  showSuggestions.value = false;
  activeSuggestionIndex.value = -1;
  
  addToRecentSearches(selectedText);
  emit('select', suggestion);
  emit('search', selectedText);

};

// Recent searches management
const addToRecentSearches = (searchText) => {
  if (!props.showRecentSearches || !searchText.trim()) return;
  
  const searchItem = {
    text: searchText.trim(),
    timestamp: Date.now()
  };
  
  // Remove existing entry if it exists
  recentSearches.value = recentSearches.value.filter(item => item.text !== searchItem.text);
  
  // Add to beginning
  recentSearches.value.unshift(searchItem);
  
  // Limit to max recent searches
  if (recentSearches.value.length > props.maxRecentSearches) {
    recentSearches.value = recentSearches.value.slice(0, props.maxRecentSearches);
  }
  
  // Save to localStorage
  saveRecentSearches();
};

const loadRecentSearches = () => {
  try {
    const saved = localStorage.getItem('searchbar-recent-searches');
    if (saved) {
      recentSearches.value = JSON.parse(saved);
    }
  } catch (error) {
    console.warn('Failed to load recent searches:', error);
    recentSearches.value = [];
  }
};

const saveRecentSearches = () => {
  try {
    localStorage.setItem('searchbar-recent-searches', JSON.stringify(recentSearches.value));
  } catch (error) {
    console.warn('Failed to save recent searches:', error);
  }
};

// Highlight matching text in suggestions
const highlightMatch = (text) => {
  if (!searchQuery.value || !text) return text;
  
  const regex = new RegExp(`(${escapeRegExp(searchQuery.value)})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 text-yellow-800 px-0.5 rounded">$1</mark>');
};

const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Click outside handler
const handleClickOutside = (event) => {
  if (!searchInput.value?.contains(event.target)) {
    showSuggestions.value = false;
  }
};

// Public methods
const focus = () => {
  searchInput.value?.focus();
};

const blur = () => {
  searchInput.value?.blur();
};

const clear = () => {
  handleClear();
};

// Expose methods
defineExpose({
  focus,
  blur,
  clear
});

// Lifecycle
onMounted(() => {
  loadRecentSearches();
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
/* Custom search input styling */
input[type="search"]::-webkit-search-cancel-button {
  -webkit-appearance: none;
}

/* Ensure proper z-index for dropdown */
.search-bar {
  position: relative;
  z-index: 1;
}

/* Smooth transitions for suggestions */
.search-bar .transition {
  transition-property: opacity, transform;
}

/* Highlight styling */
:deep(mark) {
  background-color: rgb(254 240 138);
  color: rgb(133 77 14);
  padding: 0.125rem;
  border-radius: 0.25rem;
}
</style>