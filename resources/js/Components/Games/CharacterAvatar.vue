<template>
  <div class="character-avatar-container" :style="{ width: size + 'px', height: size + 'px' }">
    <svg
      :width="size"
      :height="size"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      class="character-svg"
    >
      <!-- Male Professional -->
      <g v-if="character === 'male-professional'" class="character-group">
        <!-- Body - Suit -->
        <ellipse cx="50" cy="75" rx="18" ry="12" :fill="colors.suit" />
        <rect x="32" y="50" width="36" height="30" :fill="colors.suit" rx="3" />
        
        <!-- Tie -->
        <polygon points="50,50 47,50 45,75 55,75 53,50" :fill="colors.tie" />
        
        <!-- Shirt collar -->
        <path d="M 42 50 L 45 45 L 50 48 L 55 45 L 58 50" fill="white" stroke="#e5e7eb" stroke-width="0.5" />
        
        <!-- Arms -->
        <g class="arm-left">
          <rect x="28" y="52" width="8" height="22" :fill="colors.suit" rx="4" />
          <circle cx="32" cy="76" r="4" :fill="colors.skin" />
        </g>
        <g class="arm-right">
          <rect x="64" y="52" width="8" height="22" :fill="colors.suit" rx="4" />
          <circle cx="68" cy="76" r="4" :fill="colors.skin" />
        </g>
        
        <!-- Head -->
        <circle cx="50" cy="35" r="15" :fill="colors.skin" />
        
        <!-- Hair -->
        <path d="M 35 30 Q 35 20 50 20 Q 65 20 65 30 L 65 35 Q 60 28 50 28 Q 40 28 35 35 Z" :fill="colors.hair" />
        
        <!-- Eyes -->
        <g class="eyes">
          <ellipse cx="44" cy="35" rx="2" ry="3" fill="#1f2937" />
          <ellipse cx="56" cy="35" rx="2" ry="3" fill="#1f2937" />
          <circle cx="44.5" cy="34" r="0.8" fill="white" class="eye-glint" />
          <circle cx="56.5" cy="34" r="0.8" fill="white" class="eye-glint" />
        </g>
        
        <!-- Smile -->
        <path d="M 43 40 Q 50 43 57 40" stroke="#1f2937" stroke-width="1.5" fill="none" stroke-linecap="round" />
      </g>

      <!-- Female Professional -->
      <g v-else-if="character === 'female-professional'" class="character-group">
        <!-- Body - Blazer -->
        <ellipse cx="50" cy="75" rx="18" ry="12" :fill="colors.blazer" />
        <rect x="32" y="50" width="36" height="30" :fill="colors.blazer" rx="3" />
        
        <!-- Blouse -->
        <rect x="40" y="50" width="20" height="15" fill="#fef3c7" rx="2" />
        
        <!-- Necklace -->
        <ellipse cx="50" cy="50" rx="8" ry="2" fill="#fbbf24" opacity="0.8" />
        <circle cx="50" cy="52" r="2" fill="#fbbf24" />
        
        <!-- Arms -->
        <g class="arm-left">
          <rect x="28" y="52" width="8" height="20" :fill="colors.blazer" rx="4" />
          <circle cx="32" cy="74" r="4" :fill="colors.skin" />
        </g>
        <g class="arm-right">
          <rect x="64" y="52" width="8" height="20" :fill="colors.blazer" rx="4" />
          <circle cx="68" cy="74" r="4" :fill="colors.skin" />
        </g>
        
        <!-- Head -->
        <circle cx="50" cy="35" r="15" :fill="colors.skin" />
        
        <!-- Hair - Long with style -->
        <path d="M 35 30 Q 30 20 50 18 Q 70 20 65 30 L 65 40 Q 68 45 70 50 L 30 50 Q 32 45 35 40 Z" :fill="colors.hair" />
        <ellipse cx="35" cy="45" rx="5" ry="8" :fill="colors.hair" />
        <ellipse cx="65" cy="45" rx="5" ry="8" :fill="colors.hair" />
        
        <!-- Eyes with lashes -->
        <g class="eyes">
          <ellipse cx="44" cy="35" rx="2.5" ry="3.5" fill="#1f2937" />
          <ellipse cx="56" cy="35" rx="2.5" ry="3.5" fill="#1f2937" />
          <path d="M 42 32 Q 40 30 38 32" stroke="#1f2937" stroke-width="1" fill="none" />
          <path d="M 58 32 Q 60 30 62 32" stroke="#1f2937" stroke-width="1" fill="none" />
          <circle cx="44.5" cy="34" r="1" fill="white" class="eye-glint" />
          <circle cx="56.5" cy="34" r="1" fill="white" class="eye-glint" />
        </g>
        
        <!-- Smile with lipstick -->
        <path d="M 43 40 Q 50 43 57 40" stroke="#dc2626" stroke-width="2" fill="none" stroke-linecap="round" />
      </g>

      <!-- Young Male -->
      <g v-else-if="character === 'young-male'" class="character-group">
        <!-- Body - Casual T-shirt -->
        <ellipse cx="50" cy="75" rx="18" ry="12" :fill="colors.tshirt" />
        <rect x="32" y="50" width="36" height="30" :fill="colors.tshirt" rx="5" />
        
        <!-- T-shirt design -->
        <circle cx="50" cy="60" r="6" fill="white" opacity="0.3" />
        <text x="50" y="64" text-anchor="middle" font-size="8" fill="white" font-weight="bold">⚡</text>
        
        <!-- Arms -->
        <g class="arm-left">
          <rect x="26" y="52" width="10" height="20" :fill="colors.tshirt" rx="5" />
          <circle cx="31" cy="74" r="4" :fill="colors.skin" />
        </g>
        <g class="arm-right">
          <rect x="64" y="52" width="10" height="20" :fill="colors.tshirt" rx="5" />
          <circle cx="69" cy="74" r="4" :fill="colors.skin" />
        </g>
        
        <!-- Head -->
        <circle cx="50" cy="35" r="15" :fill="colors.skin" />
        
        <!-- Hair - Messy/Casual -->
        <path d="M 35 32 Q 32 22 40 20 Q 45 18 50 20 Q 55 18 60 20 Q 68 22 65 32" :fill="colors.hair" />
        <path d="M 38 28 Q 36 24 38 22" :fill="colors.hair" />
        <path d="M 50 22 Q 48 18 50 20" :fill="colors.hair" />
        <path d="M 62 28 Q 64 24 62 22" :fill="colors.hair" />
        
        <!-- Eyes -->
        <g class="eyes">
          <ellipse cx="44" cy="36" rx="2" ry="3" fill="#1f2937" />
          <ellipse cx="56" cy="36" rx="2" ry="3" fill="#1f2937" />
          <circle cx="44.5" cy="35" r="0.8" fill="white" class="eye-glint" />
          <circle cx="56.5" cy="35" r="0.8" fill="white" class="eye-glint" />
        </g>
        
        <!-- Smile -->
        <path d="M 42 41 Q 50 45 58 41" stroke="#1f2937" stroke-width="1.5" fill="none" stroke-linecap="round" />
      </g>

      <!-- Young Female -->
      <g v-else-if="character === 'young-female'" class="character-group">
        <!-- Body - Casual top -->
        <ellipse cx="50" cy="75" rx="18" ry="12" :fill="colors.top" />
        <rect x="32" y="50" width="36" height="30" :fill="colors.top" rx="5" />
        
        <!-- Top pattern -->
        <circle cx="42" cy="58" r="2" fill="white" opacity="0.4" />
        <circle cx="50" cy="62" r="2" fill="white" opacity="0.4" />
        <circle cx="58" cy="58" r="2" fill="white" opacity="0.4" />
        
        <!-- Arms -->
        <g class="arm-left">
          <rect x="26" y="52" width="10" height="20" :fill="colors.top" rx="5" />
          <circle cx="31" cy="74" r="4" :fill="colors.skin" />
        </g>
        <g class="arm-right">
          <rect x="64" y="52" width="10" height="20" :fill="colors.top" rx="5" />
          <circle cx="69" cy="74" r="4" :fill="colors.skin" />
        </g>
        
        <!-- Head -->
        <circle cx="50" cy="35" r="15" :fill="colors.skin" />
        
        <!-- Hair - Ponytail -->
        <ellipse cx="50" cy="30" rx="16" ry="14" :fill="colors.hair" />
        <ellipse cx="68" cy="35" rx="6" ry="10" :fill="colors.hair" />
        <path d="M 68 35 Q 75 35 78 40 Q 75 45 68 45" :fill="colors.hair" />
        
        <!-- Headband -->
        <ellipse cx="50" cy="25" rx="16" ry="3" fill="#ec4899" />
        
        <!-- Eyes -->
        <g class="eyes">
          <ellipse cx="44" cy="36" rx="2.5" ry="3.5" fill="#1f2937" />
          <ellipse cx="56" cy="36" rx="2.5" ry="3.5" fill="#1f2937" />
          <path d="M 42 32 Q 40 31 38 32" stroke="#1f2937" stroke-width="0.8" fill="none" />
          <path d="M 58 32 Q 60 31 62 32" stroke="#1f2937" stroke-width="0.8" fill="none" />
          <circle cx="44.5" cy="35" r="1" fill="white" class="eye-glint" />
          <circle cx="56.5" cy="35" r="1" fill="white" class="eye-glint" />
        </g>
        
        <!-- Smile -->
        <path d="M 43 41 Q 50 44 57 41" stroke="#dc2626" stroke-width="1.8" fill="none" stroke-linecap="round" />
      </g>

      <!-- Athlete Male -->
      <g v-else-if="character === 'athlete-male'" class="character-group">
        <!-- Body - Athletic wear -->
        <ellipse cx="50" cy="75" rx="16" ry="12" :fill="colors.athletic" />
        <rect x="34" y="50" width="32" height="30" :fill="colors.athletic" rx="4" />
        
        <!-- Athletic stripes -->
        <rect x="36" y="50" width="3" height="30" fill="white" opacity="0.3" />
        <rect x="61" y="50" width="3" height="30" fill="white" opacity="0.3" />
        
        <!-- Number on jersey -->
        <text x="50" y="68" text-anchor="middle" font-size="12" fill="white" font-weight="bold">7</text>
        
        <!-- Arms - Muscular -->
        <g class="arm-left">
          <rect x="24" y="52" width="12" height="22" :fill="colors.athletic" rx="6" />
          <ellipse cx="30" cy="64" rx="7" ry="5" :fill="colors.athletic" opacity="0.3" />
          <circle cx="30" cy="76" r="5" :fill="colors.skin" />
        </g>
        <g class="arm-right">
          <rect x="64" y="52" width="12" height="22" :fill="colors.athletic" rx="6" />
          <ellipse cx="70" cy="64" rx="7" ry="5" :fill="colors.athletic" opacity="0.3" />
          <circle cx="70" cy="76" r="5" :fill="colors.skin" />
        </g>
        
        <!-- Head -->
        <circle cx="50" cy="35" r="15" :fill="colors.skin" />
        
        <!-- Hair - Short athletic -->
        <path d="M 35 30 Q 35 22 50 20 Q 65 22 65 30 L 64 32 Q 58 26 50 26 Q 42 26 36 32 Z" :fill="colors.hair" />
        
        <!-- Sweatband -->
        <ellipse cx="50" cy="26" rx="16" ry="3" fill="#ef4444" />
        
        <!-- Eyes - Determined -->
        <g class="eyes">
          <ellipse cx="44" cy="36" rx="2" ry="2.5" fill="#1f2937" />
          <ellipse cx="56" cy="36" rx="2" ry="2.5" fill="#1f2937" />
          <path d="M 41 33 L 47 34" stroke="#1f2937" stroke-width="1.2" fill="none" />
          <path d="M 59 33 L 53 34" stroke="#1f2937" stroke-width="1.2" fill="none" />
          <circle cx="44.5" cy="35.5" r="0.8" fill="white" class="eye-glint" />
          <circle cx="56.5" cy="35.5" r="0.8" fill="white" class="eye-glint" />
        </g>
        
        <!-- Determined smile -->
        <path d="M 43 42 Q 50 44 57 42" stroke="#1f2937" stroke-width="1.5" fill="none" stroke-linecap="round" />
      </g>

      <!-- Athlete Female -->
      <g v-else-if="character === 'athlete-female'" class="character-group">
        <!-- Body - Athletic wear -->
        <ellipse cx="50" cy="75" rx="16" ry="12" :fill="colors.athletic" />
        <rect x="34" y="50" width="32" height="30" :fill="colors.athletic" rx="4" />
        
        <!-- Athletic design -->
        <path d="M 34 50 L 50 65 L 66 50" fill="white" opacity="0.2" />
        
        <!-- Arms - Toned -->
        <g class="arm-left">
          <rect x="24" y="52" width="12" height="20" :fill="colors.athletic" rx="6" />
          <circle cx="30" cy="74" r="5" :fill="colors.skin" />
        </g>
        <g class="arm-right">
          <rect x="64" y="52" width="12" height="20" :fill="colors.athletic" rx="6" />
          <circle cx="70" cy="74" r="5" :fill="colors.skin" />
        </g>
        
        <!-- Head -->
        <circle cx="50" cy="35" r="15" :fill="colors.skin" />
        
        <!-- Hair - High ponytail -->
        <ellipse cx="50" cy="30" rx="16" ry="13" :fill="colors.hair" />
        <ellipse cx="50" cy="15" rx="8" ry="12" :fill="colors.hair" />
        <path d="M 50 10 Q 48 5 50 8 Q 52 5 50 10" :fill="colors.hair" />
        
        <!-- Headband -->
        <ellipse cx="50" cy="25" rx="16" ry="3" fill="#8b5cf6" />
        
        <!-- Eyes - Focused -->
        <g class="eyes">
          <ellipse cx="44" cy="36" rx="2.5" ry="3" fill="#1f2937" />
          <ellipse cx="56" cy="36" rx="2.5" ry="3" fill="#1f2937" />
          <path d="M 41 33 L 47 34" stroke="#1f2937" stroke-width="1" fill="none" />
          <path d="M 59 33 L 53 34" stroke="#1f2937" stroke-width="1" fill="none" />
          <circle cx="44.5" cy="35" r="1" fill="white" class="eye-glint" />
          <circle cx="56.5" cy="35" r="1" fill="white" class="eye-glint" />
        </g>
        
        <!-- Confident smile -->
        <path d="M 43 41 Q 50 44 57 41" stroke="#dc2626" stroke-width="1.8" fill="none" stroke-linecap="round" />
      </g>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  character: {
    type: String,
    default: 'male-professional',
    validator: (value) => [
      'male-professional',
      'female-professional',
      'young-male',
      'young-female',
      'athlete-male',
      'athlete-female'
    ].includes(value)
  },
  size: {
    type: Number,
    default: 80
  }
});

const colors = computed(() => {
  const colorSchemes = {
    'male-professional': {
      skin: '#fbbf24',
      hair: '#1f2937',
      suit: '#1e40af',
      tie: '#dc2626'
    },
    'female-professional': {
      skin: '#fcd34d',
      hair: '#92400e',
      blazer: '#7c3aed'
    },
    'young-male': {
      skin: '#fde047',
      hair: '#78350f',
      tshirt: '#10b981'
    },
    'young-female': {
      skin: '#fef08a',
      hair: '#451a03',
      top: '#ec4899'
    },
    'athlete-male': {
      skin: '#fbbf24',
      hair: '#0f172a',
      athletic: '#2563eb'
    },
    'athlete-female': {
      skin: '#fde047',
      hair: '#422006',
      athletic: '#8b5cf6'
    }
  };

  return colorSchemes[props.character] || colorSchemes['male-professional'];
});
</script>

<style scoped>
.character-avatar-container {
  display: inline-block;
  position: relative;
}

.character-svg {
  display: block;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15));
}

.character-group {
  animation: characterIdle 3s ease-in-out infinite;
  transform-origin: center bottom;
}

@keyframes characterIdle {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-2px) scale(1.02);
  }
}

/* Arm animations */
.arm-left {
  animation: armSwingLeft 2s ease-in-out infinite;
  transform-origin: 32px 52px;
}

.arm-right {
  animation: armSwingRight 2s ease-in-out infinite;
  transform-origin: 68px 52px;
}

@keyframes armSwingLeft {
  0%, 100% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(-8deg);
  }
}

@keyframes armSwingRight {
  0%, 100% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(8deg);
  }
}

/* Eye animations */
.eyes {
  animation: blink 4s ease-in-out infinite;
}

@keyframes blink {
  0%, 48%, 52%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.1;
  }
}

.eye-glint {
  animation: glint 3s ease-in-out infinite;
}

@keyframes glint {
  0%, 90%, 100% {
    opacity: 1;
  }
  95% {
    opacity: 0.3;
  }
}

/* Hover effects */
.character-avatar-container:hover .character-group {
  animation: characterHover 0.6s ease-in-out;
}

@keyframes characterHover {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-8px) scale(1.1);
  }
}
</style>
