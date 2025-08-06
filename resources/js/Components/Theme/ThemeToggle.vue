<template>
  <div class="theme-toggle">
    <!-- Simple Toggle Button -->
    <button
      v-if="variant === 'button'"
      @click="handleToggle"
      :class="buttonClasses"
      :aria-label="toggleAriaLabel"
      :title="toggleTitle"
    >
      <Icon :name="currentIconName" :size="iconSize" :class="iconClasses" />
      <span v-if="showLabel" class="toggle-label">{{ currentLabel }}</span>
    </button>

    <!-- Dropdown Menu -->
    <div v-else-if="variant === 'dropdown'" class="theme-dropdown" ref="dropdownRef">
      <button
        @click="toggleDropdown"
        :class="dropdownButtonClasses"
        :aria-expanded="isDropdownOpen"
        aria-haspopup="true"
      >
        <Icon :name="currentIconName" :size="iconSize" :class="iconClasses" />
        <span v-if="showLabel">{{ currentLabel }}</span>
        <Icon name="chevron-down" size="sm" :class="['dropdown-arrow transition-transform duration-200', { 'rotate-180': isDropdownOpen }]" />
      </button>

      <Transition name="dropdown">
        <div v-if="isDropdownOpen" class="dropdown-menu">
          <button
            v-for="theme in availableThemes"
            :key="theme.key"
            @click="selectTheme(theme.key)"
            :class="getThemeOptionClasses(theme.key)"
          >
            <Icon :name="getThemeIconName(theme.key)" size="sm" />
            <span>{{ theme.name }}</span>
            <Icon v-if="activeTheme === theme.key" name="check" size="sm" class="text-primary-500" />
          </button>
          
          <div class="dropdown-divider" />
          
          <button
            @click="selectSystemTheme"
            :class="getThemeOptionClasses('system')"
          >
            <Icon name="desktop" size="sm" />
            <span>System</span>
            <Icon v-if="isSystemThemePreferred" name="check" size="sm" class="text-primary-500" />
          </button>
        </div>
      </Transition>
    </div>

    <!-- Switch Style -->
    <label v-else-if="variant === 'switch'" class="theme-switch">
      <input
        type="checkbox"
        :checked="isDark"
        @change="handleToggle"
        class="switch-input"
      />
      <div class="switch-track">
        <div class="switch-thumb">
          <Icon :name="currentIconName" size="xs" class="switch-icon" />
        </div>
      </div>
      <span v-if="showLabel" class="switch-label">{{ switchLabel }}</span>
    </label>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useTheme } from '@/composables/useTheme';
import Icon from '@/Components/Base/Icon.vue';

const props = defineProps({
  // Toggle variant
  variant: {
    type: String,
    default: 'button',
    validator: (value) => ['button', 'dropdown', 'switch'].includes(value)
  },
  
  // Button size
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  
  // Show text label
  showLabel: {
    type: Boolean,
    default: false
  },
  
  // Button styling
  ghost: {
    type: Boolean,
    default: false
  },
  
  // Custom class
  class: {
    type: [String, Array, Object],
    default: ''
  }
});

const emit = defineEmits(['theme-changed']);

// Theme composable
const {
  activeTheme,
  isDark,
  isLight,
  isSystemThemePreferred,
  toggleTheme,
  setTheme,
  useSystemTheme,
  getAvailableThemes
} = useTheme();

// Local state
const isDropdownOpen = ref(false);
const dropdownRef = ref(null);

// Computed properties
const availableThemes = computed(() => getAvailableThemes());

const currentIconName = computed(() => {
  if (isDark.value) {
    return 'moon';
  }
  return 'sun';
});

const iconSize = computed(() => {
  const sizeMap = {
    sm: 'sm',
    md: 'md', 
    lg: 'lg'
  };
  return sizeMap[props.size] || 'md';
});

const currentLabel = computed(() => {
  if (isSystemThemePreferred.value) {
    return 'System';
  }
  return isDark.value ? 'Dark' : 'Light';
});

const switchLabel = computed(() => {
  return isDark.value ? 'Dark Mode' : 'Light Mode';
});

const toggleAriaLabel = computed(() => {
  return `Switch to ${isDark.value ? 'light' : 'dark'} theme`;
});

const toggleTitle = computed(() => {
  return `Current theme: ${currentLabel.value}. Click to toggle.`;
});

// Style classes
const buttonClasses = computed(() => [
  'theme-toggle-button',
  `size-${props.size}`,
  {
    'ghost': props.ghost,
    'with-label': props.showLabel
  },
  props.class
]);

const dropdownButtonClasses = computed(() => [
  'dropdown-button',
  `size-${props.size}`,
  {
    'ghost': props.ghost,
    'open': isDropdownOpen.value
  },
  props.class
]);

const iconClasses = computed(() => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };
  return ['theme-icon', sizes[props.size]];
});

// Methods
const handleToggle = () => {
  toggleTheme();
  emit('theme-changed', { theme: activeTheme.value });
};

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const selectTheme = (theme) => {
  setTheme(theme);
  isDropdownOpen.value = false;
  emit('theme-changed', { theme });
};

const selectSystemTheme = () => {
  useSystemTheme();
  isDropdownOpen.value = false;
  emit('theme-changed', { theme: 'system' });
};

const getThemeIconName = (theme) => {
  const icons = {
    light: 'sun',
    dark: 'moon'
  };
  return icons[theme] || 'sun';
};

const getThemeOptionClasses = (theme) => [
  'dropdown-option',
  {
    'active': theme === 'system' ? isSystemThemePreferred.value : activeTheme.value === theme
  }
];

// Click outside handler for dropdown
const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isDropdownOpen.value = false;
  }
};

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.theme-toggle {
  @apply relative;
}

/* Button Variant */
.theme-toggle-button {
  @apply inline-flex items-center justify-center rounded-lg transition-all duration-200;
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
  @apply hover:bg-neutral-100 active:bg-neutral-200;
}

.theme-toggle-button.ghost {
  @apply bg-transparent hover:bg-neutral-100;
}

.theme-toggle-button.size-sm {
  @apply p-1.5;
}

.theme-toggle-button.size-md {
  @apply p-2;
}

.theme-toggle-button.size-lg {
  @apply p-3;
}

.theme-toggle-button.with-label {
  @apply space-x-2;
}

.toggle-label {
  @apply text-sm font-medium text-neutral-700;
}

/* Dropdown Variant */
.theme-dropdown {
  @apply relative;
}

.dropdown-button {
  @apply inline-flex items-center space-x-2 px-3 py-2 rounded-lg;
  @apply bg-white border border-neutral-300 text-neutral-700;
  @apply hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500;
  @apply transition-all duration-200;
}

.dropdown-button.ghost {
  @apply bg-transparent border-transparent hover:bg-neutral-100;
}

.dropdown-button.open {
  @apply ring-2 ring-primary-500;
}

.dropdown-arrow {
  @apply w-4 h-4 transition-transform duration-200;
}

.dropdown-menu {
  @apply absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg z-50;
  @apply py-1;
}

.dropdown-option {
  @apply w-full flex items-center justify-between px-3 py-2 text-sm text-neutral-700;
  @apply hover:bg-neutral-100 transition-colors duration-150;
}

.dropdown-option.active {
  @apply bg-primary-50 text-primary-700;
}

.dropdown-divider {
  @apply border-t border-neutral-200 my-1;
}

/* Switch Variant */
.theme-switch {
  @apply inline-flex items-center space-x-3 cursor-pointer;
}

.switch-input {
  @apply sr-only;
}

.switch-track {
  @apply relative w-12 h-6 bg-neutral-300 rounded-full transition-colors duration-200;
  @apply focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2;
}

.switch-input:checked + .switch-track {
  @apply bg-primary-500;
}

.switch-thumb {
  @apply absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm;
  @apply flex items-center justify-center transition-transform duration-200;
  @apply transform translate-x-0;
}

.switch-input:checked + .switch-track .switch-thumb {
  @apply transform translate-x-6;
}

.switch-icon {
  @apply w-3 h-3 text-neutral-600;
}

.switch-input:checked + .switch-track .switch-icon {
  @apply text-primary-600;
}

.switch-label {
  @apply text-sm font-medium text-neutral-700;
}

/* Dropdown transitions */
.dropdown-enter-active,
.dropdown-leave-active {
  @apply transition-all duration-200;
}

.dropdown-enter-from,
.dropdown-leave-to {
  @apply opacity-0 scale-95 transform;
}

.dropdown-enter-to,
.dropdown-leave-from {
  @apply opacity-100 scale-100 transform;
}

/* Dark theme adjustments */
.theme-dark .theme-toggle-button {
  @apply hover:bg-neutral-800 active:bg-neutral-700;
}

.theme-dark .dropdown-button {
  @apply bg-neutral-800 border-neutral-700 text-neutral-200;
  @apply hover:bg-neutral-700;
}

.theme-dark .dropdown-menu {
  @apply bg-neutral-800 border-neutral-700;
}

.theme-dark .dropdown-option {
  @apply text-neutral-200 hover:bg-neutral-700;
}

.theme-dark .dropdown-option.active {
  @apply bg-primary-900 text-primary-200;
}

.theme-dark .toggle-label,
.theme-dark .switch-label {
  @apply text-neutral-200;
}
</style>