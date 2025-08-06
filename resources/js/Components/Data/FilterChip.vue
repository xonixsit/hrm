<template>
  <div class="filter-chip">
    <!-- Select Filter Chip -->
    <BaseSelect
      v-if="filter.type === 'select'"
      :model-value="value"
      :options="filter.options"
      :placeholder="filter.label"
      size="sm"
      @update:model-value="handleChange"
    />
    
    <!-- Multi-Select Filter Chip -->
    <BaseMultiSelect
      v-else-if="filter.type === 'multiselect'"
      :model-value="value || []"
      :options="filter.options"
      :placeholder="filter.label"
      size="sm"
      @update:model-value="handleChange"
    />
    
    <!-- Toggle Filter Chip -->
    <button
      v-else-if="filter.type === 'toggle'"
      :class="getToggleClasses()"
      @click="handleToggle"
    >
      <Icon v-if="filter.icon" :name="filter.icon" class="w-4 h-4 mr-2" />
      {{ filter.label }}
      <Icon v-if="active" name="x" class="w-3 h-3 ml-2" @click.stop="handleClear" />
    </button>
    
    <!-- Date Range Filter Chip -->
    <DateRangePicker
      v-else-if="filter.type === 'daterange'"
      :model-value="value"
      :placeholder="filter.label"
      size="sm"
      @update:model-value="handleChange"
    />
    
    <!-- Default Text Filter Chip -->
    <div v-else class="text-filter-chip">
      <BaseInput
        :model-value="value"
        :placeholder="filter.label"
        size="sm"
        @update:model-value="handleChange"
      />
      <button
        v-if="value"
        @click="handleClear"
        class="clear-button"
        aria-label="Clear filter"
      >
        <Icon name="x" class="w-3 h-3" />
      </button>
    </div>
  </div>
</template>

<script setup>
import BaseSelect from '@/Components/Base/BaseSelect.vue';
import BaseMultiSelect from '@/Components/Base/BaseMultiSelect.vue';
import BaseInput from '@/Components/Base/BaseInput.vue';
import DateRangePicker from '@/Components/Base/DateRangePicker.vue';
import Icon from '@/Components/Base/Icon.vue';

const props = defineProps({
  filter: {
    type: Object,
    required: true
  },
  
  value: {
    type: [String, Number, Array, Object],
    default: null
  },
  
  active: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['change', 'clear']);

// Methods
const handleChange = (newValue) => {
  emit('change', props.filter.key, newValue);
};

const handleClear = () => {
  emit('clear', props.filter.key);
};

const handleToggle = () => {
  if (props.active) {
    handleClear();
  } else {
    handleChange(true);
  }
};

const getToggleClasses = () => [
  'toggle-chip',
  'inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-full',
  'border transition-colors duration-150',
  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
  {
    'bg-primary-100 text-primary-800 border-primary-200': props.active,
    'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50': !props.active
  }
];
</script>

<style scoped>
.filter-chip {
  @apply inline-block;
}

.text-filter-chip {
  @apply relative inline-block;
}

.clear-button {
  @apply absolute right-2 top-1/2 transform -translate-y-1/2;
  @apply p-1 rounded-sm text-neutral-400 hover:text-neutral-600;
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500;
}

.toggle-chip {
  @apply cursor-pointer;
}

/* Dark Theme */
.theme-dark .toggle-chip {
  @apply bg-neutral-700 text-neutral-200 border-neutral-600;
  @apply hover:bg-neutral-600;
}

.theme-dark .toggle-chip.active {
  @apply bg-primary-600 text-white border-primary-500;
}
</style>