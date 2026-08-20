<template>
  <div class="rich-editor-wrapper" :class="isDark ? 'dark' : ''">

    <!-- ── Formatting Toolbar ──────────────────────────────── -->
    <div
      class="toolbar flex items-center gap-0.5 px-2 py-1 border-b flex-wrap"
      :class="isDark
        ? 'bg-gray-700/50 border-gray-600'
        : 'bg-slate-50/80 border-slate-200'"
    >
      <!-- Bold -->
      <ToolBtn :active="states.bold" title="Bold (Ctrl+B)" @click="exec('bold')">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/></svg>
      </ToolBtn>

      <!-- Italic -->
      <ToolBtn :active="states.italic" title="Italic (Ctrl+I)" @click="exec('italic')">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z"/></svg>
      </ToolBtn>

      <!-- Underline -->
      <ToolBtn :active="states.underline" title="Underline (Ctrl+U)" @click="exec('underline')">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/></svg>
      </ToolBtn>

      <!-- Text Color -->
      <div class="relative color-picker-container">
        <button
          type="button"
          title="Text color"
          @click.stop="toggleColorPicker"
          class="w-7 h-7 flex items-center justify-center rounded-md transition-colors flex-shrink-0 text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600"
        >
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11 2L5.5 16h2.25l1.12-3h6.25l1.12 3H18.5L13 2h-2zm-1.38 9L12 4.67 14.38 11H9.62z"/>
            <rect x="3" y="19" width="18" height="3" rx="1" :fill="activeColor"/>
          </svg>
        </button>
        <!-- Color swatches dropdown -->
        <Teleport to="body">
          <div v-if="showColorPicker"
            ref="colorPickerRef"
            class="fixed p-2 rounded-xl shadow-xl border grid grid-cols-5 gap-1 w-36"
            :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'"
            :style="colorPickerStyle"
            style="z-index: 9999;"
            @click.stop
          >
            <button
              v-for="color in colors"
              :key="color"
              type="button"
              :style="{ background: color }"
              class="w-5 h-5 rounded-full border-2 hover:scale-110 transition-transform cursor-pointer"
              :class="activeColor === color ? 'border-teal-500' : 'border-transparent'"
              @click.stop="applyColor(color)"
              :title="color"
            />
          </div>
        </Teleport>
      </div>

      <!-- Strikethrough -->
      <ToolBtn :active="states.strikeThrough" title="Strikethrough" @click="exec('strikeThrough')">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z"/></svg>
      </ToolBtn>

      <Divider />

      <!-- Ordered list -->
      <ToolBtn :active="states.insertOrderedList" title="Numbered list" @click="exec('insertOrderedList')">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-8v2h14V3H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/></svg>
      </ToolBtn>

      <!-- Unordered list -->
      <ToolBtn :active="states.insertUnorderedList" title="Bullet list" @click="exec('insertUnorderedList')">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/></svg>
      </ToolBtn>

      <Divider />

      <!-- Blockquote -->
      <ToolBtn :active="false" title="Blockquote" @click="insertBlockquote">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/></svg>
      </ToolBtn>

      <!-- Link -->
      <ToolBtn :active="false" title="Insert link" @click="insertLink">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>
      </ToolBtn>

      <!-- Code -->
      <ToolBtn :active="false" title="Inline code" @click="insertCode">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>
      </ToolBtn>

      <Divider />

      <!-- Image Upload -->
      <ToolBtn :active="false" title="Upload image" @click="triggerImageUpload">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
      </ToolBtn>
      <input
        ref="imageInputRef"
        type="file"
        accept="image/*"
        class="hidden"
        @change="onImageSelected"
      />

      <Divider />

      <!-- More (clear formatting) -->
      <ToolBtn :active="false" title="Clear formatting" @click="exec('removeFormat')">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M3.27 5L2 6.27l6.97 6.97L6.5 19h3l1.57-3.66L16.73 21 18 19.73 3.27 5zM6 5v.18L8.82 8h2.4l-.72 1.68 2.1 2.1L14.21 8H20V5H6z"/></svg>
      </ToolBtn>
    </div>

    <!-- ── Editable Area ──────────────────────────────────── -->
    <div
      ref="editorRef"
      contenteditable="true"
      :data-placeholder="placeholder"
      class="editor-content"
      :class="[
        'min-h-[36px] max-h-32 overflow-y-auto px-3 py-2 text-sm leading-relaxed outline-none',
        isDark ? 'text-white' : 'text-slate-800',
        isEmpty ? 'empty' : ''
      ]"
      @input="onInput"
      @keydown="onKeydown"
      @mouseup="updateStates"
      @keyup="updateStates"
      @mousedown="saveSelection"
      @paste="onPaste"
    ></div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, defineComponent, h } from 'vue';

// ── Tiny internal components ────────────────────────────────────────────────
const ToolBtn = defineComponent({
  props: { active: Boolean, title: String },
  emits: ['click'],
  setup(props, { slots, emit }) {
    return () => h('button', {
      type: 'button',
      title: props.title,
      onClick: (e) => { 
        e.preventDefault(); 
        e.stopPropagation();
        emit('click'); 
      },
      class: [
        'w-7 h-7 flex items-center justify-center rounded-md transition-colors flex-shrink-0',
        props.active
          ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300'
          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600',
      ].join(' '),
    }, slots.default?.());
  },
});

const Divider = defineComponent({
  setup() {
    return () => h('span', {
      class: 'w-px h-4 bg-slate-200 dark:bg-gray-600 mx-0.5 flex-shrink-0',
    });
  },
});

// ── Props / Emits ───────────────────────────────────────────────────────────
const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Type a message…' },
  isDark: { type: Boolean, default: false },
  conversationId: { type: [Number, String], required: false, default: null },
});

const emit = defineEmits(['update:modelValue', 'send', 'input']);

// ── Refs ────────────────────────────────────────────────────────────────────
const editorRef = ref(null);
const colorPickerRef = ref(null);
const imageInputRef = ref(null);
const isEmpty = ref(true);
const showColorPicker = ref(false);
const activeColor = ref('#ef4444');
const colorPickerStyle = ref({});
let savedRange = null; // saved selection before color picker opens
let colorPickerRange = null; // specific range captured when color picker opens

const states = ref({
  bold: false,
  italic: false,
  underline: false,
  strikeThrough: false,
  insertOrderedList: false,
  insertUnorderedList: false,
});

const colors = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280', '#000000',
];

// ── Sync external → editor ──────────────────────────────────────────────────
watch(() => props.modelValue, (val) => {
  if (!editorRef.value) return;
  if (val === '' && editorRef.value.innerHTML !== '') {
    editorRef.value.innerHTML = '';
    isEmpty.value = true;
  }
}, { immediate: false });

// ── Lifecycle ───────────────────────────────────────────────────────────────
onMounted(() => {
  if (editorRef.value && props.modelValue) {
    editorRef.value.innerHTML = props.modelValue;
    isEmpty.value = false;
  }
  // Close color picker when clicking outside
  document.addEventListener('click', (e) => {
    if (showColorPicker.value) {
      showColorPicker.value = false;
    }
  });
});

// ── Commands ────────────────────────────────────────────────────────────────
function saveSelection() {
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    savedRange = sel.getRangeAt(0).cloneRange();
  }
}

function restoreSelection() {
  if (!savedRange) return;
  editorRef.value?.focus();
  const sel = window.getSelection();
  if (sel) {
    sel.removeAllRanges();
    sel.addRange(savedRange);
  }
}

function exec(cmd, value = null) {
  editorRef.value?.focus();
  document.execCommand(cmd, false, value);
  updateStates();
  emitValue();
}

function updateStates() {
  Object.keys(states.value).forEach(cmd => {
    states.value[cmd] = document.queryCommandState(cmd);
  });
  // Keep savedRange in sync with every cursor move so it's always fresh
  saveSelection();
}

function toggleColorPicker(e) {
  e.stopPropagation(); // Prevent the document click listener from immediately closing it
  if (!showColorPicker.value) {
    // Capture the current selection specifically for the color picker
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      colorPickerRange = sel.getRangeAt(0).cloneRange();
    } else {
      colorPickerRange = null;
    }
    
    // Calculate position for the color picker
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    colorPickerStyle.value = {
      top: `${rect.top - 100}px`, // Position above the button
      left: `${rect.left}px`,
    };
  }
  showColorPicker.value = !showColorPicker.value;
}

function applyColor(color) {
  activeColor.value = color;
  showColorPicker.value = false;
  
  // Use the range captured when color picker opened
  if (!colorPickerRange) {
    editorRef.value?.focus();
    return;
  }
  
  // Focus editor and restore the captured range
  editorRef.value?.focus();
  
  const sel = window.getSelection();
  if (!sel) return;
  
  sel.removeAllRanges();
  sel.addRange(colorPickerRange);
  
  const range = colorPickerRange.cloneRange();
  
  // If selection is collapsed (just a cursor), insert colored span for next typing
  if (range.collapsed) {
    const span = document.createElement('span');
    span.style.color = color;
    span.className = 'colored-text';
    span.textContent = '\u200B'; // Zero-width space
    range.insertNode(span);
    
    // Move cursor after the zero-width space so typing continues in color
    range.setStartAfter(span.firstChild);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  } else {
    // Wrap selected text in a colored span
    const selectedText = range.extractContents();
    const span = document.createElement('span');
    span.style.color = color;
    span.className = 'colored-text';
    span.appendChild(selectedText);
    range.insertNode(span);
    
    // Move cursor after the span
    range.setStartAfter(span);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }
  
  // Clear the saved range
  colorPickerRange = null;
  
  updateStates();
  emitValue();
}

function insertBlockquote() {
  editorRef.value?.focus();
  const sel = window.getSelection();
  if (!sel?.rangeCount) return;
  
  const range = sel.getRangeAt(0);
  const selectedText = range.toString().trim();
  
  // If no text is selected, don't insert anything - just toggle blockquote format
  if (!selectedText) {
    // Try to use formatBlock command for blockquote
    document.execCommand('formatBlock', false, 'blockquote');
    emitValue();
    return;
  }
  
  // If text is selected, wrap it in a blockquote
  const bq = document.createElement('blockquote');
  bq.textContent = selectedText;
  range.deleteContents();
  range.insertNode(bq);
  
  // Move cursor after the blockquote
  range.setStartAfter(bq);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
  
  emitValue();
}

function insertLink() {
  const url = prompt('Enter URL:', 'https://');
  if (!url) return;
  editorRef.value?.focus();
  const sel = window.getSelection();
  const text = sel?.toString() || url;
  exec('insertHTML', `<a href="${url}" target="_blank" rel="noopener noreferrer" class="rt-link">${text}</a>`);
}

function insertCode() {
  editorRef.value?.focus();
  const sel = window.getSelection();
  const text = sel?.toString() || 'code';
  exec('insertHTML', `<code class="rt-code">${text}</code>`);
}

function triggerImageUpload() {
  // Save the current cursor position before opening file dialog
  saveSelection();
  imageInputRef.value?.click();
}

function onImageSelected(event) {
  event.preventDefault();
  event.stopPropagation();
  
  const file = event.target.files?.[0];
  if (file) {
    // Restore cursor position before uploading
    restoreSelection();
    handleImageUpload(file);
  }
  // Clear the input so the same file can be selected again
  if (imageInputRef.value) {
    imageInputRef.value.value = '';
  }
}

// ── Input handling ──────────────────────────────────────────────────────────
function onInput() {
  // Check if editor has text OR images
  const hasText = editorRef.value?.innerText?.trim() !== '';
  const hasImages = editorRef.value?.querySelector('img') !== null;
  isEmpty.value = !hasText && !hasImages;
  emitValue();
}

function emitValue() {
  const html = editorRef.value?.innerHTML ?? '';
  emit('update:modelValue', html);
  emit('input', html);
}

// Handle pasting text and images
function onPaste(e) {
  e.preventDefault();
  
  // Check for images first
  const items = e.clipboardData?.items;
  if (items) {
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          handleImageUpload(blob);
          return; // Exit after handling image
        }
      }
    }
  }
  
  // If no image, paste text only (strip HTML)
  const text = e.clipboardData?.getData('text/plain') ?? '';
  document.execCommand('insertText', false, text);
}

// Handle image upload and insertion
async function handleImageUpload(file) {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    console.error('Invalid file type');
    return;
  }
  
  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    alert('Image size should not exceed 5MB');
    return;
  }
  
  // Check if conversation_id is provided
  if (!props.conversationId) {
    console.error('Cannot upload image: conversationId prop is:', props.conversationId);
    alert('Cannot upload image: Please open a conversation first');
    return;
  }
  
  try {
    // Create FormData for upload
    const formData = new FormData();
    formData.append('image', file);
    formData.append('conversation_id', props.conversationId);
    
    console.log('Uploading image for conversation:', props.conversationId);
    
    // Insert placeholder while uploading
    const placeholderId = 'img-' + Date.now();
    const placeholder = `<span id="${placeholderId}" class="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"><svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Uploading...</span>`;
    
    // Focus editor and ensure we have a valid cursor position
    editorRef.value?.focus();
    
    // If no saved range or editor not focused, append to end
    if (!savedRange || !document.activeElement || document.activeElement !== editorRef.value) {
      editorRef.value?.insertAdjacentHTML('beforeend', placeholder);
    } else {
      // Insert at saved cursor position
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRange);
        document.execCommand('insertHTML', false, placeholder);
      } else {
        editorRef.value?.insertAdjacentHTML('beforeend', placeholder);
      }
    }
    
    emitValue();
    
    // Upload to server
    const response = await axios.post(route('team-messaging.upload-image'), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (response.data.success && response.data.url) {
      // Replace placeholder with actual image
      const placeholderEl = editorRef.value?.querySelector(`#${placeholderId}`);
      if (placeholderEl) {
        const img = document.createElement('img');
        img.src = response.data.url;
        img.alt = 'Uploaded image';
        img.className = 'rt-image max-w-full h-auto rounded-lg my-2';
        img.style.maxHeight = '300px';
        placeholderEl.replaceWith(img);
      }
      // Update isEmpty state
      isEmpty.value = false;
    } else {
      // Remove placeholder on failure
      const placeholderEl = editorRef.value?.querySelector(`#${placeholderId}`);
      if (placeholderEl) {
        placeholderEl.remove();
      }
      alert('Failed to upload image');
    }
    
    emitValue();
  } catch (error) {
    console.error('Image upload error:', error);
    // Remove placeholder on error
    const placeholderEl = editorRef.value?.querySelector(`#${placeholderId}`);
    if (placeholderEl) {
      placeholderEl.remove();
    }
    alert('Failed to upload image. Please try again.');
    emitValue();
  }
}

function onKeydown(e) {
  // Ctrl+B/I/U handled natively by contenteditable
  // Enter = send (no shift), Shift+Enter = newline
  // BUT: if inside a list, Enter should create a new list item, not send
  if (e.key === 'Enter' && !e.shiftKey) {
    // Check if cursor is inside a list (ul or ol)
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      let node = sel.anchorNode;
      // Walk up the DOM tree to check if we're inside a list
      while (node && node !== editorRef.value) {
        if (node.nodeName === 'LI' || node.nodeName === 'UL' || node.nodeName === 'OL') {
          // Inside a list - let the browser handle creating new list item
          return; // Don't prevent default, don't send
        }
        node = node.parentNode;
      }
    }
    // Not inside a list - send the message
    e.preventDefault();
    emit('send');
  }
}

// ── Public API (via template ref) ───────────────────────────────────────────
function focus() {
  editorRef.value?.focus();
}

function clear() {
  if (editorRef.value) editorRef.value.innerHTML = '';
  isEmpty.value = true;
  emit('update:modelValue', '');
}

function getHTML() {
  return editorRef.value?.innerHTML ?? '';
}

function getTextContent() {
  return editorRef.value?.innerText?.trim() ?? '';
}

// Insert emoji text at cursor
function insertAtCursor(text) {
  editorRef.value?.focus();
  document.execCommand('insertText', false, text);
  emitValue();
}

defineExpose({ focus, clear, getHTML, getTextContent, insertAtCursor });
</script>

<style scoped>
.rich-editor-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* Placeholder via pseudo-element */
.editor-content.empty:before {
  content: attr(data-placeholder);
  color: #94a3b8;
  pointer-events: none;
  position: absolute;
}

.editor-content {
  position: relative;
  word-break: break-word;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.dark .editor-content.empty:before {
  color: #6b7280;
}

.dark .editor-content {
  caret-color: #5eead4;
}

/* Rich text styles rendered inside the editor */
.editor-content :deep(b),
.editor-content :deep(strong) { font-weight: 700; }

.editor-content :deep(i),
.editor-content :deep(em) { font-style: italic; }

.editor-content :deep(u) { text-decoration: underline; }

.editor-content :deep(s),
.editor-content :deep(strike) { text-decoration: line-through; }

.editor-content :deep(blockquote) {
  border-left: 3px solid #14b8a6;
  padding-left: 10px;
  margin: 4px 0;
  color: inherit;
  opacity: 0.85;
  font-style: italic;
}

.editor-content :deep(ul) {
  list-style: disc;
  padding-left: 1.25rem;
  margin: 2px 0;
}

.editor-content :deep(ol) {
  list-style: decimal;
  padding-left: 1.25rem;
  margin: 2px 0;
}

.editor-content :deep(a.rt-link) {
  color: #0ea5e9;
  text-decoration: underline;
  cursor: pointer;
}

.editor-content :deep(code.rt-code) {
  font-family: ui-monospace, monospace;
  background: rgba(0,0,0,0.08);
  border-radius: 3px;
  padding: 1px 4px;
  font-size: 0.85em;
}

.dark .editor-content :deep(code.rt-code) {
  background: rgba(255,255,255,0.12);
}

.editor-content :deep(.colored-text) {
  /* Ensure colored text inherits parent font properties */
  font-family: inherit;
  font-size: inherit;
}

.editor-content :deep(img.rt-image) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 8px 0;
  display: block;
}
</style>
