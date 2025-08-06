<template>
  <div class="user-preferences-trigger">
    <!-- Trigger Button -->
    <button
      @click="openPreferences"
      :class="[
        'inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
        'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        triggerClass
      ]"
      :title="triggerTitle"
    >
      <Icon
        :name="triggerIcon"
        :size="iconSize"
        class="flex-shrink-0"
      />
      <span v-if="showLabel" class="ml-2">
        {{ triggerLabel }}
      </span>
    </button>
    
    <!-- Preferences Modal -->
    <UserPreferences
      :is-open="isPreferencesOpen"
      @close="closePreferences"
      @save="handlePreferencesSave"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Icon from '@/Components/Base/Icon.vue';
import UserPreferences from './UserPreferences.vue';

const props = defineProps({
  /**
   * Icon for the trigger button
   */
  triggerIcon: {
    type: String,
    default: 'cog'
  },
  
  /**
   * Label for the trigger button
   */
  triggerLabel: {
    type: String,
    default: 'Preferences'
  },
  
  /**
   * Whether to show the label
   */
  showLabel: {
    type: Boolean,
    default: true
  },
  
  /**
   * Title attribute for the trigger button
   */
  triggerTitle: {
    type: String,
    default: 'Open user preferences'
  },
  
  /**
   * Icon size
   */
  iconSize: {
    type: String,
    default: 'md'
  },
  
  /**
   * Additional CSS classes for the trigger button
   */
  triggerClass: {
    type: [String, Array, Object],
    default: ''
  }
});

const emit = defineEmits(['preferences-opened', 'preferences-closed', 'preferences-saved']);

// Local state
const isPreferencesOpen = ref(false);

// Methods
const openPreferences = () => {
  isPreferencesOpen.value = true;
  emit('preferences-opened');
};

const closePreferences = () => {
  isPreferencesOpen.value = false;
  emit('preferences-closed');
};

const handlePreferencesSave = (preferences) => {
  emit('preferences-saved', preferences);
  closePreferences();
};
</script>

<style scoped>
/* Dark theme adjustments */
:global(.theme-dark) .user-preferences-trigger button {
  @apply text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100;
}
</style>