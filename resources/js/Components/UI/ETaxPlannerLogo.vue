<template>
  <svg :class="className" viewBox="0 0 400 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Building/Document Icon -->
    <rect x="20" y="30" width="60" height="70" rx="4" fill="#2563eb" stroke="#1d4ed8" stroke-width="2"/>
    
    <!-- Building windows/lines -->
    <rect x="28" y="38" width="12" height="3" fill="white"/>
    <rect x="44" y="38" width="12" height="3" fill="white"/>
    <rect x="60" y="38" width="12" height="3" fill="white"/>
    
    <rect x="28" y="48" width="12" height="3" fill="white"/>
    <rect x="44" y="48" width="12" height="3" fill="white"/>
    <rect x="60" y="48" width="12" height="3" fill="white"/>
    
    <rect x="28" y="58" width="12" height="3" fill="white"/>
    <rect x="44" y="58" width="12" height="3" fill="white"/>
    <rect x="60" y="58" width="12" height="3" fill="white"/>
    
    <rect x="28" y="68" width="12" height="3" fill="white"/>
    <rect x="44" y="68" width="12" height="3" fill="white"/>
    <rect x="60" y="68" width="12" height="3" fill="white"/>
    
    <rect x="28" y="78" width="12" height="3" fill="white"/>
    <rect x="44" y="78" width="12" height="3" fill="white"/>
    <rect x="60" y="78" width="12" height="3" fill="white"/>
    
    <rect x="28" y="88" width="12" height="3" fill="white"/>
    <rect x="44" y="88" width="12" height="3" fill="white"/>
    <rect x="60" y="88" width="12" height="3" fill="white"/>
    
    <!-- Green Circle with Person -->
    <circle cx="95" cy="65" r="25" fill="#10b981"/>
    <circle cx="95" cy="58" r="8" fill="white"/>
    <path d="M95 68 C85 68, 85 78, 85 78 L105 78 C105 78, 105 68, 95 68 Z" fill="white"/>
    
    <!-- Text -->
    <text x="140" y="55" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#2563eb">E-Tax Planner</text>
    <text x="140" y="80" font-family="Arial, sans-serif" font-size="16" fill="#6b7280">HR Management Solution</text>
  </svg>
</template>

<script setup>
defineProps({
  className: {
    type: String,
    default: 'w-auto h-12'
  }
})
</script>