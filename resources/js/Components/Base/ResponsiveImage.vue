<template>
  <div :class="containerClasses">
    <img
      :src="optimizedSrc"
      :srcset="srcset"
      :sizes="sizes"
      :alt="alt"
      :loading="loading"
      :decoding="decoding"
      :class="imageClasses"
      :style="imageStyles"
      @load="handleLoad"
      @error="handleError"
      @loadstart="handleLoadStart"
    />
    
    <!-- Loading placeholder -->
    <div
      v-if="showPlaceholder && isLoading"
      :class="placeholderClasses"
    >
      <div class="placeholder-content">
        <Icon v-if="placeholderIcon" :name="placeholderIcon" class="placeholder-icon" />
        <div v-else class="placeholder-shimmer"></div>
      </div>
    </div>
    
    <!-- Error fallback -->
    <div
      v-if="hasError && showErrorFallback"
      :class="errorClasses"
    >
      <Icon name="photo" class="error-icon" />
      <span class="error-text">{{ errorText }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useResponsive } from '@/composables/useResponsive';
import { generateResponsiveImageSrcSet, getResponsiveImageSizes } from '@/utils/responsiveHelpers';
import Icon from './Icon.vue';

const props = defineProps({
  // Image source
  src: {
    type: String,
    required: true
  },
  
  // Alternative text
  alt: {
    type: String,
    required: true
  },
  
  // Responsive image configuration
  responsive: {
    type: Boolean,
    default: true
  },
  
  // Custom srcset (overrides automatic generation)
  srcset: {
    type: String,
    default: ''
  },
  
  // Custom sizes (overrides automatic generation)
  sizes: {
    type: String,
    default: ''
  },
  
  // Image sizes for srcset generation
  imageSizes: {
    type: Array,
    default: () => [320, 640, 768, 1024, 1280, 1920]
  },
  
  // Responsive sizes configuration
  responsiveSizes: {
    type: Object,
    default: () => ({
      mobile: '100vw',
      tablet: '50vw',
      desktop: '33vw'
    })
  },
  
  // Aspect ratio
  aspectRatio: {
    type: String,
    default: '',
    validator: (value) => !value || /^\d+\/\d+$/.test(value)
  },
  
  // Object fit
  objectFit: {
    type: String,
    default: 'cover',
    validator: (value) => ['cover', 'contain', 'fill', 'none', 'scale-down'].includes(value)
  },
  
  // Object position
  objectPosition: {
    type: String,
    default: 'center'
  },
  
  // Loading behavior
  loading: {
    type: String,
    default: 'lazy',
    validator: (value) => ['lazy', 'eager'].includes(value)
  },
  
  // Decoding behavior
  decoding: {
    type: String,
    default: 'async',
    validator: (value) => ['async', 'sync', 'auto'].includes(value)
  },
  
  // Placeholder configuration
  showPlaceholder: {
    type: Boolean,
    default: true
  },
  
  placeholderIcon: {
    type: String,
    default: ''
  },
  
  placeholderColor: {
    type: String,
    default: 'neutral-100'
  },
  
  // Error handling
  showErrorFallback: {
    type: Boolean,
    default: true
  },
  
  errorText: {
    type: String,
    default: 'Failed to load image'
  },
  
  // Styling
  rounded: {
    type: String,
    default: '',
    validator: (value) => !value || ['sm', 'md', 'lg', 'xl', 'full'].includes(value)
  },
  
  shadow: {
    type: String,
    default: '',
    validator: (value) => !value || ['sm', 'md', 'lg', 'xl'].includes(value)
  },
  
  // Size variants
  size: {
    type: String,
    default: 'auto',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl', 'auto'].includes(value)
  },
  
  // Custom width and height
  width: {
    type: [String, Number],
    default: null
  },
  
  height: {
    type: [String, Number],
    default: null
  },
  
  // Additional classes
  class: {
    type: [String, Array, Object],
    default: ''
  }
});

const emit = defineEmits(['load', 'error', 'loadstart']);

// Composables
const { isMobile, isTablet, isDesktop, deviceType } = useResponsive();

// Local state
const isLoading = ref(true);
const hasError = ref(false);

// Computed properties
const optimizedSrc = computed(() => {
  if (!props.responsive) return props.src;
  
  // Add device-specific optimizations
  const params = new URLSearchParams();
  
  // Add device type for server-side optimization
  params.set('device', deviceType.value);
  
  // Add pixel ratio for high DPI displays
  if (window.devicePixelRatio > 1) {
    params.set('dpr', Math.ceil(window.devicePixelRatio));
  }
  
  // Add format optimization
  if (supportsWebP()) {
    params.set('format', 'webp');
  }
  
  const separator = props.src.includes('?') ? '&' : '?';
  return `${props.src}${separator}${params.toString()}`;
});

const computedSrcset = computed(() => {
  if (props.srcset) return props.srcset;
  if (!props.responsive) return '';
  
  return generateResponsiveImageSrcSet(props.src, props.imageSizes);
});

const computedSizes = computed(() => {
  if (props.sizes) return props.sizes;
  if (!props.responsive) return '';
  
  return getResponsiveImageSizes(props.responsiveSizes);
});

const containerClasses = computed(() => [
  'responsive-image-container',
  'relative',
  'overflow-hidden',
  {
    'inline-block': props.size === 'auto',
    'w-16 h-16': props.size === 'xs',
    'w-24 h-24': props.size === 'sm',
    'w-32 h-32': props.size === 'md',
    'w-48 h-48': props.size === 'lg',
    'w-64 h-64': props.size === 'xl',
    [`rounded-${props.rounded}`]: props.rounded,
    [`shadow-${props.shadow}`]: props.shadow
  }
]);

const imageClasses = computed(() => [
  'responsive-image',
  'transition-opacity duration-300',
  {
    'opacity-0': isLoading.value || hasError.value,
    'opacity-100': !isLoading.value && !hasError.value,
    'w-full h-full': props.size !== 'auto',
    'img-responsive': props.size === 'auto'
  },
  props.class
]);

const imageStyles = computed(() => {
  const styles = {};
  
  if (props.aspectRatio) {
    styles.aspectRatio = props.aspectRatio.replace('/', ' / ');
  }
  
  if (props.objectFit) {
    styles.objectFit = props.objectFit;
  }
  
  if (props.objectPosition) {
    styles.objectPosition = props.objectPosition;
  }
  
  if (props.width) {
    styles.width = typeof props.width === 'number' ? `${props.width}px` : props.width;
  }
  
  if (props.height) {
    styles.height = typeof props.height === 'number' ? `${props.height}px` : props.height;
  }
  
  return styles;
});

const placeholderClasses = computed(() => [
  'absolute inset-0 flex items-center justify-center',
  `bg-${props.placeholderColor}`,
  'animate-pulse'
]);

const errorClasses = computed(() => [
  'absolute inset-0 flex flex-col items-center justify-center',
  'bg-neutral-100 text-neutral-500'
]);

// Methods
const supportsWebP = () => {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
};

const handleLoad = (event) => {
  isLoading.value = false;
  hasError.value = false;
  emit('load', event);
};

const handleError = (event) => {
  isLoading.value = false;
  hasError.value = true;
  emit('error', event);
};

const handleLoadStart = (event) => {
  isLoading.value = true;
  hasError.value = false;
  emit('loadstart', event);
};

// Initialize loading state
onMounted(() => {
  // If image is already cached, it might load immediately
  const img = new Image();
  img.onload = () => {
    isLoading.value = false;
  };
  img.src = optimizedSrc.value;
});
</script>

<style scoped>
.responsive-image-container {
  position: relative;
  display: inline-block;
}

.responsive-image {
  display: block;
  max-width: 100%;
  height: auto;
}

.placeholder-content {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.placeholder-icon {
  width: 2rem;
  height: 2rem;
  color: var(--color-neutral-400);
}

.placeholder-shimmer {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.error-icon {
  width: 2rem;
  height: 2rem;
  margin-bottom: 0.5rem;
}

.error-text {
  font-size: 0.75rem;
  text-align: center;
}

/* Responsive aspect ratios */
.responsive-image-container[data-aspect="1/1"] {
  aspect-ratio: 1 / 1;
}

.responsive-image-container[data-aspect="4/3"] {
  aspect-ratio: 4 / 3;
}

.responsive-image-container[data-aspect="16/9"] {
  aspect-ratio: 16 / 9;
}

.responsive-image-container[data-aspect="3/2"] {
  aspect-ratio: 3 / 2;
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .responsive-image-container {
    max-width: 100%;
  }
  
  .placeholder-icon {
    width: 1.5rem;
    height: 1.5rem;
  }
  
  .error-text {
    font-size: 0.625rem;
  }
}

/* High DPI optimizations */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .responsive-image {
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
</style>