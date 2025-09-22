<template>
  <!-- Desktop-only sidebar navigation -->
  <nav
    ref="sidebarRef"
    :class="[
      'sidebar-navigation flex flex-col h-screen fixed left-0 top-0 z-40 transition-all duration-300 ease-out',
      isDark ? 'bg-gray-900 border-r border-gray-800' : 'bg-white border-r border-gray-200',
      {
        'w-64': !isCollapsed,
        'w-16': isCollapsed
      }
    ]"
    v-if="isDesktop"
    role="navigation"
    aria-label="Main navigation"
    data-debug="sidebar-navigation-component"
    :data-sidebar-id="Math.random().toString(36).substr(2, 9)"
  >
    <!-- Header -->
    <div :class="[
      'flex items-center justify-between p-4 border-b',
      isDark ? 'border-gray-800' : 'border-gray-200'
    ]">
      <!-- App Title -->
      <div v-if="!isCollapsed" class="flex-1 min-w-0">
        <h1 :class="[
          'text-lg font-semibold truncate',
          isDark ? 'text-white' : 'text-gray-900'
        ]">
          {{ appName }}
        </h1>
        <p :class="[
          'text-sm truncate',
          isDark ? 'text-gray-400' : 'text-gray-500'
        ]">
          {{ appTagline }}
        </p>
      </div>

      <!-- Toggle Button -->
      <button
        @click="toggleCollapse"
        :class="[
          'p-2 rounded-lg transition-colors',
          isDark 
            ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
        ]"
        :aria-label="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
      >
        <!-- Desktop chevron toggle -->
        <svg 
          class="w-5 h-5 transition-transform duration-200" 
          :class="{ 'rotate-180': isCollapsed }"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </div>

    <!-- Navigation Menu -->
    <div class="flex-1 overflow-y-auto py-4">
      <div :class="['space-y-1', { 'px-3': !isCollapsed, 'px-2': isCollapsed }]">
        <div 
          v-for="item in navigationItems" 
          :key="item.id"
        >
          <button
            @click="() => handleNavigate(item)"
            :class="[
              'group w-full flex items-center text-left transition-all duration-200 relative',
              'rounded-lg',
              {
                'p-3 justify-center': isCollapsed,
                'px-3 py-2': !isCollapsed,
                // Active state
                'bg-blue-50 text-blue-700': isActiveItem(item) && !isDark,
                'bg-blue-900/20 text-blue-400': isActiveItem(item) && isDark,
                // Hover state
                'hover:bg-gray-50': !isActiveItem(item) && !isDark,
                'hover:bg-gray-800': !isActiveItem(item) && isDark,
                // Text color
                'text-gray-700': !isActiveItem(item) && !isDark,
                'text-gray-300': !isActiveItem(item) && isDark
              }
            ]"
            :title="isCollapsed ? item.label : ''"
          >
            <!-- Icon -->
            <div :class="[
              'flex-shrink-0 w-6 h-6 flex items-center justify-center overflow-hidden',
              { 'mr-3': !isCollapsed }
            ]" style="min-width: 24px; max-width: 24px; min-height: 24px; max-height: 24px;">
              <!-- Home Icon -->
              <svg v-if="item.icon === 'home'" class="w-5 h-5 max-w-5 max-h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 20px; height: 20px;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <!-- Users Icon -->
              <svg v-else-if="item.icon === 'users'" class="w-5 h-5 max-w-5 max-h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 20px; height: 20px;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <!-- Clock Icon -->
              <svg v-else-if="item.icon === 'clock'" class="w-5 h-5 max-w-5 max-h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 20px; height: 20px;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <!-- Calendar Icon -->
              <svg v-else-if="item.icon === 'calendar'" class="w-5 h-5 max-w-5 max-h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 20px; height: 20px;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <!-- Folder Icon -->
              <svg v-else-if="item.icon === 'folder'" class="w-5 h-5 max-w-5 max-h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 20px; height: 20px;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <!-- Chat Icon -->
              <svg v-else-if="item.icon === 'chat'" class="w-5 h-5 max-w-5 max-h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 20px; height: 20px;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <!-- Document Text Icon for Work Reports -->
              <svg v-else-if="item.icon === 'document-text'" class="w-5 h-5 max-w-5 max-h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 20px; height: 20px;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <!-- Check Circle Icon for Pending Approvals -->
              <svg v-else-if="item.icon === 'check-circle'" class="w-5 h-5 max-w-5 max-h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 20px; height: 20px;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <!-- Default Icon -->
              <svg v-else class="w-5 h-5 max-w-5 max-h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 20px; height: 20px;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <!-- Label -->
            <span 
              v-if="!isCollapsed" 
              class="font-medium truncate"
            >
              {{ item.label }}
            </span>

            <!-- Active indicator -->
            <div 
              v-if="isActiveItem(item)" 
              class="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-l"
            ></div>
          </button>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div :class="[
      'p-3 border-t space-y-1',
      isDark ? 'border-gray-800' : 'border-gray-200'
    ]">
      <!-- Settings -->
      <button
        @click="() => handleNavigate({ route: 'profile.edit', label: 'Settings' })"
        :class="[
          'group w-full flex items-center text-left transition-colors rounded-lg',
          {
            'p-3 justify-center': isCollapsed,
            'px-3 py-2': !isCollapsed
          },
          isDark 
            ? 'text-gray-300 hover:bg-gray-800 hover:text-white' 
            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
        ]"
        :title="isCollapsed ? 'Settings' : ''"
      >
        <div :class="[
          'flex-shrink-0 w-6 h-6 flex items-center justify-center',
          { 'mr-3': !isCollapsed }
        ]">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <span v-if="!isCollapsed" class="font-medium">Settings</span>
      </button>

      <!-- Logout -->
      <button
        @click="handleLogout"
        :class="[
          'group w-full flex items-center text-left transition-colors rounded-lg',
          {
            'p-3 justify-center': isCollapsed,
            'px-3 py-2': !isCollapsed
          },
          'text-red-600 hover:bg-red-50 hover:text-red-700'
        ]"
        :title="isCollapsed ? 'Logout' : ''"
      >
        <div :class="[
          'flex-shrink-0 w-6 h-6 flex items-center justify-center',
          { 'mr-3': !isCollapsed }
        ]">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </div>
        <span v-if="!isCollapsed" class="font-medium">Logout</span>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { router } from '@inertiajs/vue3';
import { useAuth } from '@/composables/useAuth.js';
import { useTheme } from '@/composables/useTheme.js';


const props = defineProps({
  currentRoute: {
    type: String,
    required: true,
  },
  initiallyCollapsed: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['navigate', 'collapse-change']);

// Composables
const { user, roles: userRoles } = useAuth();
const { isDark } = useTheme();

// Desktop-only detection - simplified for desktop-only component
const isDesktop = ref(false);

// State
const sidebarRef = ref(null);
const isCollapsed = ref(props.initiallyCollapsed);

// Simplified desktop detection - only renders on desktop (≥1024px)
const checkDesktop = () => {
  if (typeof window !== 'undefined') {
    isDesktop.value = window.innerWidth >= 1024;
  }
};

// App configuration
const appName = 'HR Management';
const appTagline = 'Streamline your workforce';

// Navigation items
const navigationItems = computed(() => {
  const roles = userRoles.value;
  const items = [];

  items.push({
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'home',
    route: 'dashboard',
  });

  if (roles.includes('Admin') || roles.includes('Manager')) {
    items.push({
      id: 'employees',
      label: 'Employee Management',
      icon: 'users',
      route: 'employees.index',
    });
  }

  items.push({
    id: 'attendance',
    label: 'Time Tracking',
    icon: 'clock',
    route: 'attendances.index',
  });

  items.push({
    id: 'leaves',
    label: 'Leave Management',
    icon: 'calendar',
    route: 'leaves.index',
  });

  // Add Leave Policies for Admin and HR roles
  if (roles.includes('Admin') || roles.includes('HR')) {
    items.push({
      id: 'leave-types',
      label: 'Leave Policies',
      icon: 'clipboard-document-list',
      route: 'leave-types.index',
    });
  }

  /*items.push({
    id: 'projects',
    label: 'Project Management',
    icon: 'folder',
    route: 'projects.index',
  });*/

  items.push({
    id: 'feedbacks',
    label: 'Feedback System',
    icon: 'chat',
    route: 'feedbacks.index',
  });

  items.push({
    id: 'work-reports',
    label: 'Work Reports',
    icon: 'document-text',
    route: 'work-reports.index',
  });

  // items.push({
  //   id: 'reports',
  //   label: 'Reports & Analytics',
  //   icon: 'chart-bar',
  //   route: 'reports.index',
  // });

  // Add Pending Approvals for Admin and Manager roles
  if (roles.includes('Admin') || roles.includes('Manager')) {
    items.push({
      id: 'pending-approvals',
      label: 'Pending Approvals',
      icon: 'check-circle',
      route: 'timesheets.pending-approvals',
    });
  }

  return items;
});

// Helper functions
const isActiveItem = (item) => {
  if (!item?.route || !props.currentRoute) return false;
  
  if (item.route === props.currentRoute) return true;
  
  const routeParts = item.route.split('.');
  const currentParts = props.currentRoute.split('.');
  
  return routeParts[0] === currentParts[0];
};



// Methods
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
  localStorage.setItem('sidebar-collapsed', isCollapsed.value.toString());
  emit('collapse-change', isCollapsed.value);
};

const handleNavigate = (item) => {
  emit('navigate', { route: item.route, item });
  
  if (item.route) {
    try {
      if (typeof window !== 'undefined' && window.route) {
        router.visit(window.route(item.route));
      } else {
        router.visit(`/${item.route.replace('.', '/')}`);
      }
    } catch (error) {
      console.warn(`Navigation failed for route: ${item.route}`, error);
    }
  }
};

const handleLogout = () => {
  try {
    if (typeof window !== 'undefined' && window.route) {
      router.post(window.route('logout'));
    } else {
      router.post('/logout');
    }
  } catch (error) {
    console.warn('Logout navigation failed:', error);
    window.location.href = '/logout';
  }
};

// Initialize desktop-only sidebar
onMounted(() => {
  // Initial desktop check
  checkDesktop();
  
  // DEBUG: Log component mounting with unique ID
  const componentId = Math.random().toString(36).substr(2, 9);
  console.log('[SidebarNavigation] Component mounted, isDesktop:', isDesktop.value, 'ID:', componentId);
  
  // Register component with conflict detector
  this.$conflictDetector.registerComponent('desktop', componentId);

  // Add resize listener for desktop detection
  window.addEventListener('resize', checkDesktop);
  
  // Load saved collapse state
  const savedCollapsed = localStorage.getItem('sidebar-collapsed');
  if (savedCollapsed !== null) {
    isCollapsed.value = savedCollapsed === 'true';
  }
  
  // Emit initial collapse state
  emit('collapse-change', isCollapsed.value);
});

// Cleanup
onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', checkDesktop);
  }
  // Unregister component from conflict detector
  this.$conflictDetector.unregisterComponent('desktop');
});
</script>

<style scoped>
/* Desktop-only sidebar navigation styles */



/* Smooth width transitions for collapse/expand */
.sidebar-navigation {
  transition: width 0.3s ease;
}

/* Desktop focus styles for keyboard navigation */
button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Consistent icon sizing for desktop */
.sidebar-navigation svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* Icon container sizing */
.sidebar-navigation .flex-shrink-0 {
  width: 24px;
  height: 24px;
  overflow: hidden;
}

/* Desktop scrollbar styling */
.sidebar-navigation::-webkit-scrollbar {
  width: 4px;
}

.sidebar-navigation::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-navigation::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 2px;
}

.sidebar-navigation::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.5);
}
</style>