/**
 * Vue 3 Composable for Accessibility Features
 * Provides reactive accessibility utilities and helpers for Vue components
 */

import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import {
  ariaLiveManager,
  focusManager,
  KeyboardNavigation,
  ScreenReader,
  ColorAccessibility,
  AriaUtils
} from '@/utils/accessibility.js';

/**
 * Main accessibility composable
 */
export function useAccessibility() {
  // Reactive state
  const isHighContrast = ref(ColorAccessibility.isHighContrastMode());
  const prefersReducedMotion = ref(ColorAccessibility.prefersReducedMotion());
  const colorScheme = ref(ColorAccessibility.getColorSchemePreference());

  // Update reactive state when media queries change
  const updateMediaQueries = () => {
    isHighContrast.value = ColorAccessibility.isHighContrastMode();
    prefersReducedMotion.value = ColorAccessibility.prefersReducedMotion();
    colorScheme.value = ColorAccessibility.getColorSchemePreference();
  };

  // Set up media query listeners
  onMounted(() => {
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const lightQuery = window.matchMedia('(prefers-color-scheme: light)');

    const handleChange = () => updateMediaQueries();

    contrastQuery.addListener(handleChange);
    motionQuery.addListener(handleChange);
    darkQuery.addListener(handleChange);
    lightQuery.addListener(handleChange);

    // Cleanup function
    onUnmounted(() => {
      contrastQuery.removeListener(handleChange);
      motionQuery.removeListener(handleChange);
      darkQuery.removeListener(handleChange);
      lightQuery.removeListener(handleChange);
    });
  });

  return {
    // Reactive state
    isHighContrast,
    prefersReducedMotion,
    colorScheme,

    // Utility functions
    announce: ScreenReader.announce,
    announcePageChange: ScreenReader.announcePageChange,
    announceFormErrors: ScreenReader.announceFormErrors,
    announceLoading: ScreenReader.announceLoading,
    
    // Focus management
    setFocus: focusManager.setFocus.bind(focusManager),
    storeFocus: focusManager.storeFocus.bind(focusManager),
    restoreFocus: focusManager.restoreFocus.bind(focusManager),
    
    // ARIA utilities
    generateId: AriaUtils.generateId,
    setAriaAttribute: AriaUtils.setAriaAttribute,
    
    // Update functions
    updateMediaQueries
  };
}

/**
 * Focus management composable
 */
export function useFocusManagement() {
  const focusStack = ref([]);
  const currentTrap = ref(null);

  const storeFocus = (newFocusElement = null) => {
    const currentFocus = document.activeElement;
    focusStack.value.push(currentFocus);
    
    if (newFocusElement) {
      setFocus(newFocusElement);
    }
  };

  const restoreFocus = () => {
    const previousFocus = focusStack.value.pop();
    if (previousFocus && previousFocus !== document.body) {
      setFocus(previousFocus);
    }
  };

  const setFocus = (element, options = {}) => {
    return focusManager.setFocus(element, options);
  };

  const trapFocus = (container) => {
    if (currentTrap.value) {
      removeFocusTrap();
    }
    currentTrap.value = focusManager.trapFocus(container);
    return currentTrap.value;
  };

  const removeFocusTrap = () => {
    if (currentTrap.value) {
      currentTrap.value();
      currentTrap.value = null;
    }
  };

  const getFocusableElements = (container = document) => {
    return focusManager.getFocusableElements(container);
  };

  // Cleanup on unmount
  onUnmounted(() => {
    removeFocusTrap();
  });

  return {
    focusStack,
    storeFocus,
    restoreFocus,
    setFocus,
    trapFocus,
    removeFocusTrap,
    getFocusableElements
  };
}

/**
 * Keyboard navigation composable
 */
export function useKeyboardNavigation(elements, options = {}) {
  const currentIndex = ref(0);
  const isActive = ref(false);

  const handleKeyDown = (event) => {
    if (!isActive.value || !elements.value) return;

    const newIndex = KeyboardNavigation.handleArrowNavigation(
      event,
      elements.value,
      currentIndex.value,
      options
    );

    if (newIndex !== false && newIndex !== currentIndex.value) {
      currentIndex.value = newIndex;
      return true;
    }

    return false;
  };

  const handleTypeAhead = (event, getText) => {
    if (!isActive.value || !elements.value) return;

    const newIndex = KeyboardNavigation.handleTypeAhead(
      event,
      elements.value,
      getText
    );

    if (newIndex !== -1) {
      currentIndex.value = newIndex;
      return true;
    }

    return false;
  };

  const activate = () => {
    isActive.value = true;
  };

  const deactivate = () => {
    isActive.value = false;
  };

  const setCurrentIndex = (index) => {
    if (index >= 0 && index < elements.value?.length) {
      currentIndex.value = index;
    }
  };

  return {
    currentIndex,
    isActive,
    handleKeyDown,
    handleTypeAhead,
    activate,
    deactivate,
    setCurrentIndex
  };
}

/**
 * ARIA state management composable
 */
export function useAriaState() {
  const ariaAttributes = ref({});

  const setAriaAttribute = (key, value) => {
    if (value === null || value === undefined) {
      delete ariaAttributes.value[key];
    } else {
      ariaAttributes.value[key] = value;
    }
  };

  const setExpanded = (expanded) => {
    setAriaAttribute('aria-expanded', expanded);
  };

  const setSelected = (selected) => {
    setAriaAttribute('aria-selected', selected);
  };

  const setPressed = (pressed) => {
    setAriaAttribute('aria-pressed', pressed);
  };

  const setChecked = (checked) => {
    setAriaAttribute('aria-checked', checked);
  };

  const setDescribedBy = (ids) => {
    if (Array.isArray(ids)) {
      ids = ids.filter(Boolean).join(' ');
    }
    setAriaAttribute('aria-describedby', ids || null);
  };

  const setLabelledBy = (ids) => {
    if (Array.isArray(ids)) {
      ids = ids.filter(Boolean).join(' ');
    }
    setAriaAttribute('aria-labelledby', ids || null);
  };

  const generateId = (prefix = 'aria') => {
    return AriaUtils.generateId(prefix);
  };

  return {
    ariaAttributes,
    setAriaAttribute,
    setExpanded,
    setSelected,
    setPressed,
    setChecked,
    setDescribedBy,
    setLabelledBy,
    generateId
  };
}

/**
 * Screen reader announcements composable
 */
export function useScreenReader() {
  const announce = (message, priority = 'polite') => {
    ScreenReader.announce(message, priority);
  };

  const announcePageChange = (pageName, additionalInfo = '') => {
    ScreenReader.announcePageChange(pageName, additionalInfo);
  };

  const announceFormErrors = (errors) => {
    ScreenReader.announceFormErrors(errors);
  };

  const announceLoading = (isLoading, context = '') => {
    ScreenReader.announceLoading(isLoading, context);
  };

  const announceSuccess = (message) => {
    announce(`Success: ${message}`, 'polite');
  };

  const announceError = (message) => {
    announce(`Error: ${message}`, 'assertive');
  };

  const announceWarning = (message) => {
    announce(`Warning: ${message}`, 'assertive');
  };

  return {
    announce,
    announcePageChange,
    announceFormErrors,
    announceLoading,
    announceSuccess,
    announceError,
    announceWarning
  };
}

/**
 * Modal accessibility composable
 */
export function useModalAccessibility() {
  const { storeFocus, restoreFocus, trapFocus, removeFocusTrap } = useFocusManagement();
  const { announce } = useScreenReader();
  
  const isOpen = ref(false);
  const modalRef = ref(null);
  const titleId = ref(null);
  const descriptionId = ref(null);

  const openModal = async (title = '', description = '') => {
    if (isOpen.value) return;

    isOpen.value = true;
    
    // Store current focus
    storeFocus();
    
    // Wait for modal to be rendered
    await nextTick();
    
    if (modalRef.value) {
      // Set up focus trap
      trapFocus(modalRef.value);
      
      // Generate IDs for ARIA relationships
      if (title) {
        titleId.value = AriaUtils.generateId('modal-title');
      }
      if (description) {
        descriptionId.value = AriaUtils.generateId('modal-description');
      }
      
      // Announce modal opening
      announce(`Dialog opened${title ? ': ' + title : ''}`, 'assertive');
    }
  };

  const closeModal = () => {
    if (!isOpen.value) return;

    isOpen.value = false;
    
    // Remove focus trap
    removeFocusTrap();
    
    // Restore previous focus
    restoreFocus();
    
    // Announce modal closing
    announce('Dialog closed', 'assertive');
    
    // Clear IDs
    titleId.value = null;
    descriptionId.value = null;
  };

  const handleEscapeKey = (event) => {
    if (event.key === 'Escape' && isOpen.value) {
      event.preventDefault();
      closeModal();
    }
  };

  // Set up escape key listener
  onMounted(() => {
    document.addEventListener('keydown', handleEscapeKey);
  });

  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscapeKey);
    if (isOpen.value) {
      closeModal();
    }
  });

  return {
    isOpen,
    modalRef,
    titleId,
    descriptionId,
    openModal,
    closeModal,
    handleEscapeKey
  };
}

/**
 * Form accessibility composable
 */
export function useFormAccessibility() {
  const { announceFormErrors } = useScreenReader();
  const errors = ref({});
  const fieldIds = ref({});

  const generateFieldId = (fieldName) => {
    if (!fieldIds.value[fieldName]) {
      fieldIds.value[fieldName] = AriaUtils.generateId(`field-${fieldName}`);
    }
    return fieldIds.value[fieldName];
  };

  const setFieldError = (fieldName, error) => {
    if (error) {
      errors.value[fieldName] = error;
    } else {
      delete errors.value[fieldName];
    }
  };

  const clearErrors = () => {
    errors.value = {};
  };

  const hasErrors = computed(() => {
    return Object.keys(errors.value).length > 0;
  });

  const errorMessages = computed(() => {
    return Object.values(errors.value);
  });

  const announceErrors = () => {
    if (hasErrors.value) {
      announceFormErrors(errorMessages.value);
    }
  };

  const getFieldAriaAttributes = (fieldName) => {
    const fieldId = generateFieldId(fieldName);
    const hasError = errors.value[fieldName];
    
    const attributes = {
      id: fieldId,
      'aria-invalid': hasError ? 'true' : 'false'
    };

    if (hasError) {
      attributes['aria-describedby'] = `${fieldId}-error`;
    }

    return attributes;
  };

  return {
    errors,
    fieldIds,
    hasErrors,
    errorMessages,
    generateFieldId,
    setFieldError,
    clearErrors,
    announceErrors,
    getFieldAriaAttributes
  };
}

/**
 * Skip links composable
 */
export function useSkipLinks() {
  const skipLinks = ref([
    { href: '#main-content', label: 'Skip to main content' },
    { href: '#navigation', label: 'Skip to navigation' },
    { href: '#footer', label: 'Skip to footer' }
  ]);

  const addSkipLink = (href, label) => {
    skipLinks.value.push({ href, label });
  };

  const removeSkipLink = (href) => {
    const index = skipLinks.value.findIndex(link => link.href === href);
    if (index > -1) {
      skipLinks.value.splice(index, 1);
    }
  };

  const handleSkipLinkClick = (event, href) => {
    event.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      focusManager.setFocus(target);
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return {
    skipLinks,
    addSkipLink,
    removeSkipLink,
    handleSkipLinkClick
  };
}