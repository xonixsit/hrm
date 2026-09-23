<template>
  <AuthenticatedLayout>
    <Head title="Employee Directory" />

    <div class="min-h-screen bg-neutral-50">
      <!-- Page Container -->
      <div class="w-full px-4 sm:px-6 lg:px-8 py-8">
        
        <!-- Header Badge -->
        <!-- <div class="text-center mb-8">
          <div class="inline-flex items-center px-4 py-2 bg-teal-50 text-teal-700 rounded-full text-sm font-medium border border-teal-200">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            Our People
          </div>
        </div> -->

        <!-- Main Content Card -->
        <Teleport to="body" :disabled="!isFullScreen">
        <div
          :class="isFullScreen
            ? 'fixed inset-0 z-[2000] flex flex-col bg-white overflow-hidden'
            : 'bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden'"
          @keydown.left.prevent="prevPage"
          @keydown.right.prevent="nextPage"
          @keydown.escape="isFullScreen = false"
          :tabindex="0"
          ref="cardRef"
        >
          
          <!-- Page Header -->
          <div class="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4 sm:px-8 sm:py-5 flex-shrink-0">
            <div class="flex items-center text-white">
              <!-- Employee photo for employee pages, icon for company pages -->
              <div class="mr-3 sm:mr-4 flex-shrink-0">
                <div v-if="currentPage >= 3 && pages[currentPage].employee" class="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-[3px] border-white/60 bg-white/20 shadow-md">
                  <img
                    :src="pages[currentPage].employee.image"
                    :alt="pages[currentPage].employee.name"
                    class="w-full h-full object-cover"
                    @error="handleImageError"
                  />
                </div>
                <div v-else-if="pages[currentPage].icon" class="w-6 h-6 sm:w-7 sm:h-7">
                  <component :is="'div'" v-html="pages[currentPage].icon" class="w-full h-full"></component>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <h1 class="text-xl sm:text-2xl font-bold truncate">{{ pages[currentPage].title }}</h1>
                <p v-if="pages[currentPage].subtitle" class="text-teal-100 text-xs sm:text-sm mt-0.5 truncate">{{ pages[currentPage].subtitle }}</p>
              </div>
              <!-- Fullscreen toggle button (always visible in header) -->
              <button
                @click="toggleFullScreen"
                class="ml-4 p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors flex-shrink-0"
                :title="isFullScreen ? 'Exit fullscreen (Esc)' : 'Enter fullscreen'"
              >
                <!-- Exit fullscreen: show "Exit" label with X icon -->
                <span v-if="isFullScreen" class="flex items-center gap-1 text-white text-xs font-semibold px-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                  Exit
                </span>
                <!-- Enter fullscreen icon -->
                <svg v-else class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Page Content -->
          <div :class="isFullScreen ? 'flex-1 overflow-y-auto p-6 sm:p-8' : 'p-6 sm:p-8 min-h-[500px]'">
            
            <!-- Company Journey Page -->
            <div v-if="currentPage === 0" class="flex flex-col sm:flex-row gap-6 h-full">

              <!-- Left: content fills full height evenly -->
              <div class="flex-1 flex flex-col justify-between gap-4">

                <!-- Intro headline -->
                <div>
                  <p class="text-xs font-semibold tracking-widest uppercase text-teal-600 mb-1">Est. 2012</p>
                  <h2 class="text-2xl font-extrabold text-neutral-900 leading-snug">The Genesis of a Relentless Journey</h2>
                </div>

                <!-- Timeline — connecting line + bigger text -->
                <div class="relative flex flex-col gap-0">
                  <!-- vertical connector line -->
                  <div class="absolute left-4 top-5 bottom-5 w-px bg-teal-200 -z-0"></div>

                  <div class="relative flex items-start gap-3 py-2.5">
                    <div class="w-8 h-8 rounded-full bg-teal-100 border-2 border-white ring-1 ring-teal-200 flex items-center justify-center flex-shrink-0 z-10">
                      <svg class="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    </div>
                    <div>
                      <p class="text-sm font-bold text-neutral-800">January 12, 2012</p>
                      <p class="text-sm text-neutral-500">First official conversation with a Chartered Accountant</p>
                    </div>
                  </div>

                  <div class="relative flex items-start gap-3 py-2.5">
                    <div class="w-8 h-8 rounded-full bg-teal-100 border-2 border-white ring-1 ring-teal-200 flex items-center justify-center flex-shrink-0 z-10">
                      <svg class="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                    </div>
                    <div>
                      <p class="text-sm font-bold text-neutral-800">February 21, 2012</p>
                      <p class="text-sm text-neutral-500">Formally registered with the Indian Government</p>
                    </div>
                  </div>

                  <div class="relative flex items-start gap-3 py-2.5">
                    <div class="w-8 h-8 rounded-full bg-teal-100 border-2 border-white ring-1 ring-teal-200 flex items-center justify-center flex-shrink-0 z-10">
                      <svg class="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    </div>
                    <div>
                      <p class="text-sm font-bold text-neutral-800">First week of March 2012</p>
                      <p class="text-sm text-neutral-500">Two employees hired — the founding team takes shape</p>
                    </div>
                  </div>

                  <div class="relative flex items-start gap-3 py-2.5">
                    <div class="w-8 h-8 rounded-full bg-teal-600 border-2 border-white flex items-center justify-center flex-shrink-0 z-10">
                      <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    </div>
                    <div>
                      <p class="text-sm font-bold text-neutral-800">March 11, 2012 — Operations Begin</p>
                      <p class="text-sm text-neutral-500">3 members, a shutter shop, minimal facilities — and immense determination</p>
                    </div>
                  </div>
                </div>

                <!-- Stat cards -->
                <div class="grid grid-cols-3 gap-2">
                  <div class="bg-teal-50 rounded-lg p-3 text-center border border-teal-100">
                    <div class="text-xl font-extrabold text-teal-700">3</div>
                    <div class="text-xs font-semibold text-teal-700">Members</div>
                    <div class="text-xs text-teal-500 mt-0.5">Founding Team</div>
                  </div>
                  <div class="bg-cyan-50 rounded-lg p-3 text-center border border-cyan-100">
                    <div class="text-xl font-extrabold text-cyan-700">ETP</div>
                    <div class="text-xs font-semibold text-cyan-700">Origins</div>
                    <div class="text-xs text-cyan-500 mt-0.5">Company Name</div>
                  </div>
                  <div class="bg-amber-50 rounded-lg p-3 text-center border border-amber-100">
                    <div class="text-base font-extrabold text-amber-700 leading-tight">Mar 11</div>
                    <div class="text-xs font-semibold text-amber-700">2012</div>
                    <div class="text-xs text-amber-500 mt-0.5">Operations Start</div>
                  </div>
                </div>

              </div>

              <!-- Right: wall image -->
              <div class="w-full sm:w-2/5 flex-shrink-0 rounded-lg overflow-hidden border border-neutral-200 shadow-sm" style="min-height: 260px;">
                <img
                  src="/images/xonobics_wall.png"
                  alt="Xonobics office wall"
                  class="w-full h-full object-cover"
                />
              </div>

            </div>

            <!-- Our Foundation Page -->
            <div v-if="currentPage === 1" class="flex flex-col sm:flex-row gap-6 h-full">

              <!-- Left: content fills full height evenly -->
              <div class="flex-1 flex flex-col justify-between gap-4">

                <!-- Intro headline -->
                <div>
                  <p class="text-xs font-semibold tracking-widest uppercase text-teal-600 mb-1">13+ Years Strong</p>
                  <h2 class="text-2xl font-extrabold text-neutral-900 leading-snug">Building a Legacy of Excellence</h2>
                </div>

                <!-- Body text -->
                <p class="text-sm text-neutral-700 leading-relaxed">
                  Founded over 13 years ago, XONOBICS began with a simple vision — to redefine excellence through innovation, integrity,
                  and unwavering commitment to quality. What started with one passionate professional has evolved into a thriving organization
                  of over <strong class="text-teal-700">125 talented individuals</strong>, united by one purpose: excellence through technology and teamwork.
                </p>

                <!-- Two pillars -->
                <div class="flex flex-col gap-3">
                  <div class="flex items-start gap-3">
                    <div class="w-8 h-8 rounded-full bg-teal-100 border-2 border-white ring-1 ring-teal-200 flex items-center justify-center flex-shrink-0">
                      <svg class="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <div>
                      <h3 class="text-sm font-bold text-neutral-900">Evolution of a Vision</h3>
                      <p class="text-sm text-neutral-500 mt-0.5">From a small team of dreamers to a structured, forward-thinking enterprise.</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <div class="w-8 h-8 rounded-full bg-teal-100 border-2 border-white ring-1 ring-teal-200 flex items-center justify-center flex-shrink-0">
                      <svg class="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <div>
                      <h3 class="text-sm font-bold text-neutral-900">Commitment to Excellence</h3>
                      <p class="text-sm text-neutral-500 mt-0.5">Quality, transparency, and people-first thinking in everything we do.</p>
                    </div>
                  </div>
                </div>

                <!-- Stat chips -->
                <div class="grid grid-cols-3 gap-2">
                  <div class="bg-teal-50 rounded-lg p-3 text-center border border-teal-100">
                    <div class="text-xl font-extrabold text-teal-700">13+</div>
                    <div class="text-xs font-semibold text-teal-700">Years</div>
                    <div class="text-xs text-teal-500 mt-0.5">In Business</div>
                  </div>
                  <div class="bg-cyan-50 rounded-lg p-3 text-center border border-cyan-100">
                    <div class="text-xl font-extrabold text-cyan-700">125+</div>
                    <div class="text-xs font-semibold text-cyan-700">Professionals</div>
                    <div class="text-xs text-cyan-500 mt-0.5">Team Size</div>
                  </div>
                  <div class="bg-purple-50 rounded-lg p-3 text-center border border-purple-100">
                    <div class="text-base font-extrabold text-purple-700 leading-tight">+91 40</div>
                    <div class="text-xs font-semibold text-purple-700">6999 9160</div>
                    <div class="text-xs text-purple-500 mt-0.5">Contact</div>
                  </div>
                </div>

              </div>

              <!-- Right: dairy image -->
              <div class="w-full sm:w-2/5 flex-shrink-0 rounded-lg overflow-hidden border border-neutral-200 shadow-sm" style="min-height: 260px;">
                <img
                  src="/images/xonobics_dairy1.png"
                  alt="Xonobics journey"
                  class="w-full h-full object-cover"
                />
              </div>

            </div>

            <!-- Guiding Principles Page -->
            <div v-if="currentPage === 2" class="flex flex-col sm:flex-row gap-6 h-full">

              <!-- Left: content fills full height evenly -->
              <div class="flex-1 flex flex-col justify-between gap-4">

                <!-- Intro headline -->
                <div>
                  <p class="text-xs font-semibold tracking-widest uppercase text-teal-600 mb-1">Our Core Values</p>
                  <h2 class="text-2xl font-extrabold text-neutral-900 leading-snug">Our Guiding Principles</h2>
                </div>

                <!-- Four principles as compact rows -->
                <div class="flex flex-col gap-3">

                  <div class="flex items-start gap-3">
                    <div class="w-9 h-9 rounded-lg bg-teal-100 border-2 border-white ring-1 ring-teal-200 flex items-center justify-center flex-shrink-0">
                      <svg class="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 class="text-sm font-bold text-neutral-900">Consistency in Quality</h3>
                      <p class="text-sm text-neutral-500 mt-0.5">Delivering reliable, high-standard solutions that exceed expectations.</p>
                    </div>
                  </div>

                  <div class="flex items-start gap-3">
                    <div class="w-9 h-9 rounded-lg bg-cyan-100 border-2 border-white ring-1 ring-cyan-200 flex items-center justify-center flex-shrink-0">
                      <svg class="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 class="text-sm font-bold text-neutral-900">Transparency in Operations</h3>
                      <p class="text-sm text-neutral-500 mt-0.5">Open communication and clear processes in all dealings.</p>
                    </div>
                  </div>

                  <div class="flex items-start gap-3">
                    <div class="w-9 h-9 rounded-lg bg-amber-100 border-2 border-white ring-1 ring-amber-200 flex items-center justify-center flex-shrink-0">
                      <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                      </svg>
                    </div>
                    <div>
                      <h3 class="text-sm font-bold text-neutral-900">Innovation in Every Approach</h3>
                      <p class="text-sm text-neutral-500 mt-0.5">Embracing new technologies and creative solutions.</p>
                    </div>
                  </div>

                  <div class="flex items-start gap-3">
                    <div class="w-9 h-9 rounded-lg bg-purple-100 border-2 border-white ring-1 ring-purple-200 flex items-center justify-center flex-shrink-0">
                      <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 class="text-sm font-bold text-neutral-900">Empowerment of People</h3>
                      <p class="text-sm text-neutral-500 mt-0.5">Investing in our team and fostering growth opportunities.</p>
                    </div>
                  </div>

                </div>

                <!-- Stat chips -->
                <div class="grid grid-cols-4 gap-2">
                  <div class="bg-teal-50 rounded-lg p-2.5 text-center border border-teal-100">
                    <div class="text-lg font-extrabold text-teal-700">Q</div>
                    <div class="text-xs font-semibold text-teal-700 mt-0.5">Quality</div>
                  </div>
                  <div class="bg-cyan-50 rounded-lg p-2.5 text-center border border-cyan-100">
                    <div class="text-lg font-extrabold text-cyan-700">T</div>
                    <div class="text-xs font-semibold text-cyan-700 mt-0.5">Transparency</div>
                  </div>
                  <div class="bg-amber-50 rounded-lg p-2.5 text-center border border-amber-100">
                    <div class="text-lg font-extrabold text-amber-700">I</div>
                    <div class="text-xs font-semibold text-amber-700 mt-0.5">Innovation</div>
                  </div>
                  <div class="bg-purple-50 rounded-lg p-2.5 text-center border border-purple-100">
                    <div class="text-lg font-extrabold text-purple-700">E</div>
                    <div class="text-xs font-semibold text-purple-700 mt-0.5">Empowerment</div>
                  </div>
                </div>

              </div>

              <!-- Right: dairy image -->
              <div class="w-full sm:w-2/5 flex-shrink-0 rounded-lg overflow-hidden border border-neutral-200 shadow-sm" style="min-height: 260px;">
                <img
                  src="/images/xonobics_dairy.png"
                  alt="Xonobics values"
                  class="w-full h-full object-cover"
                />
              </div>

            </div>

            <!-- Employee Pages (Dynamic) -->
            <div v-if="currentPage >= 3">
              <div v-if="currentEmployee" class="space-y-6">
                
                <!-- Page 1: Profile & Introduction -->
                <div v-if="employeePageNumber === 1" class="flex flex-col sm:flex-row gap-6 h-full">

                  <!-- Left: content -->
                  <div class="flex-1 flex flex-col justify-between gap-4 min-w-0">

                    <!-- Vishal's Page 1 -->
                    <template v-if="currentEmployee.id === 8">
                      <div class="bg-neutral-50 border-l-4 pl-4 py-3 italic text-neutral-700" :style="{ borderColor: currentEmployee.color }">
                        "From Tax Analyst to Billing Team Leader — a journey of growth and leadership."
                      </div>

                      <div>
                        <p class="text-neutral-700 leading-relaxed">
                          I began my career with Xonobics IT Services Pvt. Ltd. in January 2023 as a Tax Analyst, bringing a different professional background with limited experience in U.S. taxation. The transition was challenging, but I was eager to learn and committed to growing within the field.
                        </p>
                      </div>

                      <div>
                        <h3 class="text-base font-semibold text-neutral-900 mb-3 flex items-center">
                          <svg class="w-5 h-5 mr-2" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                          </svg>
                          Career Highlights
                        </h3>
                        <div class="flex flex-col gap-2">
                          <div class="bg-neutral-50 rounded-lg p-3 border border-neutral-200 hover:border-teal-300 transition-colors">
                            <div class="font-semibold text-sm text-neutral-900">Tax Analyst</div>
                            <div class="text-xs text-neutral-600 mt-1">Joined Jan 2023 — built foundational tax knowledge from the ground up</div>
                          </div>
                          <div class="bg-neutral-50 rounded-lg p-3 border border-neutral-200 hover:border-teal-300 transition-colors">
                            <div class="font-semibold text-sm text-neutral-900">Senior Tax Analyst</div>
                            <div class="text-xs text-neutral-600 mt-1">Promoted 2025 — handled complex tax processes and cross-functional work</div>
                          </div>
                          <div class="bg-neutral-50 rounded-lg p-3 border border-neutral-200 hover:border-teal-300 transition-colors">
                            <div class="font-semibold text-sm text-neutral-900">Billing Team Leader</div>
                            <div class="text-xs text-neutral-600 mt-1">Current role — oversees billing operations and leads the team</div>
                          </div>
                        </div>
                      </div>
                    </template>

                    <!-- Jitendra's Page 1 -->
                    <template v-else-if="currentEmployee.id === 5">
                      <!-- Quote -->
                      <div class="bg-neutral-50 border-l-4 pl-4 py-3 italic text-neutral-700" :style="{ borderColor: currentEmployee.color }">
                        "{{ currentEmployee.quote }}"
                      </div>

                      <!-- Introduction -->
                      <div>
                        <p class="text-neutral-700 leading-relaxed">{{ currentEmployee.intro }}</p>
                      </div>

                      <!-- Leadership Milestones -->
                      <div>
                        <h3 class="text-base font-semibold text-neutral-900 mb-3 flex items-center">
                          <svg class="w-5 h-5 mr-2" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                          </svg>
                          Career Path
                        </h3>
                        <div class="flex flex-col gap-2">
                          <div class="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                            <div class="font-semibold text-sm text-neutral-900">Tax Analyst → Senior Tax Analyst</div>
                            <div class="text-xs text-neutral-600 mt-1">Joined Feb 2022 — promoted within two years for accuracy and excellence</div>
                          </div>
                          <div class="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                            <div class="font-semibold text-sm text-neutral-900">Team Lead</div>
                            <div class="text-xs text-neutral-600 mt-1">Advanced for initiative and reliability — managed a high-performing team</div>
                          </div>
                          <div class="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                            <div class="font-semibold text-sm text-neutral-900">Query Head</div>
                            <div class="text-xs text-neutral-600 mt-1">Current role — oversees Query Department operations and strategic direction</div>
                          </div>
                        </div>
                      </div>
                    </template>

                    <!-- Mike Gill Christ's Page 1 -->
                    <template v-else-if="currentEmployee.id === 6">                      <!-- Quote -->
                      <div class="bg-neutral-50 border-l-4 pl-4 py-3 italic text-neutral-700" :style="{ borderColor: currentEmployee.color }">
                        "{{ currentEmployee.quote }}"
                      </div>

                      <!-- Introduction -->
                      <div>
                        <p class="text-neutral-700 leading-relaxed">{{ currentEmployee.intro }}</p>
                      </div>

                      <!-- Career Path -->
                      <div>
                        <h3 class="text-base font-semibold text-neutral-900 mb-3 flex items-center">
                          <svg class="w-5 h-5 mr-2" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                          </svg>
                          Career Path
                        </h3>
                        <div class="flex flex-col gap-2">
                          <div class="bg-neutral-50 rounded-lg p-3 border border-neutral-200 hover:border-teal-300 transition-colors">
                            <div class="font-semibold text-sm text-neutral-900">Tax Analyst</div>
                            <div class="text-xs text-neutral-600 mt-1">Starting role — demonstrating discipline and adaptability from day one</div>
                          </div>
                          <div class="bg-neutral-50 rounded-lg p-3 border border-neutral-200 hover:border-teal-300 transition-colors">
                            <div class="font-semibold text-sm text-neutral-900">Quality Analyst</div>
                            <div class="text-xs text-neutral-600 mt-1">Promoted for exceptional performance and attention to detail</div>
                          </div>
                          <div class="bg-neutral-50 rounded-lg p-3 border border-neutral-200 hover:border-teal-300 transition-colors">
                            <div class="font-semibold text-sm text-neutral-900">Trainer</div>
                            <div class="text-xs text-neutral-600 mt-1">Current role — leading Compliance Handling and Quality Analysis</div>
                          </div>
                        </div>
                      </div>
                    </template>

                    <!-- Gogunta Mani's Page 1 -->
                    <template v-else-if="currentEmployee.id === 7">
                      <!-- Department badge -->
                      <div class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-3" :style="{ backgroundColor: currentEmployee.color + '20', color: currentEmployee.color }">
                        Documentation Team Excellence
                      </div>

                      <!-- Intro text -->
                      <div>
                        <p class="text-neutral-700 leading-relaxed">Joined Xonobics in Feb-23-2023 as a Junior Tax Analyst. With 21 months of dedicated service in the Documentation Team, Gogunta Mani has established himself as a reliable and skilled professional in U.S. taxation.</p>
                      </div>

                      <!-- Key Info -->
                      <div class="grid grid-cols-2 gap-3 mt-4">
                        <div class="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                          <div class="text-xs text-neutral-500 mb-0.5">Joined</div>
                          <div class="font-semibold text-sm text-neutral-900">Feb 23, 2023</div>
                        </div>
                        <div class="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                          <div class="text-xs text-neutral-500 mb-0.5">Experience</div>
                          <div class="font-semibold text-sm text-neutral-900">21+ Months</div>
                        </div>
                        <div class="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                          <div class="text-xs text-neutral-500 mb-0.5">Team</div>
                          <div class="font-semibold text-sm text-neutral-900">Documentation Team</div>
                        </div>
                        <div class="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                          <div class="text-xs text-neutral-500 mb-0.5">Specialty</div>
                          <div class="font-semibold text-sm text-neutral-900">U.S. Taxation</div>
                        </div>
                      </div>
                    </template>

                    <!-- Default Employee Page 1 -->
                    <template v-else>
                      <!-- Quote -->
                      <div class="bg-neutral-50 border-l-4 pl-4 py-3 italic text-neutral-700" :style="{ borderColor: currentEmployee.color }">
                        "{{ currentEmployee.quote }}"
                      </div>

                      <!-- Introduction -->
                      <div>
                        <p class="text-neutral-700 leading-relaxed">{{ currentEmployee.intro }}</p>
                      </div>
                      <!-- Leadership Milestones -->
                      <div>
                        <h3 class="text-base font-semibold text-neutral-900 mb-3 flex items-center">
                          <svg class="w-5 h-5 mr-2" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                          </svg>
                          Leadership Milestones
                        </h3>
                        <div class="flex flex-col gap-2">
                          <div 
                            v-for="(achievement, idx) in currentEmployee.leadership" 
                            :key="idx"
                            class="bg-neutral-50 rounded-lg p-3 border border-neutral-200 hover:border-teal-300 transition-colors"
                          >
                            <div class="font-semibold text-sm text-neutral-900">{{ achievement.title }}</div>
                            <div class="text-xs text-neutral-600 mt-1">{{ achievement.description }}</div>
                          </div>
                        </div>
                      </div>
                    </template>

                  </div>

                  <!-- Right: employee photo -->
                  <div class="w-full sm:w-2/5 flex-shrink-0 flex items-center justify-center py-4">
                    <div class="w-52 h-52 rounded-full overflow-hidden border-4 shadow-md flex-shrink-0" :style="{ borderColor: currentEmployee.color }">
                      <img
                        :src="currentEmployee.image"
                        :alt="currentEmployee.name"
                        class="w-full h-full object-cover object-top"
                        style="background: transparent;"
                        @error="handleImageError"
                      />
                    </div>
                  </div>

                </div>

                <!-- Page 2: Career Progression -->
                <div v-if="employeePageNumber === 2">
                  <!-- Vishal's Page 2: Career Progression -->
                  <div v-if="currentEmployee.id === 8">
                    <div class="flex items-center mb-6">
                      <div class="w-10 h-10 rounded-lg flex items-center justify-center mr-3" :style="{ backgroundColor: currentEmployee.color + '20' }">
                        <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                        </svg>
                      </div>
                      <h2 class="text-xl font-bold text-neutral-900">Career Progression</h2>
                    </div>

                    <h3 class="text-base font-semibold text-neutral-900 mb-4">Career Milestones</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                      <div class="bg-neutral-50 rounded-lg p-3 border border-neutral-200 hover:border-teal-300 transition-colors">
                        <div class="font-semibold text-sm text-neutral-900">Tax Analyst</div>
                        <div class="text-xs text-neutral-600 mt-1">Building foundational U.S. tax knowledge and skills from a different background</div>
                      </div>
                      <div class="bg-neutral-50 rounded-lg p-3 border border-neutral-200 hover:border-teal-300 transition-colors">
                        <div class="font-semibold text-sm text-neutral-900">Senior Tax Analyst</div>
                        <div class="text-xs text-neutral-600 mt-1">Handling complex tax processes and taking on cross-functional responsibilities</div>
                      </div>
                      <div class="bg-neutral-50 rounded-lg p-3 border border-neutral-200 hover:border-teal-300 transition-colors">
                        <div class="font-semibold text-sm text-neutral-900">2 Years of Growth</div>
                        <div class="text-xs text-neutral-600 mt-1">Overcoming early challenges through persistence and commitment to learning</div>
                      </div>
                    </div>

                    <div class="mb-6">
                      <p class="text-neutral-700 leading-relaxed">
                        After two years of honing my skills as a Tax Analyst, I was promoted to Senior Tax Analyst, where I began to focus more on complex aspects of tax processes. The transition presented significant challenges due to my limited prior experience in U.S. taxation, but my eagerness to learn and commitment to growth drove me forward.
                      </p>
                    </div>

                    <div class="space-y-3">
                      <div class="flex items-start space-x-3">
                        <div class="w-14 flex-shrink-0 font-bold text-sm" :style="{ color: currentEmployee.color }">2023</div>
                        <div class="flex-1 pb-3 border-b border-neutral-200">
                          <div class="font-semibold text-neutral-900 text-sm">Joined as Tax Analyst</div>
                          <div class="text-xs text-neutral-600 mt-0.5">Started at Xonobics with a fresh perspective on U.S. taxation</div>
                        </div>
                      </div>
                      <div class="flex items-start space-x-3">
                        <div class="w-14 flex-shrink-0 font-bold text-sm" :style="{ color: currentEmployee.color }">2024</div>
                        <div class="flex-1 pb-3 border-b border-neutral-200">
                          <div class="font-semibold text-neutral-900 text-sm">Expanded to Billing</div>
                          <div class="text-xs text-neutral-600 mt-0.5">Took on key billing responsibilities as part of management commitment</div>
                        </div>
                      </div>
                      <div class="flex items-start space-x-3">
                        <div class="w-14 flex-shrink-0 font-bold text-sm" :style="{ color: currentEmployee.color }">2025</div>
                        <div class="flex-1 pb-3 border-b border-neutral-200">
                          <div class="font-semibold text-neutral-900 text-sm">Promoted to Senior Tax Analyst</div>
                          <div class="text-xs text-neutral-600 mt-0.5">Recognised for expertise and cross-functional contribution</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Ghouse Page 2: Team Growth & Contributions -->
                  <div v-else-if="currentEmployee.id === 4">
                    <!-- Section header -->
                    <div class="flex items-center mb-5">
                      <div class="w-10 h-10 rounded-lg flex items-center justify-center mr-3 flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                        <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                      </div>
                      <h2 class="text-xl font-bold text-neutral-900">Team Growth & Contributions</h2>
                    </div>

                    <!-- Team growth story -->
                    <div class="flex items-start gap-3 bg-neutral-50 rounded-lg p-4 border border-neutral-200 mb-5">
                      <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                        <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                      </div>
                      <p class="text-sm text-neutral-600 leading-relaxed">{{ currentEmployee.team_growth_story }}</p>
                    </div>

                    <!-- Team Expansion card -->
                    <div class="bg-neutral-50 rounded-lg p-4 border border-neutral-200 mb-5">
                      <h3 class="text-sm font-bold text-neutral-900 mb-3">Team Expansion</h3>
                      <div class="space-y-3">
                        <div v-for="(item, idx) in currentEmployee.team_expansion" :key="idx" class="flex items-start gap-3">
                          <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                            <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path v-if="item.icon === 'users'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                          </div>
                          <div>
                            <div class="font-semibold text-sm text-neutral-900">{{ item.title }}</div>
                            <div class="text-xs text-neutral-500 mt-0.5">{{ item.description }}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Contributions story -->
                    <div class="flex items-start gap-3 bg-neutral-50 rounded-lg p-4 border border-neutral-200 mb-5">
                      <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                        <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                      </div>
                      <p class="text-sm text-neutral-600 leading-relaxed">{{ currentEmployee.contributions_story }}</p>
                    </div>

                    <!-- Footer chips -->
                    <div v-if="currentEmployee.footer_values" class="flex items-center gap-3 pt-3 border-t border-neutral-100">
                      <span v-for="(val, idx) in currentEmployee.footer_values" :key="idx"
                        class="px-3 py-1 rounded-full text-xs font-semibold"
                        :style="{ backgroundColor: currentEmployee.color + '15', color: currentEmployee.color }">{{ val }}</span>
                    </div>
                  </div>

                  <!-- Jitendra Page 2: From Analyst to Leadership -->
                  <div v-else-if="currentEmployee.id === 5">
                    <!-- Section header -->
                    <div class="flex items-center mb-5">
                      <div class="w-10 h-10 rounded-lg flex items-center justify-center mr-3 flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                        <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                        </svg>
                      </div>
                      <h2 class="text-xl font-bold text-neutral-900">From Analyst to Leadership</h2>
                    </div>

                    <!-- Leadership Milestones cards -->
                    <h3 class="text-sm font-bold text-neutral-900 mb-3">Leadership Milestones</h3>
                    <div class="space-y-2 mb-5">
                      <div v-for="(milestone, idx) in currentEmployee.leadership_milestones" :key="idx"
                        class="flex items-start gap-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200 hover:border-blue-200 transition-colors">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                          <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path v-if="milestone.icon === 'trophy'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                            <path v-else-if="milestone.icon === 'document'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                        </div>
                        <div class="flex-1">
                          <div class="font-semibold text-sm text-neutral-900">{{ milestone.title }}</div>
                          <div class="text-xs text-neutral-500 mt-0.5">{{ milestone.description }}</div>
                        </div>
                      </div>
                    </div>

                    <!-- Story block 1 -->
                    <div class="flex items-start gap-3 bg-neutral-50 rounded-lg p-4 border border-neutral-200 mb-4">
                      <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                        <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                      </div>
                      <p class="text-sm text-neutral-600 leading-relaxed">{{ currentEmployee.analyst_to_leadership_story }}</p>
                    </div>

                    <!-- Story block 2 -->
                    <div class="flex items-start gap-3 bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                      <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                        <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                        </svg>
                      </div>
                      <p class="text-sm text-neutral-600 leading-relaxed">{{ currentEmployee.analyst_to_leadership_story2 }}</p>
                    </div>
                  </div>

                  <!-- Gogunta Mani Page 2: Professional Excellence -->
                  <div v-else-if="currentEmployee.id === 7">
                    <!-- Section header -->
                    <div class="flex items-center mb-6">
                      <div class="w-10 h-10 rounded-lg flex items-center justify-center mr-3" :style="{ backgroundColor: currentEmployee.color + '20' }">
                        <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                        </svg>
                      </div>
                      <h2 class="text-xl font-bold text-neutral-900">Key Achievements</h2>
                    </div>

                    <!-- Achievements list -->
                    <div class="space-y-2 mb-6">
                      <div class="flex items-start gap-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                          <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                        </div>
                        <div>
                          <div class="font-semibold text-sm text-neutral-900">21 Months Experience</div>
                          <div class="text-xs text-neutral-600 mt-0.5">Strong understanding of federal, state, and local tax regulations</div>
                        </div>
                      </div>
                      <div class="flex items-start gap-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                          <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                          </svg>
                        </div>
                        <div>
                          <div class="font-semibold text-sm text-neutral-900">Performance Excellence</div>
                          <div class="text-xs text-neutral-600 mt-0.5">Consistently met daily, weekly, and monthly targets</div>
                        </div>
                      </div>
                      <div class="flex items-start gap-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                          <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                          </svg>
                        </div>
                        <div>
                          <div class="font-semibold text-sm text-neutral-900">Accuracy &amp; Compliance</div>
                          <div class="text-xs text-neutral-600 mt-0.5">Strong attention to detail in tax preparation</div>
                        </div>
                      </div>
                    </div>

                    <!-- Footer note -->
                    <div class="flex items-start gap-3 bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                      <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                        <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                      </div>
                      <p class="text-sm text-neutral-600 leading-relaxed">Proactively contributed to problem-solving and finding tax-saving strategies for clients, increasing satisfaction and long-term relationships. Demonstrated high levels of productivity, efficiency, and commitment to ensuring compliance and timely filings.</p>
                    </div>
                  </div>

                  <!-- Default Page 2 for others -->
                  <div v-else-if="currentEmployee.id !== 6">
                    <div class="flex items-center mb-6">                      <div class="w-10 h-10 rounded-lg flex items-center justify-center mr-3" :style="{ backgroundColor: currentEmployee.color + '20' }">
                        <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                        </svg>
                      </div>
                      <h2 class="text-xl font-bold text-neutral-900">Career Progression</h2>
                    </div>

                    <h3 class="text-base font-semibold text-neutral-900 mb-4">Career Milestones</h3>
                    
                    <div v-if="currentEmployee.id === 2" class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                      <div 
                        v-for="(achievement, idx) in currentEmployee.leadership" 
                        :key="idx"
                        class="bg-neutral-50 rounded-lg p-3 border border-neutral-200 hover:border-teal-300 transition-colors"
                      >
                        <div class="font-semibold text-sm text-neutral-900">{{ achievement.title }}</div>
                        <div class="text-xs text-neutral-600 mt-1">{{ achievement.description }}</div>
                      </div>
                    </div>

                    <div v-else-if="currentEmployee.id === 3 && currentEmployee.early_achievements" class="mb-6">
                      <h3 class="text-base font-semibold text-neutral-900 mb-3">Early Achievements</h3>
                      <div class="space-y-2">
                        <div 
                          v-for="(achievement, idx) in currentEmployee.early_achievements" 
                          :key="idx"
                          class="flex items-start gap-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200 hover:border-teal-300 transition-colors"
                        >
                          <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                            <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path v-if="idx === 0" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                            </svg>
                          </div>
                          <div>
                            <div class="font-semibold text-sm text-neutral-900">{{ achievement.title }}</div>
                            <div class="text-xs text-neutral-500 mt-0.5">{{ achievement.description }}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div v-else-if="currentEmployee.leadership && currentEmployee.leadership.length" class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                      <div 
                        v-for="(achievement, idx) in currentEmployee.leadership" 
                        :key="idx"
                        class="bg-neutral-50 rounded-lg p-3 border border-neutral-200 hover:border-teal-300 transition-colors"
                      >
                        <div class="font-semibold text-sm text-neutral-900">{{ achievement.title }}</div>
                        <div class="text-xs text-neutral-600 mt-1">{{ achievement.description }}</div>
                      </div>
                    </div>

                    <div class="mb-6">
                      <p class="text-neutral-700 leading-relaxed">{{ currentEmployee.career_story }}</p>
                    </div>

                    <div v-if="currentEmployee.id !== 2 || !currentEmployee.leadership_achievements">
                      <div class="space-y-3">
                        <div 
                          v-for="(milestone, idx) in currentEmployee.milestones" 
                          :key="idx"
                          class="flex items-start space-x-3"
                        >
                          <div class="w-14 flex-shrink-0 font-bold text-sm" :style="{ color: currentEmployee.color }">
                            {{ milestone.year }}
                          </div>
                          <div class="flex-1 pb-3 border-b border-neutral-200">
                            <div class="font-semibold text-neutral-900 text-sm">{{ milestone.title }}</div>
                            <div class="text-xs text-neutral-600 mt-0.5">{{ milestone.description }}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Mike Gill Christ Page 2: From Analyst to Trainer -->
                  <div v-else-if="currentEmployee.id === 6">
                    <!-- Section header -->
                    <div class="flex items-center mb-6">
                      <div class="w-10 h-10 rounded-lg flex items-center justify-center mr-3" :style="{ backgroundColor: currentEmployee.color + '20' }">
                        <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                        </svg>
                      </div>
                      <h2 class="text-xl font-bold text-neutral-900">Career Milestones</h2>
                    </div>

                    <!-- Milestone cards -->
                    <div class="space-y-3 mb-6">
                      <div class="flex items-start gap-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                          <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                        </div>
                        <div>
                          <div class="font-semibold text-sm text-neutral-900">Tax Analyst</div>
                          <div class="text-xs text-neutral-600 mt-0.5">Starting role demonstrating discipline and adaptability</div>
                        </div>
                      </div>
                      <div class="flex items-start gap-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                          <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                          </svg>
                        </div>
                        <div>
                          <div class="font-semibold text-sm text-neutral-900">Quality Analyst</div>
                          <div class="text-xs text-neutral-600 mt-0.5">Advanced for exceptional performance and attention to detail</div>
                        </div>
                      </div>
                      <div class="flex items-start gap-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                          <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/>
                          </svg>
                        </div>
                        <div>
                          <div class="font-semibold text-sm text-neutral-900">Trainer</div>
                          <div class="text-xs text-neutral-600 mt-0.5">Current role in Compliance Handling and Quality Analysis</div>
                        </div>
                      </div>
                    </div>

                    <!-- Career story -->
                    <div class="flex items-start gap-3 bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                      <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                        <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                      </div>
                      <p class="text-sm text-neutral-600 leading-relaxed">{{ currentEmployee.career_milestone_story }}</p>
                    </div>
                  </div>

                </div>

                <!-- Page 3 -->
                <div v-if="employeePageNumber === 3">
                  <!-- Vishal's Page 3: Expanding Horizons -->
                  <div v-if="currentEmployee.id === 8">
                    <div class="flex items-center mb-6">
                      <div class="w-10 h-10 rounded-lg flex items-center justify-center mr-3" :style="{ backgroundColor: currentEmployee.color + '20' }">
                        <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 01-2 2h-4a2 2 0 01-2-2v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                        </svg>
                      </div>
                      <h2 class="text-xl font-bold text-neutral-900">Expanding Horizons</h2>
                    </div>

                    <h3 class="text-base font-semibold text-neutral-900 mb-4">Billing Department Integration</h3>
                    <div class="space-y-3 mb-6">
                      <div class="flex items-start space-x-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                          <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 01-2 2h-4a2 2 0 01-2-2v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                          </svg>
                        </div>
                        <div class="flex-1">
                          <div class="font-semibold text-neutral-900 text-sm">Key Billing Role</div>
                          <div class="text-xs text-neutral-600 mt-0.5">Took on billing responsibilities as part of a broader management commitment</div>
                        </div>
                      </div>
                      <div class="flex items-start space-x-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                          <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                          </svg>
                        </div>
                        <div class="flex-1">
                          <div class="font-semibold text-neutral-900 text-sm">Operational Insights</div>
                          <div class="text-xs text-neutral-600 mt-0.5">Gained valuable understanding of how the company's operations interlock</div>
                        </div>
                      </div>
                      <div class="flex items-start space-x-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                          <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                          </svg>
                        </div>
                        <div class="flex-1">
                          <div class="font-semibold text-neutral-900 text-sm">Broadened Perspective</div>
                          <div class="text-xs text-neutral-600 mt-0.5">Dual exposure to tax and billing significantly widened professional scope</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p class="text-neutral-700 leading-relaxed">
                        During this time, I also took on a key role in the billing department as part of my commitment to management. My experience in billing allowed me to gain valuable insights into the company's operations, which significantly broadened my professional perspective and enhanced my understanding of the business as a whole.
                      </p>
                    </div>
                  </div>

                  <!-- Default Page 3 for Ateeq -->
                  <div v-else-if="currentEmployee.id === 2">
                    <div class="flex items-center mb-6">
                      <div class="w-10 h-10 rounded-lg flex items-center justify-center mr-3" :style="{ backgroundColor: currentEmployee.color + '20' }">
                        <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                        </svg>
                      </div>
                      <h2 class="text-xl font-bold text-neutral-900">Leadership Evolution</h2>
                    </div>

                    <h3 class="text-base font-semibold text-neutral-900 mb-4">Leadership Achievements</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                      <div 
                        v-for="(achievement, idx) in currentEmployee.leadership_achievements" 
                        :key="idx"
                        class="bg-neutral-50 rounded-lg p-3 border border-neutral-200 hover:border-cyan-300 transition-colors"
                      >
                        <div class="font-semibold text-sm text-neutral-900">{{ achievement.title }}</div>
                        <div class="text-xs text-neutral-600 mt-1">{{ achievement.description }}</div>
                      </div>
                    </div>

                    <div v-if="currentEmployee.leadership_evolution" class="mb-6">
                      <p class="text-neutral-700 leading-relaxed">{{ currentEmployee.leadership_evolution }}</p>
                    </div>
                  </div>

                  <!-- Page 3 for Kashif -->
                  <div v-else-if="currentEmployee.id === 3">
                    <!-- Section header -->
                    <div class="flex items-center mb-5">
                      <div class="w-10 h-10 rounded-lg flex items-center justify-center mr-3 flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                        <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                        </svg>
                      </div>
                      <h2 class="text-xl font-bold text-neutral-900">Current Role & Values</h2>
                    </div>

                    <!-- Leadership Milestones -->
                    <h3 class="text-base font-semibold text-neutral-900 mb-3">Leadership Milestones</h3>
                    <div class="space-y-2 mb-5">
                      <div 
                        v-for="(milestone, idx) in currentEmployee.leadership" 
                        :key="idx"
                        class="flex items-start gap-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200 hover:border-orange-200 transition-colors"
                      >
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                          <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path v-if="idx === 0" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3l14 9-14 9V3z"/>
                            <path v-else-if="idx === 1" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            <path v-else-if="idx === 2" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                        </div>
                        <div class="flex-1">
                          <div class="font-semibold text-neutral-900 text-sm">{{ milestone.title }}</div>
                          <div class="text-xs text-neutral-500 mt-0.5">{{ milestone.description }}</div>
                        </div>
                      </div>
                    </div>

                    <!-- Leadership story quote block -->
                    <div v-if="currentEmployee.leadership_story" class="flex items-start gap-3 bg-neutral-50 rounded-lg p-4 border border-neutral-200 mb-5">
                      <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                        <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3l14 9-14 9V3z"/>
                        </svg>
                      </div>
                      <p class="text-sm text-neutral-600 leading-relaxed italic">{{ currentEmployee.leadership_story }}</p>
                    </div>

                    <!-- Closing note -->
                    <div v-if="currentEmployee.closing_note" class="bg-neutral-50 border-l-4 pl-4 py-3 text-sm text-neutral-700 italic" :style="{ borderColor: currentEmployee.color }">
                      "{{ currentEmployee.closing_note }}"
                    </div>
                  </div>

                  <!-- Jitendra Page 3: As Team Lead -->
                  <div v-else-if="currentEmployee.id === 5">
                    <!-- Section header -->
                    <div class="flex items-center mb-5">
                      <div class="w-10 h-10 rounded-lg flex items-center justify-center mr-3 flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                        <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                      </div>
                      <h2 class="text-xl font-bold text-neutral-900">As Team Lead</h2>
                    </div>

                    <!-- Leadership Achievements -->
                    <h3 class="text-sm font-bold text-neutral-900 mb-3">Leadership Achievements</h3>
                    <div class="space-y-2 mb-5">
                      <div v-for="(item, idx) in currentEmployee.team_lead_achievements" :key="idx"
                        class="flex items-start gap-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200 hover:border-blue-200 transition-colors">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                          <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path v-if="item.icon === 'shield'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                            <path v-else-if="item.icon === 'bulb'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 01-2 2h-4a2 2 0 01-2-2v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                          </svg>
                        </div>
                        <div class="flex-1">
                          <div class="font-semibold text-sm text-neutral-900">{{ item.title }}</div>
                          <div class="text-xs text-neutral-500 mt-0.5">{{ item.description }}</div>
                        </div>
                      </div>
                    </div>

                    <!-- Story block -->
                    <div class="flex items-start gap-3 bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                      <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                        <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                      </div>
                      <p class="text-sm text-neutral-600 leading-relaxed">{{ currentEmployee.team_lead_story }}</p>
                    </div>
                  </div>

                  <!-- Ghouse Page 3: Leadership Roles -->
                  <div v-else-if="currentEmployee.id === 4">
                    <!-- Section header -->
                    <div class="flex items-center mb-5">
                      <div class="w-10 h-10 rounded-lg flex items-center justify-center mr-3 flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                        <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                        </svg>
                      </div>
                      <h2 class="text-xl font-bold text-neutral-900">Leadership Roles</h2>
                    </div>

                    <!-- Leadership story -->
                    <div class="flex items-start gap-3 bg-neutral-50 rounded-lg p-4 border border-neutral-200 mb-5">
                      <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                        <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                      </div>
                      <p class="text-sm text-neutral-600 leading-relaxed">{{ currentEmployee.leadership_roles_story }}</p>
                    </div>

                    <!-- Leadership Milestones -->
                    <h3 class="text-sm font-bold text-neutral-900 mb-3">Leadership Milestones</h3>
                    <div class="space-y-2 mb-5">
                      <div v-for="(milestone, idx) in currentEmployee.leadership_milestones" :key="idx"
                        class="flex items-start gap-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200 hover:border-blue-200 transition-colors">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                          <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path v-if="milestone.icon === 'trophy'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                            <path v-else-if="milestone.icon === 'briefcase'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                          </svg>
                        </div>
                        <div class="flex-1">
                          <div class="font-semibold text-sm text-neutral-900">{{ milestone.title }}</div>
                          <div class="text-xs text-neutral-500 mt-0.5">{{ milestone.description }}</div>
                        </div>
                      </div>
                    </div>

                    <!-- Closing quote -->
                    <div class="bg-neutral-50 border-l-4 pl-4 py-3 text-sm text-neutral-600 italic" :style="{ borderColor: currentEmployee.color }">
                      "{{ currentEmployee.leadership_closing }}"
                    </div>
                  </div>

                  <!-- Gogunta Mani Page 3: Professional Contributions -->
                  <div v-else-if="currentEmployee.id === 7">
                    <!-- Section header -->
                    <div class="flex items-center mb-6">
                      <div class="w-10 h-10 rounded-lg flex items-center justify-center mr-3" :style="{ backgroundColor: currentEmployee.color + '20' }">
                        <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                        </svg>
                      </div>
                      <h2 class="text-xl font-bold text-neutral-900">Professional Skills</h2>
                    </div>

                    <!-- Skills list -->
                    <div class="space-y-2 mb-6">
                      <div class="flex items-start gap-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                          <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                          </svg>
                        </div>
                        <div>
                          <div class="font-semibold text-sm text-neutral-900">Tax Expertise</div>
                          <div class="text-xs text-neutral-600 mt-0.5">Comprehensive knowledge of U.S. tax regulations</div>
                        </div>
                      </div>
                      <div class="flex items-start gap-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                          <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                          </svg>
                        </div>
                        <div>
                          <div class="font-semibold text-sm text-neutral-900">Problem Solving</div>
                          <div class="text-xs text-neutral-600 mt-0.5">Proactive approach to tax-saving strategies</div>
                        </div>
                      </div>
                      <div class="flex items-start gap-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                          <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                          </svg>
                        </div>
                        <div>
                          <div class="font-semibold text-sm text-neutral-900">Client Relations</div>
                          <div class="text-xs text-neutral-600 mt-0.5">Building long-term client relationships</div>
                        </div>
                      </div>
                    </div>

                    <!-- Footer note -->
                    <div class="flex items-start gap-3 bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                      <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                        <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                        </svg>
                      </div>
                      <p class="text-sm text-neutral-600 leading-relaxed">Gogunta Mani's dedication to accuracy and efficiency has made him a valuable asset to the Documentation Team. His commitment to compliance and client satisfaction continues to drive positive outcomes for both clients and the organization.</p>
                    </div>
                  </div>

                  <!-- Default Page 3 for others -->
                  <div v-else-if="currentEmployee.id !== 6">
                    <div class="flex items-center mb-6">
                      <div class="w-10 h-10 rounded-lg flex items-center justify-center mr-3" :style="{ backgroundColor: currentEmployee.color + '20' }">
                        <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      </div>
                      <h2 class="text-xl font-bold text-neutral-900">Leadership & Future</h2>
                    </div>
                    <div v-if="currentEmployee.future_vision" class="mb-6">
                      <p class="text-neutral-700 leading-relaxed">{{ currentEmployee.future_vision }}</p>
                    </div>

                    <div v-if="currentEmployee.future_commitment" class="mb-6">
                      <p class="text-neutral-700 leading-relaxed">{{ currentEmployee.future_commitment }}</p>
                    </div>

                    <div v-if="currentEmployee.values && currentEmployee.values.length">
                      <h3 class="text-base font-semibold text-neutral-900 mb-4">What Drives Me</h3>
                      <div class="space-y-3">
                        <div 
                          v-for="(value, idx) in currentEmployee.values" 
                          :key="idx"
                          class="flex items-start space-x-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200"
                        >
                          <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                            <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path v-if="idx === 0" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                              <path v-else-if="idx === 1" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                            </svg>
                          </div>
                          <div class="flex-1">
                            <div class="font-semibold text-neutral-900 text-sm">{{ value.title }}</div>
                            <div class="text-xs text-neutral-600 mt-0.5">{{ value.description }}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div v-if="currentEmployee.closing_note" class="mt-6 bg-neutral-50 border-l-4 pl-4 py-3 text-sm text-neutral-700 italic" :style="{ borderColor: currentEmployee.color }">
                      {{ currentEmployee.closing_note }}
                    </div>
                  </div>
                  <!-- Mike Gill Christ Page 3: Excellence in Performance -->
                  <div v-else-if="currentEmployee.id === 6">
                    <!-- Section header -->
                    <div class="flex items-center mb-6">
                      <div class="w-10 h-10 rounded-lg flex items-center justify-center mr-3" :style="{ backgroundColor: currentEmployee.color + '20' }">
                        <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                        </svg>
                      </div>
                      <h2 class="text-xl font-bold text-neutral-900">Recognition &amp; Awards</h2>
                    </div>

                    <!-- Awards list -->
                    <div class="space-y-3 mb-6">
                      <div class="flex items-start gap-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                          <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                          </svg>
                        </div>
                        <div>
                          <div class="font-semibold text-sm text-neutral-900">Employee Recognition Certificates</div>
                          <div class="text-xs text-neutral-600 mt-0.5">Multiple certificates for outstanding contributions</div>
                        </div>
                      </div>
                      <div class="flex items-start gap-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                          <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                          </svg>
                        </div>
                        <div>
                          <div class="font-semibold text-sm text-neutral-900">Best Employee Award</div>
                          <div class="text-xs text-neutral-600 mt-0.5">Recognition for exemplary performance</div>
                        </div>
                      </div>
                      <div class="flex items-start gap-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                          <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                          </svg>
                        </div>
                        <div>
                          <div class="font-semibold text-sm text-neutral-900">Leadership Excellence</div>
                          <div class="text-xs text-neutral-600 mt-0.5">Exemplifying accountability and passion for excellence</div>
                        </div>
                      </div>
                    </div>

                    <!-- Awards story -->
                    <div class="flex items-start gap-3 bg-neutral-50 rounded-lg p-4 border border-neutral-200 mb-6">
                      <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                        <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/>
                        </svg>
                      </div>
                      <p class="text-sm text-neutral-600 leading-relaxed">{{ currentEmployee.awards_story }}</p>
                    </div>

                    <!-- Core Values -->
                    <h3 class="text-base font-semibold text-neutral-900 mb-3">Core Values</h3>
                    <div class="space-y-2 mb-5">
                      <div class="flex items-start gap-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                          <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                        </div>
                        <div>
                          <div class="font-semibold text-sm text-neutral-900">Empowering People</div>
                          <div class="text-xs text-neutral-600 mt-0.5">Building capability and confidence in every learner</div>
                        </div>
                      </div>
                      <div class="flex items-start gap-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                          <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                          </svg>
                        </div>
                        <div>
                          <div class="font-semibold text-sm text-neutral-900">Continuous Learning</div>
                          <div class="text-xs text-neutral-600 mt-0.5">Fostering a culture of growth and knowledge sharing</div>
                        </div>
                      </div>
                      <div class="flex items-start gap-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                          <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                          </svg>
                        </div>
                        <div>
                          <div class="font-semibold text-sm text-neutral-900">Excellence in Training</div>
                          <div class="text-xs text-neutral-600 mt-0.5">Delivering impactful programs that drive organisational growth</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Page 4 -->
                <div v-if="employeePageNumber === 4">
                  <!-- Gogunta Mani Page 4: Words of Wisdom -->
                  <div v-if="currentEmployee.id === 7">
                    <!-- Section header -->
                    <div class="flex items-center mb-6">
                      <div class="w-10 h-10 rounded-lg flex items-center justify-center mr-3" :style="{ backgroundColor: currentEmployee.color + '20' }">
                        <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                        </svg>
                      </div>
                      <h2 class="text-xl font-bold text-neutral-900">Words of Wisdom</h2>
                    </div>

                    <!-- Wisdom list -->
                    <div class="space-y-2 mb-6">
                      <div class="flex items-start gap-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                          <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                          </svg>
                        </div>
                        <div>
                          <div class="font-semibold text-sm text-neutral-900">Your Journey Matters</div>
                          <div class="text-xs text-neutral-600 mt-0.5">Every path at Xonobics can be remarkable</div>
                        </div>
                      </div>
                      <div class="flex items-start gap-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                          <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                          </svg>
                        </div>
                        <div>
                          <div class="font-semibold text-sm text-neutral-900">Performance is Recognized</div>
                          <div class="text-xs text-neutral-600 mt-0.5">Dedication and hard work never go unnoticed</div>
                        </div>
                      </div>
                      <div class="flex items-start gap-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                          <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                          </svg>
                        </div>
                        <div>
                          <div class="font-semibold text-sm text-neutral-900">Small Efforts Count</div>
                          <div class="text-xs text-neutral-600 mt-0.5">Every contribution builds something significant</div>
                        </div>
                      </div>
                    </div>

                    <!-- Closing note -->
                    <div class="flex items-start gap-3 bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                      <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                        <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                        </svg>
                      </div>
                      <p class="text-sm text-neutral-600 leading-relaxed">Your journey can be just as remarkable. At Xonobics, performance and dedication never go unnoticed. Every small effort counts toward building something big. Keep pushing forward with commitment and excellence.</p>
                    </div>
                  </div>

                  <!-- Jitendra Page 4: Query Head Role -->
                  <div v-else-if="currentEmployee.id === 5">
                    <!-- Section header -->
                    <div class="flex items-center mb-5">
                      <div class="w-10 h-10 rounded-lg flex items-center justify-center mr-3 flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                        <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                        </svg>
                      </div>
                      <h2 class="text-xl font-bold text-neutral-900">Query Head Role</h2>
                    </div>

                    <!-- Department Achievements cards -->
                    <h3 class="text-sm font-bold text-neutral-900 mb-3">Department Achievements</h3>
                    <div class="space-y-2 mb-5">
                      <div v-for="(item, idx) in currentEmployee.query_head_achievements" :key="idx"
                        class="flex items-start gap-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200 hover:border-blue-200 transition-colors">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                          <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path v-if="item.icon === 'trending'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                            <path v-else-if="item.icon === 'target'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                          </svg>
                        </div>
                        <div class="flex-1">
                          <div class="font-semibold text-sm text-neutral-900">{{ item.title }}</div>
                          <div class="text-xs text-neutral-500 mt-0.5">{{ item.description }}</div>
                        </div>
                      </div>
                    </div>

                    <!-- Story block -->
                    <div class="flex items-start gap-3 bg-neutral-50 rounded-lg p-4 border border-neutral-200 mb-4">
                      <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                        <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                      </div>
                      <p class="text-sm text-neutral-600 leading-relaxed">{{ currentEmployee.query_head_story }}</p>
                    </div>

                    <!-- Footer chips -->
                    <div v-if="currentEmployee.query_head_footer" class="flex flex-wrap items-center gap-2 pt-3 border-t border-neutral-100">
                      <span v-for="(val, idx) in currentEmployee.query_head_footer" :key="idx"
                        class="px-3 py-1 rounded-full text-xs font-semibold"
                        :style="{ backgroundColor: currentEmployee.color + '15', color: currentEmployee.color }">{{ val }}</span>
                    </div>
                  </div>

                  <!-- Ghouse Page 4: Current Focus & Journey Reflection -->
                  <div v-if="currentEmployee.id === 4">
                    <!-- Section header -->
                    <div class="flex items-center mb-5">
                      <div class="w-10 h-10 rounded-lg flex items-center justify-center mr-3 flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                        <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      </div>
                      <h2 class="text-xl font-bold text-neutral-900">Current Focus & Company Culture</h2>
                    </div>

                    <!-- Current focus story -->
                    <div class="flex items-start gap-3 bg-neutral-50 rounded-lg p-4 border border-neutral-200 mb-5">
                      <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                        <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                      </div>
                      <p class="text-sm text-neutral-600 leading-relaxed">{{ currentEmployee.current_focus_story }}</p>
                    </div>

                    <!-- Company Culture -->
                    <h3 class="text-sm font-bold text-neutral-900 mb-3">Company Culture</h3>
                    <div class="space-y-2 mb-5">
                      <div v-for="(item, idx) in currentEmployee.company_culture" :key="idx"
                        class="flex items-start gap-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200 hover:border-blue-200 transition-colors">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                          <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path v-if="item.icon === 'heart'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                            <path v-else-if="item.icon === 'star'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                          </svg>
                        </div>
                        <div class="flex-1">
                          <div class="font-semibold text-sm text-neutral-900">{{ item.title }}</div>
                          <div class="text-xs text-neutral-500 mt-0.5">{{ item.description }}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Vishal's Page 4: Professional Growth -->
                  <div v-if="currentEmployee.id === 8">
                    <div class="flex items-center mb-6">
                      <div class="w-10 h-10 rounded-lg flex items-center justify-center mr-3" :style="{ backgroundColor: currentEmployee.color + '20' }">
                        <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"/>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                        </svg>
                      </div>
                      <h2 class="text-xl font-bold text-neutral-900">Professional Growth</h2>
                    </div>

                    <h3 class="text-base font-semibold text-neutral-900 mb-4">Deepening Expertise</h3>
                    <div class="space-y-3 mb-6">
                      <div class="flex items-start space-x-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                          <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"/>
                          </svg>
                        </div>
                        <div class="flex-1">
                          <div class="font-semibold text-neutral-900 text-sm">Tax & Billing Mastery</div>
                          <div class="text-xs text-neutral-600 mt-0.5">Deep, concurrent understanding of both tax and billing functions</div>
                        </div>
                      </div>
                      <div class="flex items-start space-x-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                          <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                          </svg>
                        </div>
                        <div class="flex-1">
                          <div class="font-semibold text-neutral-900 text-sm">Cross-Functional Skills</div>
                          <div class="text-xs text-neutral-600 mt-0.5">Grew ability to manage tasks spanning multiple departments effectively</div>
                        </div>
                      </div>
                      <div class="flex items-start space-x-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                          <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                        </div>
                        <div class="flex-1">
                          <div class="font-semibold text-neutral-900 text-sm">Operational Excellence</div>
                          <div class="text-xs text-neutral-600 mt-0.5">Ensured smooth, efficient operations across both areas of responsibility</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p class="text-neutral-700 leading-relaxed">
                        Over the next few seasons, I gained a deep understanding of both tax and billing functions, and my ability to manage cross-functional tasks continued to grow. This period of expansion allowed me to contribute more effectively to the organization's success while building a comprehensive skill set.
                      </p>
                    </div>
                  </div>

                  <!-- Naseer's Page 4 -->
                  <div v-else-if="currentEmployee.id === 1">
                    <div class="flex items-center mb-6">
                      <div class="w-10 h-10 rounded-lg flex items-center justify-center mr-3" :style="{ backgroundColor: currentEmployee.color + '20' }">
                        <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                        </svg>
                      </div>
                      <h2 class="text-xl font-bold text-neutral-900">Personal Values & What Drives Me</h2>
                    </div>

                    <div v-if="currentEmployee.values" class="space-y-3 mb-6">
                      <div 
                        v-for="(value, idx) in currentEmployee.values" 
                        :key="idx"
                        class="flex items-start space-x-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200"
                      >
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                          <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                          </svg>
                        </div>
                        <div class="flex-1">
                          <div class="font-semibold text-neutral-900 text-sm">{{ value.title }}</div>
                          <div class="text-xs text-neutral-600 mt-0.5">{{ value.description }}</div>
                        </div>
                      </div>
                    </div>

                    <div v-if="currentEmployee.closing_note" class="bg-neutral-50 border-l-4 pl-4 py-3 text-sm text-neutral-700 italic" :style="{ borderColor: currentEmployee.color }">
                      {{ currentEmployee.closing_note }}
                    </div>
                  </div>

                  <!-- Ateeq's Page 4 -->
                  <div v-else-if="currentEmployee.id === 2">
                    <div class="flex items-center mb-6">
                      <div class="w-10 h-10 rounded-lg flex items-center justify-center mr-3" :style="{ backgroundColor: currentEmployee.color + '20' }">
                        <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      </div>
                      <h2 class="text-xl font-bold text-neutral-900">Current Leadership & Gratitude</h2>
                    </div>

                    <div v-if="currentEmployee.current_role" class="mb-6">
                      <p class="text-neutral-700 leading-relaxed">{{ currentEmployee.current_role }}</p>
                    </div>

                    <div v-if="currentEmployee.leadership_skills" class="mb-6">
                      <h3 class="text-base font-semibold text-neutral-900 mb-4">Leadership Skills</h3>
                      <div class="space-y-3">
                        <div 
                          v-for="(skill, idx) in currentEmployee.leadership_skills" 
                          :key="idx"
                          class="flex items-start space-x-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200"
                        >
                          <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                            <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path v-if="idx === 0" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                              <path v-else-if="idx === 1" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                          </div>
                          <div class="flex-1">
                            <div class="font-semibold text-neutral-900 text-sm">{{ skill.title }}</div>
                            <div class="text-xs text-neutral-600 mt-0.5">{{ skill.description }}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div v-if="currentEmployee.values">
                      <h3 class="text-base font-semibold text-neutral-900 mb-4">Professional Values</h3>
                      <div class="space-y-3">
                        <div 
                          v-for="(value, idx) in currentEmployee.values" 
                          :key="idx"
                          class="flex items-start space-x-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200"
                        >
                          <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                            <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path v-if="idx === 0" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                              <path v-else-if="idx === 1" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                            </svg>
                          </div>
                          <div class="flex-1">
                            <div class="font-semibold text-neutral-900 text-sm">{{ value.title }}</div>
                            <div class="text-xs text-neutral-600 mt-0.5">{{ value.description }}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div v-if="currentEmployee.closing_note" class="mt-6 bg-neutral-50 border-l-4 pl-4 py-3 text-sm text-neutral-700 italic" :style="{ borderColor: currentEmployee.color }">
                      {{ currentEmployee.closing_note }}
                    </div>
                  </div>

                  <!-- Kashif's Page 4 -->
                  <div v-else-if="currentEmployee.id === 3">
                    <!-- Section header -->
                    <div class="flex items-center mb-5">
                      <div class="w-10 h-10 rounded-lg flex items-center justify-center mr-3 flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                        <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                        </svg>
                      </div>
                      <h2 class="text-xl font-bold text-neutral-900">Company Excellence</h2>
                    </div>

                    <!-- company_excellence story block -->
                    <div v-if="currentEmployee.current_role" class="flex items-start gap-3 bg-neutral-50 rounded-lg p-4 border border-neutral-200 mb-5">
                      <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                        <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                      </div>
                      <p class="text-sm text-neutral-600 leading-relaxed">{{ currentEmployee.current_role }}</p>
                    </div>

                    <!-- What I Value Most -->
                    <h3 class="text-base font-semibold text-neutral-900 mb-3">What I Value Most</h3>
                    <div v-if="currentEmployee.values" class="space-y-2 mb-5">
                      <div 
                        v-for="(value, idx) in currentEmployee.values" 
                        :key="idx"
                        class="flex items-start gap-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200 hover:border-orange-200 transition-colors"
                      >
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                          <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path v-if="idx === 0" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                            <path v-else-if="idx === 1" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                          </svg>
                        </div>
                        <div class="flex-1">
                          <div class="font-semibold text-neutral-900 text-sm">{{ value.title }}</div>
                          <div class="text-xs text-neutral-500 mt-0.5">{{ value.description }}</div>
                        </div>
                      </div>
                    </div>

                    <!-- Footer values chips -->
                    <div v-if="currentEmployee.footer_values" class="flex items-center gap-3 pt-3 border-t border-neutral-100">
                      <span 
                        v-for="(val, idx) in currentEmployee.footer_values" 
                        :key="idx"
                        class="px-3 py-1 rounded-full text-xs font-semibold"
                        :style="{ backgroundColor: currentEmployee.color + '15', color: currentEmployee.color }"
                      >{{ val }}</span>
                    </div>
                  </div>

                  <!-- Mike Gill Christ Page 4: Technical Expertise -->
                  <div v-else-if="currentEmployee.id === 6">
                    <!-- Section header -->
                    <div class="flex items-center mb-6">
                      <div class="w-10 h-10 rounded-lg flex items-center justify-center mr-3" :style="{ backgroundColor: currentEmployee.color + '20' }">
                        <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                      </div>
                      <h2 class="text-xl font-bold text-neutral-900">Technical Proficiency</h2>
                    </div>

                    <!-- Technical skills list -->
                    <div class="space-y-3 mb-6">
                      <div class="flex items-start gap-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                          <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                          </svg>
                        </div>
                        <div>
                          <div class="font-semibold text-sm text-neutral-900">MS Office Suite</div>
                          <div class="text-xs text-neutral-600 mt-0.5">Advanced proficiency in Word, Excel, and data analytics</div>
                        </div>
                      </div>
                      <div class="flex items-start gap-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                          <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 01-2 2h-4a2 2 0 01-2-2v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                          </svg>
                        </div>
                        <div>
                          <div class="font-semibold text-sm text-neutral-900">Data Analytics</div>
                          <div class="text-xs text-neutral-600 mt-0.5">Strong analytical skills and data integrity focus</div>
                        </div>
                      </div>
                      <div class="flex items-start gap-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                          <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                          </svg>
                        </div>
                        <div>
                          <div class="font-semibold text-sm text-neutral-900">Mentoring Excellence</div>
                          <div class="text-xs text-neutral-600 mt-0.5">Proactive approach to employee development</div>
                        </div>
                      </div>
                    </div>

                    <!-- Technical story -->
                    <div class="flex items-start gap-3 bg-neutral-50 rounded-lg p-4 border border-neutral-200 mb-5">
                      <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                        <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                      </div>
                      <p class="text-sm text-neutral-600 leading-relaxed">{{ currentEmployee.technical_story }}</p>
                    </div>

                    <!-- Footer chips -->
                    <div v-if="currentEmployee.technical_footer" class="flex items-center gap-3 pt-3 border-t border-neutral-100">
                      <span 
                        v-for="(val, idx) in currentEmployee.technical_footer" 
                        :key="idx"
                        class="px-3 py-1 rounded-full text-xs font-semibold"
                        :style="{ backgroundColor: currentEmployee.color + '15', color: currentEmployee.color }"
                      >{{ val }}</span>
                    </div>
                  </div>

                </div>

                <!-- Page 5 -->
                <div v-if="employeePageNumber === 5">
                  <!-- Mike Gill Christ Page 5: Core Values -->
                  <div v-if="currentEmployee.id === 6">
                    <!-- Section header -->
                    <div class="flex items-center mb-6">
                      <div class="w-10 h-10 rounded-lg flex items-center justify-center mr-3" :style="{ backgroundColor: currentEmployee.color + '20' }">
                        <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                        </svg>
                      </div>
                      <h2 class="text-xl font-bold text-neutral-900">Core Values</h2>
                    </div>

                    <!-- Values list -->
                    <div class="space-y-2 mb-6">
                      <div class="flex items-start gap-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                          <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                        </div>
                        <div>
                          <div class="font-semibold text-sm text-neutral-900">Empowering People</div>
                          <div class="text-xs text-neutral-600 mt-0.5">Building capability and confidence in every learner</div>
                        </div>
                      </div>
                      <div class="flex items-start gap-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                          <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                          </svg>
                        </div>
                        <div>
                          <div class="font-semibold text-sm text-neutral-900">Continuous Learning</div>
                          <div class="text-xs text-neutral-600 mt-0.5">Fostering a culture of growth and knowledge sharing</div>
                        </div>
                      </div>
                      <div class="flex items-start gap-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                          <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                          </svg>
                        </div>
                        <div>
                          <div class="font-semibold text-sm text-neutral-900">Excellence in Training</div>
                          <div class="text-xs text-neutral-600 mt-0.5">Delivering impactful programs that drive organisational growth</div>
                        </div>
                      </div>
                    </div>

                    <!-- Closing note -->
                    <div class="flex items-start gap-3 bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                      <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                        <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                      </div>
                      <p class="text-sm text-neutral-600 leading-relaxed">Mike's training philosophy is rooted in empowering people to reach their full potential. His commitment to continuous learning, structured development, and excellence in delivery makes him an invaluable asset to Xonobics' mission of building a high-performing, purpose-driven organisation.</p>
                    </div>
                  </div>

                  <!-- Jitendra Page 5: Department Oversight -->
                  <div v-else-if="currentEmployee.id === 5">
                    <!-- Section header -->
                    <div class="flex items-center mb-5">
                      <div class="w-10 h-10 rounded-lg flex items-center justify-center mr-3 flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                        <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                        </svg>
                      </div>
                      <h2 class="text-xl font-bold text-neutral-900">Department Oversight</h2>
                    </div>

                    <!-- Key Responsibilities cards -->
                    <h3 class="text-sm font-bold text-neutral-900 mb-3">Key Responsibilities</h3>
                    <div class="space-y-2 mb-5">
                      <div v-for="(item, idx) in currentEmployee.dept_oversight_responsibilities" :key="idx"
                        class="flex items-start gap-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200 hover:border-blue-200 transition-colors">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                          <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path v-if="item.icon === 'document'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            <path v-else-if="item.icon === 'bulb'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 01-2 2h-4a2 2 0 01-2-2v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                          </svg>
                        </div>
                        <div class="flex-1">
                          <div class="font-semibold text-sm text-neutral-900">{{ item.title }}</div>
                          <div class="text-xs text-neutral-500 mt-0.5">{{ item.description }}</div>
                        </div>
                      </div>
                    </div>

                    <!-- Story block -->
                    <div class="flex items-start gap-3 bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                      <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                        <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                      </div>
                      <p class="text-sm text-neutral-600 leading-relaxed">{{ currentEmployee.dept_oversight_story }}</p>
                    </div>
                  </div>

                  <!-- Ghouse Page 5: Journey Reflection -->
                  <div v-if="currentEmployee.id === 4">
                    <!-- Section header -->
                    <div class="flex items-center mb-5">
                      <div class="w-10 h-10 rounded-lg flex items-center justify-center mr-3 flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                        <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                        </svg>
                      </div>
                      <h2 class="text-xl font-bold text-neutral-900">Journey Reflection</h2>
                    </div>

                    <!-- Two-column layout: text left, image right -->
                    <div class="flex flex-col sm:flex-row gap-5">

                      <!-- Left: reflection content -->
                      <div class="flex-1 flex flex-col gap-4">
                        <!-- Reflection story -->
                        <div class="flex items-start gap-3 bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                          <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                            <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                            </svg>
                          </div>
                          <p class="text-sm text-neutral-600 leading-relaxed">{{ currentEmployee.journey_reflection }}</p>
                        </div>

                        <!-- Footer chips -->
                        <div v-if="currentEmployee.footer_values" class="flex flex-wrap items-center gap-2 pt-3 border-t border-neutral-100">
                          <span v-for="(val, idx) in currentEmployee.footer_values" :key="idx"
                            class="px-3 py-1 rounded-full text-xs font-semibold"
                            :style="{ backgroundColor: currentEmployee.color + '15', color: currentEmployee.color }">{{ val }}</span>
                        </div>
                      </div>

                      <!-- Right: Xonobics brand image -->
                      <!-- <div class="w-full sm:w-2/5 flex-shrink-0 rounded-lg overflow-hidden border border-neutral-200 shadow-sm" style="max-height: 260px;">
                        <img src="/images/xonobics_logo.png" alt="Xonobics" class="w-full h-full object-cover object-center" @error="handleImageError" />
                      </div> -->

                      <div class="w-full sm:w-2/5 flex-shrink-0 rounded-lg overflow-hidden border border-neutral-200 shadow-sm" style="max-height: auto;">
                        <img src="/images/xonobics_dairy.png" alt="Xonobics" class="w-full h-full object-cover object-center" @error="handleImageError" />
                      </div>
                    </div>
                  </div>

                  <!-- Vishal's Page 5: Current Leadership -->
                  <div v-if="currentEmployee.id === 8">
                    <div class="flex items-center mb-6">
                      <div class="w-10 h-10 rounded-lg flex items-center justify-center mr-3" :style="{ backgroundColor: currentEmployee.color + '20' }">
                        <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                        </svg>
                      </div>
                      <h2 class="text-xl font-bold text-neutral-900">Current Leadership</h2>
                    </div>

                    <h3 class="text-base font-semibold text-neutral-900 mb-4">Leadership Responsibilities</h3>
                    <div class="space-y-3 mb-6">
                      <div class="flex items-start space-x-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                          <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                          </svg>
                        </div>
                        <div class="flex-1">
                          <div class="font-semibold text-neutral-900 text-sm">Team Leadership</div>
                          <div class="text-xs text-neutral-600 mt-0.5">Overseeing the billing team and ensuring smooth day-to-day operations</div>
                        </div>
                      </div>
                      <div class="flex items-start space-x-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                          <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                          </svg>
                        </div>
                        <div class="flex-1">
                          <div class="font-semibold text-neutral-900 text-sm">Operational Management</div>
                          <div class="text-xs text-neutral-600 mt-0.5">Maintaining efficiency and effectiveness across all billing processes</div>
                        </div>
                      </div>
                      <div class="flex items-start space-x-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                          <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                          </svg>
                        </div>
                        <div class="flex-1">
                          <div class="font-semibold text-neutral-900 text-sm">Strategic Oversight</div>
                          <div class="text-xs text-neutral-600 mt-0.5">Aligning billing operations with broader organisational goals</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p class="text-neutral-700 leading-relaxed">
                        Currently, I serve as the Billing Team Leader, where I oversee the billing team and ensure smooth operations. This role allows me to apply my comprehensive understanding of tax and billing functions while leading a team toward achieving operational excellence.
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Page 6: Mentoring & Development / Gratitude & Future -->
                <div v-if="employeePageNumber === 6">
                  <!-- Jitendra Page 6: Mentoring & Development -->
                  <div v-if="currentEmployee.id === 5">
                    <!-- Section header -->
                    <div class="flex items-center mb-5">
                      <div class="w-10 h-10 rounded-lg flex items-center justify-center mr-3 flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                        <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                        </svg>
                      </div>
                      <h2 class="text-xl font-bold text-neutral-900">Mentoring & Development</h2>
                    </div>

                    <!-- Leadership Philosophy cards -->
                    <h3 class="text-sm font-bold text-neutral-900 mb-3">Leadership Philosophy</h3>
                    <div class="space-y-2 mb-5">
                      <div v-for="(item, idx) in currentEmployee.leadership_philosophy" :key="idx"
                        class="flex items-start gap-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200 hover:border-blue-200 transition-colors">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                          <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path v-if="item.icon === 'heart'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                            <path v-else-if="item.icon === 'star'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                          </svg>
                        </div>
                        <div class="flex-1">
                          <div class="font-semibold text-sm text-neutral-900">{{ item.title }}</div>
                          <div class="text-xs text-neutral-500 mt-0.5">{{ item.description }}</div>
                        </div>
                      </div>
                    </div>

                    <!-- Story block -->
                    <div class="flex items-start gap-3 bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                      <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                        <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                      </div>
                      <p class="text-sm text-neutral-600 leading-relaxed">{{ currentEmployee.mentoring_story }}</p>
                    </div>
                  </div>

                  <!-- Vishal's Page 6: Gratitude & Future -->
                  <div v-if="currentEmployee.id === 8">
                    <div class="flex items-center mb-6">
                      <div class="w-10 h-10 rounded-lg flex items-center justify-center mr-3" :style="{ backgroundColor: currentEmployee.color + '20' }">
                        <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                        </svg>
                      </div>
                      <h2 class="text-xl font-bold text-neutral-900">Gratitude & Future</h2>
                    </div>

                    <h3 class="text-base font-semibold text-neutral-900 mb-4">What Drives Me</h3>
                    <div class="space-y-3 mb-6">
                      <div class="flex items-start space-x-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                          <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                          </svg>
                        </div>
                        <div class="flex-1">
                          <div class="font-semibold text-neutral-900 text-sm">Deep Gratitude</div>
                          <div class="text-xs text-neutral-600 mt-0.5">Thankful for the trust, mentorship, and guidance from leadership throughout this journey</div>
                        </div>
                      </div>
                      <div class="flex items-start space-x-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                          <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                          </svg>
                        </div>
                        <div class="flex-1">
                          <div class="font-semibold text-neutral-900 text-sm">Continuous Learning</div>
                          <div class="text-xs text-neutral-600 mt-0.5">Committed to ongoing professional development and staying ahead in the field</div>
                        </div>
                      </div>
                      <div class="flex items-start space-x-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                          <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                          </svg>
                        </div>
                        <div class="flex-1">
                          <div class="font-semibold text-neutral-900 text-sm">Future Leadership</div>
                          <div class="text-xs text-neutral-600 mt-0.5">Excited to lead teams toward greater results and contribute to the company's continued growth</div>
                        </div>
                      </div>
                    </div>

                    <div class="bg-neutral-50 border-l-4 pl-4 py-3 text-sm text-neutral-700 italic" :style="{ borderColor: currentEmployee.color }">
                      The support and mentorship from management have been invaluable in my development, both professionally and personally. I'm proud of the journey I've taken so far and confident in leading my team toward even greater results in the future.
                    </div>
                  </div>
                </div>

                <!-- Page 7: Commitment to Excellence (Jitendra) -->
                <div v-if="employeePageNumber === 7">
                  <!-- Jitendra Page 7: Commitment to Excellence -->
                  <div v-if="currentEmployee.id === 5">
                    <!-- Section header -->
                    <div class="flex items-center mb-5">
                      <div class="w-10 h-10 rounded-lg flex items-center justify-center mr-3 flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                        <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                        </svg>
                      </div>
                      <h2 class="text-xl font-bold text-neutral-900">Commitment to Excellence</h2>
                    </div>

                    <!-- Future Commitments cards -->
                    <h3 class="text-sm font-bold text-neutral-900 mb-3">Future Commitments</h3>
                    <div class="space-y-2 mb-5">
                      <div v-for="(item, idx) in currentEmployee.future_commitments" :key="idx"
                        class="flex items-start gap-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200 hover:border-blue-200 transition-colors">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                          <svg class="w-4 h-4" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path v-if="item.icon === 'target'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            <path v-else-if="item.icon === 'bulb'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 01-2 2h-4a2 2 0 01-2-2v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                          </svg>
                        </div>
                        <div class="flex-1">
                          <div class="font-semibold text-sm text-neutral-900">{{ item.title }}</div>
                          <div class="text-xs text-neutral-500 mt-0.5">{{ item.description }}</div>
                        </div>
                      </div>
                    </div>

                    <!-- Commitment story block -->
                    <div class="flex items-start gap-3 bg-neutral-50 rounded-lg p-4 border border-neutral-200 mb-5">
                      <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: currentEmployee.color + '20' }">
                        <svg class="w-5 h-5" :style="{ color: currentEmployee.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                        </svg>
                      </div>
                      <p class="text-sm text-neutral-600 leading-relaxed">{{ currentEmployee.commitment_story }}</p>
                    </div>

                    <!-- Closing note -->
                    <div v-if="currentEmployee.closing_note" class="bg-neutral-50 border-l-4 pl-4 py-3 text-sm text-neutral-700 italic" :style="{ borderColor: currentEmployee.color }">
                      "{{ currentEmployee.closing_note }}"
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <!-- Pagination Footer -->
          <div class="border-t border-neutral-200 bg-neutral-50 px-6 py-4 sm:px-8 flex-shrink-0">
            <div class="flex items-center justify-between w-full">

              <!-- Previous Button -->
              <button
                @click="prevPage"
                :disabled="currentPage === 0"
                class="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                :class="currentPage === 0
                  ? 'text-neutral-400 cursor-not-allowed'
                  : 'text-teal-700 hover:bg-teal-50 hover:text-teal-800'"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
                Previous
              </button>

              <!-- Page Indicator Dots -->
              <div class="flex items-center space-x-2 overflow-x-hidden max-w-[70%] py-1">
                <button
                  v-for="(page, idx) in pages"
                  :key="idx"
                  @click="goToPage(idx)"
                  class="flex-shrink-0 w-2 h-2 rounded-full transition-all"
                  :class="currentPage === idx
                    ? 'bg-teal-500 w-6'
                    : 'bg-neutral-300 hover:bg-neutral-400'"
                  :title="page.title"
                ></button>
              </div>

              <!-- Right: Next -->
              <div class="flex items-center gap-2">
                <button
                  @click="nextPage"
                  :disabled="currentPage === pages.length - 1"
                  class="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                  :class="currentPage === pages.length - 1
                    ? 'text-neutral-400 cursor-not-allowed'
                    : 'text-teal-700 hover:bg-teal-50 hover:text-teal-800'"
                >
                  Next
                  <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

        </div>
        </Teleport>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';
import { Head } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';

const props = defineProps({
  employees: {
    type: Array,
    required: true,
  },
});

const currentPage = ref(0);
const isFullScreen = ref(true);
const cardRef = ref(null);
const toggleFullScreen = async () => {
  isFullScreen.value = !isFullScreen.value;
  if (isFullScreen.value) {
    await nextTick();
    cardRef.value?.focus();
  }
};

// Employees get different page counts: Naseer=4, Ateeq=4, Kashif=4, Ghouse=4, others=3
const COMPANY_PAGES_COUNT = 3;

const getEmployeePageCount = (employeeId) => {
  if (employeeId === 1) return 4; // Naseer has 4 pages
  if (employeeId === 2) return 4; // Ateeq has 4 pages
  if (employeeId === 3) return 4; // Kashif has 4 pages
  if (employeeId === 4) return 5; // Ghouse has 5 pages
  if (employeeId === 5) return 7; // Jitendra has 7 pages
  if (employeeId === 6) return 5; // Mike Gill Christ has 5 pages
  if (employeeId === 7) return 4; // Gogunta Mani has 4 pages
  if (employeeId === 8) return 6; // Vishal has 6 pages
  return 3; // default
};

// Build pages array: company pages + employee pages (variable per employee)
const pages = computed(() => {
  const companyPages = [
    {
      title: 'The Journey of XONOBICS',
      subtitle: 'The Beginning • 2012',
      icon: '<svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="17" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="9" x2="21" y2="9"/></svg>',
    },
    {
      title: 'Our Foundation',
      subtitle: 'From Vision to Reality • 2012–2025',
      icon: '<svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 22V8l9-6 9 6v14"/><path d="M9 22V12h6v10"/><line x1="3" y1="22" x2="21" y2="22"/></svg>',
    },
    {
      title: 'Our Guiding Principles',
      subtitle: 'Building the Future • 2025 & Beyond',
      icon: '<svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>',
    },
  ];

  const employeePages = [];
  props.employees.forEach((emp, empIdx) => {
    const pageCount = getEmployeePageCount(emp.id);
    
    for (let i = 1; i <= pageCount; i++) {
      let pageTitle = emp.name;
      let pageSubtitle = emp.title;

      if (i === 1) { pageTitle = emp.name; pageSubtitle = emp.title; }
      else if (i === 2) {
        if (emp.id === 4) pageTitle = 'Team Growth & Contributions';
        else if (emp.id === 5) pageTitle = 'From Analyst to Leadership';
        else if (emp.id === 6) pageTitle = 'From Analyst to Trainer';
        else if (emp.id === 7) pageTitle = 'Professional Excellence';
        else pageTitle = 'Career Progression';
        pageSubtitle = emp.name;
      }
      else if (i === 3) {
        if (emp.id === 4) pageTitle = 'Leadership Roles';
        else if (emp.id === 5) pageTitle = 'As Team Lead';
        else if (emp.id === 6) pageTitle = 'Excellence in Performance';
        else if (emp.id === 7) pageTitle = 'Professional Contributions';
        else pageTitle = 'Expanding Horizons';
        pageSubtitle = emp.name;
      }
      else if (i === 4) {
        if (emp.id === 4) pageTitle = 'Current Focus & Culture';
        else if (emp.id === 5) pageTitle = 'Query Head Role';
        else if (emp.id === 6) pageTitle = 'Technical Expertise';
        else if (emp.id === 7) pageTitle = 'Inspiring Future Talent';
        else pageTitle = 'Professional Growth';
        pageSubtitle = emp.name;
      }
      else if (i === 5) {
        if (emp.id === 4) pageTitle = 'Journey Reflection';
        else if (emp.id === 5) pageTitle = 'Department Oversight';
        else pageTitle = 'Current Leadership';
        pageSubtitle = emp.name;
      }
      else if (i === 6) {
        pageTitle = emp.id === 5 ? 'Mentoring & Development' : 'Gratitude & Future';
        pageSubtitle = emp.name;
      }
      else if (i === 7) { pageTitle = 'Commitment to Excellence'; pageSubtitle = emp.name; }
      employeePages.push({
        title: pageTitle,
        subtitle: pageSubtitle,
        icon: '<svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>',
        employee: emp,
        employeeIndex: empIdx,
        pageNumber: i,
      });
    }
  });

  return [...companyPages, ...employeePages];
});

const currentEmployee = computed(() => {
  if (currentPage.value >= COMPANY_PAGES_COUNT) {
    const employeePageIndex = currentPage.value - COMPANY_PAGES_COUNT;
    
    let cumulativePages = 0;
    for (let i = 0; i < props.employees.length; i++) {
      const employeePageCount = getEmployeePageCount(props.employees[i].id);
      if (employeePageIndex < cumulativePages + employeePageCount) {
        return props.employees[i];
      }
      cumulativePages += employeePageCount;
    }
  }
  return null;
});

const employeePageNumber = computed(() => {
  if (currentPage.value >= COMPANY_PAGES_COUNT) {
    const employeePageIndex = currentPage.value - COMPANY_PAGES_COUNT;
    
    let cumulativePages = 0;
    for (let i = 0; i < props.employees.length; i++) {
      const employeePageCount = getEmployeePageCount(props.employees[i].id);
      if (employeePageIndex < cumulativePages + employeePageCount) {
        return (employeePageIndex - cumulativePages) + 1;
      }
      cumulativePages += employeePageCount;
    }
  }
  return 0;
});

const nextPage = () => {
  if (currentPage.value < pages.value.length - 1) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 0) {
    currentPage.value--;
  }
};

const goToPage = (index) => {
  currentPage.value = index;
};

const handleImageError = (event) => {
  event.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"%3E%3Crect width="80" height="80" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';
};
</script>
