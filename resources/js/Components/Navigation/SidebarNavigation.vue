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
    <div class="flex-1 overflow-y-auto py-3 scrollbar-hide">
      <div :class="['space-y-0.5', { 'px-3': !isCollapsed, 'px-2': isCollapsed }]">
        <div 
          v-for="item in navigationItems" 
          :key="item.id"
        >
          <!-- Accordion Section -->
          <div v-if="item.type === 'accordion'" class="mb-1">
            <!-- Accordion Header -->
            <button
              @click="toggleAccordion(item.id)"
              :class="[
                'group w-full flex items-center justify-between text-left transition-all duration-200',
                'rounded-lg',
                {
                  'p-2.5': isCollapsed,
                  'px-3 py-1.5': !isCollapsed,
                  // Hover state
                  'hover:bg-gray-50': !isDark,
                  'hover:bg-gray-800': isDark,
                  // Text color
                  'text-gray-700 font-medium': !isDark,
                  'text-gray-300 font-medium': isDark
                }
              ]"
              :title="isCollapsed ? item.label : ''"
            >
              <div class="flex items-center">
                <!-- Accordion Icon -->
                <div :class="[
                  'flex-shrink-0 w-6 h-6 flex items-center justify-center',
                  { 'mr-3': !isCollapsed }
                ]">
                  <!-- Academic Cap Icon -->
                  <svg v-if="item.icon === 'academic-cap'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422A12.083 12.083 0 0112 21a12.083 12.083 0 01-6.16-10.422L12 14z" />
                  </svg>
                  <!-- Check Circle Icon -->
                  <svg v-else-if="item.icon === 'check-circle'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <!-- Default Icon -->
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                
                <!-- Accordion Label -->
                <span v-if="!isCollapsed" class="truncate">{{ item.label }}</span>
              </div>
              
              <!-- Expand/Collapse Arrow -->
              <svg 
                v-if="!isCollapsed"
                :class="[
                  'w-4 h-4 transition-transform duration-200',
                  { 'rotate-90': expandedSections.includes(item.id) }
                ]" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            <!-- Accordion Content -->
            <div 
              v-if="!isCollapsed && expandedSections.includes(item.id)"
              class="mt-1 ml-6 space-y-0.5"
            >
              <button
                v-for="child in item.children"
                :key="child.id"
                @click="() => handleNavigate(child)"
                :class="[
                  'group w-full flex items-center text-left transition-all duration-200',
                  'rounded-md px-3 py-1.5 text-sm',
                  {
                    // Active state
                    'bg-blue-50 text-blue-700': isActiveItem(child) && !isDark,
                    'bg-blue-900/20 text-blue-400': isActiveItem(child) && isDark,
                    // Hover state
                    'hover:bg-gray-50': !isActiveItem(child) && !isDark,
                    'hover:bg-gray-800': !isActiveItem(child) && isDark,
                    // Text color
                    'text-gray-600': !isActiveItem(child) && !isDark,
                    'text-gray-400': !isActiveItem(child) && isDark
                  }
                ]"
              >
                <!-- Child Icon -->
                <div class="flex-shrink-0 w-5 h-5 flex items-center justify-center mr-3">
                  <!-- Chart Pie Icon -->
                  <svg v-if="child.icon === 'chart-pie'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  </svg>
                  <!-- Clipboard Document Check Icon -->
                  <svg v-else-if="child.icon === 'clipboard-document-check'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 7l2 2 4-4" />
                  </svg>
                  <!-- Clipboard Document List Icon -->
                  <svg v-else-if="child.icon === 'clipboard-document-list'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <!-- Calendar Icon -->
                  <svg v-else-if="child.icon === 'calendar'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <!-- Cog Icon -->
                  <svg v-else-if="child.icon === 'cog-6-tooth'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <!-- Chart Bar Icon -->
                  <svg v-else-if="child.icon === 'chart-bar'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <!-- Clock Icon -->
                  <svg v-else-if="child.icon === 'clock'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <!-- Default Icon -->
                  <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                
                <!-- Child Label -->
                <span class="truncate">{{ child.label }}</span>
              </button>
            </div>
          </div>
          
          <!-- Regular Navigation Item -->
          <button
            v-else
            @click="() => handleNavigate(item)"
            :class="[
              'group w-full flex items-center text-left transition-all duration-200 relative',
              'rounded-lg',
              {
                'p-2.5 justify-center': isCollapsed,
                'px-3 py-1.5': !isCollapsed,
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
              
              <!-- Trophy Icon for Leaderboard -->
              <svg v-else-if="item.icon === 'trophy'" class="w-5 h-5 max-w-5 max-h-5" fill="currentColor" viewBox="0 0 24 24" style="width: 20px; height: 20px;">
                <path d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 0 0-.584.859 6.753 6.753 0 0 0 6.138 5.6 6.73 6.73 0 0 0 2.743 1.346A6.707 6.707 0 0 1 9.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 0 0-2.25 2.25c0 .414.336.75.75.75h9.284a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 0 1-1.112-3.173 6.73 6.73 0 0 0 2.743-1.347 6.753 6.753 0 0 0 6.139-5.6.75.75 0 0 0-.585-.858 47.077 47.077 0 0 0-3.07-.543V2.62a.75.75 0 0 0-.658-.744 49.22 49.22 0 0 0-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 0 0-.657.744Z" />
              </svg>
              <!-- Check Circle Icon for Pending Approvals -->
              <svg v-else-if="item.icon === 'check-circle'" class="w-5 h-5 max-w-5 max-h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 20px; height: 20px;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <!-- Academic Cap Icon for Competencies -->
              <svg v-else-if="item.icon === 'academic-cap'" class="w-5 h-5 max-w-5 max-h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 20px; height: 20px;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422A12.083 12.083 0 0112 21a12.083 12.083 0 01-6.16-10.422L12 14z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.06 10.538A12.04 12.04 0 0112 3.5a12.04 12.04 0 018.94 7.038" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10.538V14a9 9 0 01-9 8 9 9 0 01-9-8v-3.462" />
              </svg>
              <!-- Chart Pie Icon for Assessment Dashboard -->
              <svg v-else-if="item.icon === 'chart-pie'" class="w-5 h-5 max-w-5 max-h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 20px; height: 20px;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              <!-- Chart Bar Icon for Reports -->
              <svg v-else-if="item.icon === 'chart-bar'" class="w-5 h-5 max-w-5 max-h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 20px; height: 20px;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <!-- Chart Bar Square Icon for Organizational Analytics -->
              <svg v-else-if="item.icon === 'chart-bar-square'" class="w-5 h-5 max-w-5 max-h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 20px; height: 20px;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              <!-- Clipboard Document Check Icon for Assessments -->
              <svg v-else-if="item.icon === 'clipboard-document-check'" class="w-5 h-5 max-w-5 max-h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 20px; height: 20px;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 7l2 2 4-4" />
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
      'p-2 border-t space-y-1',
      isDark ? 'border-gray-800' : 'border-gray-200'
    ]">
      <!-- Settings -->
      <button
        @click="() => handleNavigate({ route: 'profile.edit', label: 'Settings' })"
        :class="[
          'group w-full flex items-center text-left transition-colors rounded-lg',
          {
            'p-2.5 justify-center': isCollapsed,
            'px-3 py-1.5': !isCollapsed
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
            'p-2.5 justify-center': isCollapsed,
            'px-3 py-1.5': !isCollapsed
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
import { computed, ref, onMounted, onUnmounted, h } from 'vue';
import { router } from '@inertiajs/vue3';
import { useAuth } from '@/composables/useAuth.js';
import { useTheme } from '@/composables/useTheme.js';
import { conflictDetector } from '@/services/NavigationConflictDetector.js';


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
const expandedSections = ref(['competency-section']); // Default expand competency section

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

  items.push({
    id: 'leaderboard',
    label: 'Performance Leaderboard',
    icon: 'trophy',
    route: 'work-reports.leaderboard',
  });

  // Add Organizational Analytics for Admin and Manager roles
  if (roles.includes('Admin') || roles.includes('Manager')) {
    items.push({
      id: 'organizational-analytics',
      label: 'Organizational Analytics',
      icon: 'chart-bar-square',
      route: 'organizational-analytics.index',
    });
  }

  // Competency Management Section (Accordion)
  items.push({
    id: 'competency-section',
    label: 'Competency Management',
    icon: 'academic-cap',
    type: 'accordion',
    children: [
      // For all users
      {
        id: 'my-assessments',
        label: 'My Assessments',
        icon: 'clipboard-document-check',
        route: 'competency-assessments.my-assessments',
      },
      // For Managers and Admins
      ...(roles.includes('Admin') || roles.includes('Manager') ? [
        {
          id: 'assessment-dashboard',
          label: 'Assessment Dashboard',
          icon: 'chart-pie',
          route: 'assessment-dashboard',
        },
        {
          id: 'all-assessments',
          label: 'All Assessments',
          icon: 'clipboard-document-list',
          route: 'competency-assessments.index',
        },
        {
          id: 'pending-assessments',
          label: 'Pending Assessments',
          icon: 'clipboard-document-check',
          route: 'competency-assessments.pending',
        }
      ] : []),
      // For Admins only
      ...(roles.includes('Admin') ? [
        {
          id: 'assessment-cycles',
          label: 'Assessment Cycles',
          icon: 'calendar',
          route: 'assessment-cycle-manager',
        },
        {
          id: 'competency-setup',
          label: 'Competency Setup',
          icon: 'cog-6-tooth',
          route: 'competencies.index',
        },
        {
          id: 'competency-reports',
          label: 'Reports & Analytics',
          icon: 'chart-bar',
          route: 'competency-analytics.reports',
        }
      ] : [])
    ]
  });

  // Approvals Section (for Managers and Admins)
  if (roles.includes('Admin') || roles.includes('Manager')) {
    items.push({
      id: 'approvals-section',
      label: 'Approvals',
      icon: 'check-circle',
      type: 'accordion',
      children: [
        {
          id: 'pending-timesheets',
          label: 'Timesheet Approvals',
          icon: 'clock',
          route: 'timesheets.pending-approvals',
        }
      ]
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
  console.log('Navigation clicked:', item);
  emit('navigate', { route: item.route, item });
  
  if (item.route) {
    try {
      console.log('Attempting navigation to:', item.route);
      if (typeof window !== 'undefined' && window.route) {
        router.visit(window.route(item.route));
      } else {
        const url = `/${item.route.replace('.', '/')}`;
        console.log('Navigating to URL:', url);
        router.visit(url);
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

// Accordion methods
const toggleAccordion = (sectionId) => {
  const index = expandedSections.value.indexOf(sectionId);
  if (index > -1) {
    expandedSections.value.splice(index, 1);
  } else {
    expandedSections.value.push(sectionId);
  }
};



// Component ID for conflict detection
const componentId = ref(`sidebar-${Math.random().toString(36).substr(2, 9)}`);

// Initialize desktop-only sidebar
onMounted(() => {
  // Initial desktop check
  checkDesktop();
  
  // DEBUG: Log component mounting with unique ID
  console.log('[SidebarNavigation] Component mounted, isDesktop:', isDesktop.value, 'ID:', componentId.value);
  
  // Register component with conflict detector
  conflictDetector.registerComponent(componentId.value, 'desktop');

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
  conflictDetector.unregisterComponent(componentId.value);
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

/* Hide scrollbar for navigation menu */
.scrollbar-hide {
  -ms-overflow-style: none;  /* Internet Explorer 10+ */
  scrollbar-width: none;  /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;  /* Safari and Chrome */
}
</style>