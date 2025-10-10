<template>
  <div class="rich-text-editor-wrapper" :class="wrapperClasses">
    <!-- Toolbar -->
    <div v-if="showToolbar" class="editor-toolbar">
      <div class="toolbar-group">
        <!-- Text Formatting -->
        <button
          v-for="format in textFormats"
          :key="format.command"
          @click="execCommand(format.command, format.value)"
          :class="getToolbarButtonClasses(format.command)"
          :title="format.title"
          type="button"
          tabindex="-1"
        >
          <component :is="format.icon" class="w-4 h-4" />
        </button>
      </div>

      <div class="toolbar-divider"></div>

      <div class="toolbar-group">
        <!-- Lists -->
        <button
          v-for="list in listFormats"
          :key="list.command"
          @click="execCommand(list.command)"
          :class="getToolbarButtonClasses(list.command)"
          :title="list.title"
          type="button"
          tabindex="-1"
        >
          <component :is="list.icon" class="w-4 h-4" />
        </button>
      </div>

      <div class="toolbar-divider"></div>

      <div class="toolbar-group">
        <!-- Utility -->
        <button
          @click="clearFormatting"
          class="toolbar-button"
          title="Clear Formatting"
          type="button"
          tabindex="-1"
        >
          <XMarkIcon class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Editor Container -->
    <div class="editor-container" :class="containerClasses">
      <!-- Content Editable Area -->
      <div
        ref="editorRef"
        :contenteditable="!disabled && !readonly"
        :class="editorClasses"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
        @paste="handlePaste"
        :aria-label="label || 'Rich text editor'"
        :aria-describedby="ariaDescribedBy"
        :aria-invalid="hasError"
        role="textbox"
        aria-multiline="true"
      ></div>

      <!-- Placeholder -->
      <div
        v-if="showPlaceholder"
        class="editor-placeholder"
        @click="focusEditor"
      >
        {{ placeholder }}
      </div>
    </div>

    <!-- Character Count / Help Text / Error Message -->
    <div v-if="showCharacterCount || helpText || errorMessage" class="editor-footer">
      <div class="footer-left">
        <p
          v-if="errorMessage"
          class="text-sm text-error-500"
          role="alert"
        >
          {{ errorMessage }}
        </p>
        <p
          v-else-if="helpText"
          class="text-sm text-neutral-500"
        >
          {{ helpText }}
        </p>
      </div>
      
      <!-- Character Count -->
      <div
        v-if="showCharacterCount"
        :class="characterCountClasses"
      >
        {{ characterCount }}{{ maxLength ? `/${maxLength}` : '' }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, nextTick, watch, onMounted } from 'vue'
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ListBulletIcon,
  NumberedListIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  // v-model
  modelValue: {
    type: String,
    default: ''
  },
  
  // Basic props
  label: {
    type: String,
    default: ''
  },
  
  placeholder: {
    type: String,
    default: 'Enter text...'
  },
  
  // Character limits
  minLength: {
    type: Number,
    default: 0
  },
  
  maxLength: {
    type: Number,
    default: null
  },
  
  showCharacterCount: {
    type: Boolean,
    default: false
  },
  
  // Features
  showToolbar: {
    type: Boolean,
    default: true
  },
  
  allowedFormats: {
    type: Array,
    default: () => ['bold', 'italic', 'underline', 'bulletList', 'orderedList']
  },
  
  // States
  disabled: {
    type: Boolean,
    default: false
  },
  
  readonly: {
    type: Boolean,
    default: false
  },
  
  required: {
    type: Boolean,
    default: false
  },
  
  // Validation
  errorMessage: {
    type: String,
    default: ''
  },
  
  helpText: {
    type: String,
    default: ''
  },
  
  // Styling
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  
  // Additional classes
  class: {
    type: [String, Array, Object],
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'change'])

// Refs
const editorRef = ref(null)
const isFocused = ref(false)

// Generate unique ID for accessibility
const editorId = computed(() => `rich-editor-${Math.random().toString(36).substr(2, 9)}`)

// Text formatting options
const textFormats = computed(() => [
  { command: 'bold', icon: BoldIcon, title: 'Bold', value: null },
  { command: 'italic', icon: ItalicIcon, title: 'Italic', value: null },
  { command: 'underline', icon: UnderlineIcon, title: 'Underline', value: null }
].filter(format => props.allowedFormats.includes(format.command)))

const listFormats = computed(() => [
  { command: 'insertUnorderedList', icon: ListBulletIcon, title: 'Bullet List' },
  { command: 'insertOrderedList', icon: NumberedListIcon, title: 'Numbered List' }
].filter(format => 
  (format.command === 'insertUnorderedList' && props.allowedFormats.includes('bulletList')) ||
  (format.command === 'insertOrderedList' && props.allowedFormats.includes('orderedList'))
))

// Computed properties
const textContent = computed(() => {
  if (!editorRef.value) return ''
  return editorRef.value.textContent || ''
})

const characterCount = computed(() => {
  return textContent.value.length
})

const isNearLimit = computed(() => {
  if (!props.maxLength) return false
  return characterCount.value > props.maxLength * 0.8
})

const isOverLimit = computed(() => {
  if (!props.maxLength) return false
  return characterCount.value > props.maxLength
})

const showPlaceholder = computed(() => {
  return !isFocused.value && (!props.modelValue || props.modelValue.trim() === '')
})

const hasError = computed(() => !!props.errorMessage)

const ariaDescribedBy = computed(() => {
  const ids = []
  if (hasError.value) ids.push(`${editorId.value}-error`)
  if (props.helpText && !hasError.value) ids.push(`${editorId.value}-help`)
  return ids.length > 0 ? ids.join(' ') : null
})

// Styling
const wrapperClasses = computed(() => [
  'rich-text-editor-wrapper',
  `rich-text-editor--${props.size}`,
  {
    'rich-text-editor--disabled': props.disabled,
    'rich-text-editor--readonly': props.readonly,
    'rich-text-editor--error': hasError.value,
    'rich-text-editor--focused': isFocused.value
  },
  props.class
])

const containerClasses = computed(() => [
  'editor-container',
  {
    'editor-container--focused': isFocused.value,
    'editor-container--error': hasError.value
  }
])

const editorClasses = computed(() => {
  const baseClasses = [
    'editor-content',
    'block w-full min-h-[120px] p-3 text-sm leading-6',
    'focus:outline-none'
  ]
  
  const sizeClasses = {
    sm: 'min-h-[80px] p-2 text-xs',
    md: 'min-h-[120px] p-3 text-sm',
    lg: 'min-h-[160px] p-4 text-base'
  }
  
  return [
    ...baseClasses,
    sizeClasses[props.size]
  ]
})

const characterCountClasses = computed(() => [
  'text-xs font-medium flex-shrink-0',
  {
    'text-neutral-500': !isNearLimit.value && !isOverLimit.value,
    'text-warning-600': isNearLimit.value && !isOverLimit.value,
    'text-error-600': isOverLimit.value
  }
])

// Methods
const execCommand = (command, value = null) => {
  if (props.disabled || props.readonly) return
  
  document.execCommand(command, false, value)
  editorRef.value?.focus()
  handleInput()
}

const clearFormatting = () => {
  if (props.disabled || props.readonly) return
  
  document.execCommand('removeFormat', false, null)
  editorRef.value?.focus()
  handleInput()
}

const getToolbarButtonClasses = (command) => {
  const baseClasses = [
    'toolbar-button',
    'flex items-center justify-center w-8 h-8 rounded transition-colors',
    'hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500'
  ]
  
  const isActive = document.queryCommandState && document.queryCommandState(command)
  
  return [
    ...baseClasses,
    {
      'bg-primary-100 text-primary-700': isActive,
      'text-neutral-600': !isActive
    }
  ]
}

const focusEditor = () => {
  editorRef.value?.focus()
}

const getHtmlContent = () => {
  return editorRef.value?.innerHTML || ''
}

const setHtmlContent = (html) => {
  if (editorRef.value) {
    editorRef.value.innerHTML = html
  }
}

const getTextContent = () => {
  return editorRef.value?.textContent || ''
}

// Event handlers
const handleInput = () => {
  const html = getHtmlContent()
  const text = getTextContent()
  
  // Enforce max length if specified
  if (props.maxLength && text.length > props.maxLength) {
    return // Don't update if over limit
  }
  
  emit('update:modelValue', html)
  emit('change', { html, text })
}

const handleFocus = () => {
  isFocused.value = true
  emit('focus')
}

const handleBlur = () => {
  isFocused.value = false
  emit('blur')
}

const handleKeydown = (event) => {
  // Handle keyboard shortcuts
  if (event.ctrlKey || event.metaKey) {
    switch (event.key) {
      case 'b':
        event.preventDefault()
        execCommand('bold')
        break
      case 'i':
        event.preventDefault()
        execCommand('italic')
        break
      case 'u':
        event.preventDefault()
        execCommand('underline')
        break
    }
  }
  
  // Prevent input if at max length
  if (props.maxLength && textContent.value.length >= props.maxLength) {
    // Allow backspace, delete, and navigation keys
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End']
    if (!allowedKeys.includes(event.key) && !event.ctrlKey && !event.metaKey) {
      event.preventDefault()
    }
  }
}

const handlePaste = (event) => {
  if (props.disabled || props.readonly) {
    event.preventDefault()
    return
  }
  
  // Get pasted content
  const paste = (event.clipboardData || window.clipboardData).getData('text/plain')
  
  // Check if pasting would exceed max length
  if (props.maxLength) {
    const currentLength = textContent.value.length
    const pasteLength = paste.length
    
    if (currentLength + pasteLength > props.maxLength) {
      event.preventDefault()
      
      // Insert only what fits
      const remainingSpace = props.maxLength - currentLength
      if (remainingSpace > 0) {
        const truncatedPaste = paste.substring(0, remainingSpace)
        document.execCommand('insertText', false, truncatedPaste)
      }
      
      return
    }
  }
  
  // Allow default paste behavior for plain text
  event.preventDefault()
  document.execCommand('insertText', false, paste)
}

// Public methods
const focus = () => {
  focusEditor()
}

const blur = () => {
  editorRef.value?.blur()
}

const insertText = (text) => {
  if (props.disabled || props.readonly) return
  
  document.execCommand('insertText', false, text)
  handleInput()
}

const selectAll = () => {
  if (editorRef.value) {
    const range = document.createRange()
    range.selectNodeContents(editorRef.value)
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
  }
}

// Expose methods
defineExpose({
  focus,
  blur,
  insertText,
  selectAll,
  getHtmlContent,
  setHtmlContent,
  getTextContent,
  editorRef
})

// Watch for value changes
watch(() => props.modelValue, (newValue) => {
  if (editorRef.value && getHtmlContent() !== newValue) {
    setHtmlContent(newValue || '')
  }
})

// Initialize content on mount
onMounted(() => {
  if (props.modelValue) {
    setHtmlContent(props.modelValue)
  }
})
</script>

<style scoped>
/* Base styles */
.rich-text-editor-wrapper {
  @apply w-full;
}

/* Toolbar styles */
.editor-toolbar {
  @apply flex items-center space-x-1 p-2 border-b border-neutral-200 bg-neutral-50;
}

.toolbar-group {
  @apply flex items-center space-x-1;
}

.toolbar-divider {
  @apply w-px h-6 bg-neutral-300 mx-2;
}

.toolbar-button {
  @apply flex items-center justify-center w-8 h-8 rounded transition-colors;
  @apply hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500;
  @apply text-neutral-600;
}

.toolbar-button:hover {
  @apply bg-white;
}

/* Editor container */
.editor-container {
  @apply relative border border-neutral-300 rounded-b-md bg-white;
}

.rich-text-editor-wrapper:not(.rich-text-editor--error) .editor-toolbar {
  @apply rounded-t-md;
}

.rich-text-editor-wrapper:not(.rich-text-editor--error) .editor-container {
  @apply border-t-0;
}

.editor-container--focused {
  @apply ring-2 ring-primary-500 border-primary-500;
}

.editor-container--error {
  @apply border-error-300 ring-2 ring-error-500;
}

/* Editor content */
.editor-content {
  @apply block w-full min-h-[120px] p-3 text-sm leading-6;
  @apply focus:outline-none resize-none;
  @apply text-neutral-900 placeholder-neutral-400;
}

.editor-content:empty:before {
  content: '';
  @apply block;
}

/* Placeholder */
.editor-placeholder {
  @apply absolute top-3 left-3 text-neutral-400 pointer-events-none;
  @apply text-sm leading-6;
}

/* Rich text formatting */
.editor-content :deep(strong),
.editor-content :deep(b) {
  @apply font-bold;
}

.editor-content :deep(em),
.editor-content :deep(i) {
  @apply italic;
}

.editor-content :deep(u) {
  @apply underline;
}

.editor-content :deep(ul) {
  @apply list-disc list-inside ml-4 space-y-1;
}

.editor-content :deep(ol) {
  @apply list-decimal list-inside ml-4 space-y-1;
}

.editor-content :deep(li) {
  @apply ml-2;
}

.editor-content :deep(p) {
  @apply mb-2;
}

.editor-content :deep(p:last-child) {
  @apply mb-0;
}

/* Footer */
.editor-footer {
  @apply flex justify-between items-start mt-1;
}

.footer-left {
  @apply flex-1;
}

/* Size variants */
.rich-text-editor--sm .editor-content {
  @apply min-h-[80px] p-2 text-xs;
}

.rich-text-editor--sm .editor-placeholder {
  @apply top-2 left-2 text-xs;
}

.rich-text-editor--lg .editor-content {
  @apply min-h-[160px] p-4 text-base;
}

.rich-text-editor--lg .editor-placeholder {
  @apply top-4 left-4 text-base;
}

/* State styles */
.rich-text-editor--disabled {
  @apply opacity-60 pointer-events-none;
}

.rich-text-editor--readonly .editor-content {
  @apply bg-neutral-50 cursor-default;
}

.rich-text-editor--error .editor-toolbar {
  @apply border-error-300 bg-error-50;
}

.rich-text-editor--error .toolbar-button {
  @apply text-error-600;
}

.rich-text-editor--error .toolbar-button:hover {
  @apply bg-error-100;
}

/* Focus styles */
.rich-text-editor--focused .editor-toolbar {
  @apply border-primary-300 bg-primary-50;
}

/* Dark theme support */
.theme-dark .editor-toolbar {
  @apply bg-neutral-800 border-neutral-700;
}

.theme-dark .toolbar-button {
  @apply text-neutral-400 hover:bg-neutral-700;
}

.theme-dark .editor-container {
  @apply bg-neutral-800 border-neutral-700;
}

.theme-dark .editor-content {
  @apply bg-neutral-800 text-neutral-100;
}

.theme-dark .editor-placeholder {
  @apply text-neutral-500;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .editor-toolbar {
    @apply flex-wrap gap-1;
  }
  
  .toolbar-group {
    @apply space-x-0.5;
  }
  
  .toolbar-button {
    @apply w-7 h-7;
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .toolbar-button,
  .editor-container {
    @apply transition-none;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .editor-container {
    @apply border-2;
  }
  
  .editor-container--focused {
    @apply ring-4;
  }
}
</style>