<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Leave Management"
      subtitle="View and manage leave requests"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >
      <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
        <div class="p-6 text-gray-900">
          <!-- Header Actions -->
          <div class="flex justify-between items-start mb-6">
            <div>
              <h3 class="text-lg font-medium text-gray-900">Leave Requests</h3>
              <p class="mt-1 text-sm text-gray-600">
                View and manage leave requests.
              </p>
            </div>
            <div class="flex items-center space-x-4">
              <!-- Search Field -->
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
                </div>
                <input
                  v-model="localFilters.search"
                  type="text"
                  placeholder="Search by employee name or reason..."
                  class="block w-80 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  @input="debouncedApplyFilters"
                />
              </div>
              
              <!-- Show Filters Button -->
              <button
                @click="showFilters = !showFilters"
                class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FunnelIcon class="w-4 h-4 mr-2" />
                {{ showFilters ? 'Hide Filters' : 'Show Filters' }}
              </button>
            </div>
          </div>

            <!-- Filter Controls -->
            <div v-if="showFilters" class="mb-6 p-4 bg-gray-50 rounded-lg">
              <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                <!-- Employee Filter (Admin/HR only) -->
                <div v-if="canManageLeaves">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                  <select
                    v-model="localFilters.employee_id"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    @change="applyFilters"
                  >
                    <option value="">All employees</option>
                    <option v-for="employee in employees" :key="employee.id" :value="employee.id">
                      {{ employee.name }}
                    </option>
                  </select>
                </div>
                
                <!-- Status Filter -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    v-model="localFilters.status"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    @change="applyFilters"
                  >
                    <option value="">All statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <!-- Leave Type Filter -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                  <select
                    v-model="localFilters.type"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    @change="applyFilters"
                  >
                    <option value="">All types</option>
                    <option v-for="type in filters.leaveTypes" :key="type.id" :value="type.name.toLowerCase().replace(' leave', '')">
                      {{ type.name }}
                    </option>
                  </select>
                </div>

                <!-- Date From -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                  <input
                    v-model="localFilters.date_from"
                    type="date"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    @change="applyFilters"
                  />
                </div>

                <!-- Date To -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                  <input
                    v-model="localFilters.date_to"
                    type="date"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    @change="applyFilters"
                  />
                </div>
              </div>

              <!-- Active Filters -->
              <div v-if="hasActiveFilters" class="mt-4 flex flex-wrap gap-2">
                <span class="text-sm font-medium text-gray-700">Active filters:</span>
                
                <span 
                  v-if="localFilters.employee_id"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  Employee: {{ getEmployeeName(localFilters.employee_id) }}
                  <button 
                    @click="clearFilter('employee_id')"
                    class="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none"
                  >
                    <span class="sr-only">Remove employee filter</span>
                    <svg class="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                      <path d="M4 3.293l2.146-2.147a.5.5 0 01.708.708L4.707 4l2.147 2.146a.5.5 0 01-.708.708L4 4.707l-2.146 2.147a.5.5 0 01-.708-.708L3.293 4 1.146 1.854a.5.5 0 01.708-.708L4 3.293z" />
                    </svg>
                  </button>
                </span>

                <span 
                  v-if="localFilters.status"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  Status: {{ formatStatus(localFilters.status) }}
                  <button 
                    @click="clearFilter('status')"
                    class="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-green-400 hover:bg-green-200 hover:text-green-500 focus:outline-none"
                  >
                    <span class="sr-only">Remove status filter</span>
                    <svg class="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                      <path d="M4 3.293l2.146-2.147a.5.5 0 01.708.708L4.707 4l2.147 2.146a.5.5 0 01-.708.708L4 4.707l-2.146 2.147a.5.5 0 01-.708-.708L3.293 4 1.146 1.854a.5.5 0 01.708-.708L4 3.293z" />
                    </svg>
                  </button>
                </span>

                <span 
                  v-if="localFilters.type"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                >
                  Type: {{ getLeaveTypeName(localFilters.type) }}
                  <button 
                    @click="clearFilter('type')"
                    class="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-yellow-400 hover:bg-yellow-200 hover:text-yellow-500 focus:outline-none"
                  >
                    <span class="sr-only">Remove type filter</span>
                    <svg class="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                      <path d="M4 3.293l2.146-2.147a.5.5 0 01.708.708L4.707 4l2.147 2.146a.5.5 0 01-.708.708L4 4.707l-2.146 2.147a.5.5 0 01-.708-.708L3.293 4 1.146 1.854a.5.5 0 01.708-.708L4 3.293z" />
                    </svg>
                  </button>
                </span>

                <span 
                  v-if="localFilters.date_from"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                >
                  From: {{ formatDate(localFilters.date_from) }}
                  <button 
                    @click="clearFilter('date_from')"
                    class="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-purple-400 hover:bg-purple-200 hover:text-purple-500 focus:outline-none"
                  >
                    <span class="sr-only">Remove date from filter</span>
                    <svg class="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                      <path d="M4 3.293l2.146-2.147a.5.5 0 01.708.708L4.707 4l2.147 2.146a.5.5 0 01-.708.708L4 4.707l-2.146 2.147a.5.5 0 01-.708-.708L3.293 4 1.146 1.854a.5.5 0 01.708-.708L4 3.293z" />
                    </svg>
                  </button>
                </span>

                <span 
                  v-if="localFilters.date_to"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                >
                  To: {{ formatDate(localFilters.date_to) }}
                  <button 
                    @click="clearFilter('date_to')"
                    class="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-purple-400 hover:bg-purple-200 hover:text-purple-500 focus:outline-none"
                  >
                    <span class="sr-only">Remove date to filter</span>
                    <svg class="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                      <path d="M4 3.293l2.146-2.147a.5.5 0 01.708.708L4.707 4l2.147 2.146a.5.5 0 01-.708.708L4 4.707l-2.146 2.147a.5.5 0 01-.708-.708L3.293 4 1.146 1.854a.5.5 0 01.708-.708L4 3.293z" />
                    </svg>
                  </button>
                </span>

                <button 
                  @click="resetFilters"
                  class="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear all
                </button>
              </div>
            </div>



            <!-- Leaves Table -->
            <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-300">
                <thead class="bg-gray-50">
                  <tr>
                    <th v-if="canManageLeaves" scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Leave Type
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dates
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" class="relative px-6 py-3">
                      <span class="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="leave in leaves.data" :key="leave.id" class="hover:bg-gray-50">
                    <td v-if="canManageLeaves" class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-8 w-8">
                          <div class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <span class="text-sm font-medium text-gray-700">
                              {{ getInitials(leave.employee?.user?.name || '') }}
                            </span>
                          </div>
                        </div>
                        <div class="ml-3">
                          <div class="text-sm font-medium text-gray-900">
                            {{ leave.employee?.user?.name || 'N/A' }}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ leave.leave_type?.name || 'N/A' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <div>{{ formatDate(leave.from_date) }}</div>
                        <div>{{ formatDate(leave.to_date) }}</div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ calculateDays(leave.from_date, leave.to_date) }} {{ calculateDays(leave.from_date, leave.to_date) === 1 ? 'day' : 'days' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="getStatusClasses(leave.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                        {{ formatStatus(leave.status) }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div class="flex items-center justify-end">
                        <!-- Unified Actions Menu -->
                        <div class="relative" :ref="el => setDropdownRef(el, leave.id)">
                          <button
                            @click="toggleDropdown(leave.id)"
                            class="inline-flex items-center p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
                            :title="'Actions'"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>
                          
                          <!-- Unified Dropdown Menu -->
                          <div
                            v-if="activeDropdown === leave.id"
                            class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
                          >
                            <!-- View Action (always available) -->
                            <Link
                              :href="route('leaves.show', leave.id)"
                              class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                            >
                              <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View Details
                            </Link>

                            <!-- Divider if there are management actions -->
                            <div v-if="canApprove(leave) || canReject(leave) || canEdit(leave)" class="border-t border-gray-100 my-1"></div>

                            <!-- Approve Action -->
                            <button
                              v-if="canApprove(leave)"
                              @click="approve(leave.id)"
                              class="flex items-center w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50 transition-colors duration-150"
                            >
                              <svg class="w-4 h-4 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                              </svg>
                              Approve Request
                            </button>

                            <!-- Reject Action -->
                            <button
                              v-if="canReject(leave)"
                              @click="reject(leave.id)"
                              class="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors duration-150"
                            >
                              <svg class="w-4 h-4 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Reject Request
                            </button>

                            <!-- Edit Action -->
                            <Link
                              v-if="canEdit(leave)"
                              :href="route('leaves.edit', leave.id)"
                              class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                            >
                              <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit Request
                            </Link>

                            <!-- Delete Action -->
                            <button
                              v-if="canDelete(leave)"
                              @click="confirmDelete(leave)"
                              class="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors duration-150"
                            >
                              <svg class="w-4 h-4 mr-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete Request
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
                </table>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="leaves.data.length === 0" class="text-center py-12">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">No leave requests</h3>
              <p class="mt-1 text-sm text-gray-500">
                {{ hasActiveFilters ? 'Try adjusting your filters' : 'Get started by creating a new leave request' }}
              </p>
              <div v-if="hasActiveFilters" class="mt-6">
                <Link 
                  :href="route('leaves.create')" 
                  class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Create New Request
                </Link>
              </div>
            </div>

            <!-- Pagination -->
            <div v-if="leaves.last_page > 1" class="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div class="flex flex-1 justify-between sm:hidden">
                <Link 
                  v-if="leaves.prev_page_url"
                  :href="leaves.prev_page_url" 
                  class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Previous
                </Link>
                <Link 
                  v-if="leaves.next_page_url"
                  :href="leaves.next_page_url" 
                  class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Next
                </Link>
              </div>
              <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p class="text-sm text-gray-700">
                    Showing
                    <span class="font-medium">{{ leaves.from }}</span>
                    to
                    <span class="font-medium">{{ leaves.to }}</span>
                    of
                    <span class="font-medium">{{ leaves.total }}</span>
                    results
                  </p>
                </div>
                <div>
                  <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <Link 
                      v-if="leaves.prev_page_url"
                      :href="leaves.prev_page_url"
                      class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                    >
                      <span class="sr-only">Previous</span>
                      <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
                      </svg>
                    </Link>
                    
                    <template v-for="link in leaves.links" :key="link.label">
                      <Link 
                        v-if="link.url && !link.label.includes('Previous') && !link.label.includes('Next')"
                        :href="link.url"
                        :class="[
                          'relative inline-flex items-center px-4 py-2 text-sm font-semibold',
                          link.active 
                            ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600' 
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                        ]"
                      >
                        {{ link.label }}
                      </Link>
                    </template>
                    
                    <Link 
                      v-if="leaves.next_page_url"
                      :href="leaves.next_page_url"
                      class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                    >
                      <span class="sr-only">Next</span>
                      <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                      </svg>
                    </Link>
                  </nav>
                </div>
              </div>
            </div>
          </div>
      </div>
      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="showDeleteModal = false"></div>
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Delete Leave Request
                  </h3>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">
                      Are you sure you want to delete this leave request? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button 
                @click="deleteLeave" 
                type="button" 
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Delete
              </button>
              <button 
                @click="showDeleteModal = false" 
                type="button" 
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Approval Modal -->
      <ApprovalModal
        :show="showApprovalModal"
        :approval="currentLeave"
        :action="approvalAction"
        @close="closeApprovalModal"
        @submit="handleApprovalSubmit"
      />
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Link, router } from '@inertiajs/vue3';
import { debounce } from 'lodash';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';
import ApprovalModal from '@/Components/Dashboard/ApprovalModal.vue';
import { useAuth } from '@/composables/useAuth.js';
import { 
  FunnelIcon,
  MagnifyingGlassIcon 
} from '@heroicons/vue/24/outline';

const props = defineProps({
  leaves: {
    type: Object,
    required: true
  },
  queryParams: {
    type: Object,
    default: () => ({})
  },
  canManageLeaves: {
    type: Boolean,
    default: false
  },
  filters: {
    type: Object,
    default: () => ({
      leaveTypes: [],
      employees: []
    })
  }
});

const { hasRole, hasAnyRole } = useAuth();

// Refs
const showDeleteModal = ref(false);
const showFilters = ref(false);
const loading = ref(false);
const leaveToDelete = ref(null);
const activeDropdown = ref(null);
const dropdownRefs = ref({});

// Approval modal refs
const showApprovalModal = ref(false);
const currentLeave = ref(null);
const approvalAction = ref('approve');
const localFilters = ref({
  employee_id: props.queryParams.employee_id || '',
  status: props.queryParams.status || '',
  type: props.queryParams.type || '',
  search: props.queryParams.search || '',
  date_from: props.queryParams.date_from || '',
  date_to: props.queryParams.date_to || ''
});

// Computed
const isAdminOrHR = computed(() => hasAnyRole(['Admin', 'HR']));

const employees = computed(() => props.filters.employees || []);

const hasActiveFilters = computed(() => {
  return (
    localFilters.value.employee_id ||
    localFilters.value.status ||
    localFilters.value.type ||
    localFilters.value.search ||
    localFilters.value.date_from ||
    localFilters.value.date_to
  );
});

const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Leave Management', current: true }
]);

const headerActions = computed(() => [
  {
    id: 'new-request',
    label: 'New Request',
    icon: 'plus',
    variant: 'primary',
    href: route('leaves.create')
  }
]);

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatStatus = (status) => {
  const statusMap = {
    'pending': 'Pending',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'cancelled': 'Cancelled'
  };
  return statusMap[status] || status || 'N/A';
};

const getStatusClasses = (status) => {
  const classes = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
    'cancelled': 'bg-gray-100 text-gray-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

const getInitials = (name) => {
  if (!name) return '--';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const calculateDays = (fromDate, toDate) => {
  if (!fromDate || !toDate) return 0;
  
  // Parse dates as local dates to avoid timezone issues
  const startParts = fromDate.split(/[-T\s]/);
  const endParts = toDate.split(/[-T\s]/);
  
  const start = new Date(parseInt(startParts[0]), parseInt(startParts[1]) - 1, parseInt(startParts[2]));
  const end = new Date(parseInt(endParts[0]), parseInt(endParts[1]) - 1, parseInt(endParts[2]));
  
  // Calculate difference in days
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
  return diffDays;
};

const getLeaveTypeName = (simplifiedType) => {
  if (!simplifiedType) return 'Unknown';
  
  // Convert simplified type back to full name for display
  const typeMapping = {
    'annual': 'Annual Leave',
    'sick': 'Sick Leave',
    'personal': 'Personal Leave',
    'maternity': 'Maternity Leave',
    'paternity': 'Paternity Leave',
    'study': 'Study Leave',
    'emergency': 'Emergency Leave'
  };
  
  return typeMapping[simplifiedType] || simplifiedType;
};

const getEmployeeName = (employeeId) => {
  if (!employeeId) return 'Unknown';
  const employee = employees.value.find(emp => emp.id == employeeId);
  return employee ? employee.name : 'Unknown';
};

// Permission checks
const canEdit = (leave) => {
  // Only allow editing pending leaves
  if (leave.status !== 'pending') return false;
  
  // Employees can edit their own leaves, managers/admins can edit any
  if (props.canManageLeaves) return true;
  
  // For employees, they can only edit their own (this would need user comparison)
  return leave.status === 'pending';
};

const canDelete = (leave) => {
  // Similar logic to canEdit
  return canEdit(leave);
};

const canApprove = (leave) => {
  return props.canManageLeaves && leave.status === 'pending';
};

const canReject = (leave) => {
  return props.canManageLeaves && leave.status === 'pending';
};

// Filter methods
const applyFilters = () => {
  const params = { ...localFilters.value };
  
  // Remove empty values
  Object.keys(params).forEach(key => {
    if (params[key] === null || params[key] === '') {
      delete params[key];
    }
  });
  
  loading.value = true;
  router.get(route('leaves.index'), params, {
    preserveState: true,
    preserveScroll: true,
    onFinish: () => {
      loading.value = false;
    }
  });
};

const debouncedApplyFilters = debounce(applyFilters, 300);

const clearFilter = (filterKey) => {
  localFilters.value[filterKey] = '';
  applyFilters();
};

const resetFilters = () => {
  localFilters.value = {
    employee_id: '',
    status: '',
    type: '',
    search: '',
    date_from: '',
    date_to: ''
  };
  
  // Navigate to the clean URL without any query parameters
  loading.value = true;
  router.get(route('leaves.index'), {}, {
    preserveState: false,
    preserveScroll: true,
    onFinish: () => {
      loading.value = false;
    }
  });
};

// Action methods
const confirmDelete = (leave) => {
  leaveToDelete.value = leave;
  showDeleteModal.value = true;
};

const deleteLeave = () => {
  if (leaveToDelete.value) {
    router.delete(route('leaves.destroy', leaveToDelete.value.id), {
      onSuccess: () => {
        showDeleteModal.value = false;
        leaveToDelete.value = null;
      }
    });
  }
};

const approve = (leaveId) => {
  const leave = props.leaves.data.find(l => l.id === leaveId);
  if (leave) {
    currentLeave.value = leave;
    approvalAction.value = 'approve';
    showApprovalModal.value = true;
    activeDropdown.value = null; // Close dropdown
  }
};

const reject = (leaveId) => {
  const leave = props.leaves.data.find(l => l.id === leaveId);
  if (leave) {
    currentLeave.value = leave;
    approvalAction.value = 'reject';
    showApprovalModal.value = true;
    activeDropdown.value = null; // Close dropdown
  }
};

// Handle approval modal submission
const handleApprovalSubmit = (data) => {
  const { approval, action, comments } = data;
  
  router.post(route(`leaves.${action}`, approval.id), {
    comments: comments
  }, {
    onSuccess: () => {
      showApprovalModal.value = false;
      currentLeave.value = null;
    },
    onError: (errors) => {
      console.error('Approval error:', errors);
    }
  });
};

const closeApprovalModal = () => {
  showApprovalModal.value = false;
  currentLeave.value = null;
};

// Dropdown functionality
const toggleDropdown = (leaveId) => {
  activeDropdown.value = activeDropdown.value === leaveId ? null : leaveId;
};

const setDropdownRef = (el, leaveId) => {
  if (el) {
    dropdownRefs.value[leaveId] = el;
  }
};

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (activeDropdown.value) {
    const dropdownEl = dropdownRefs.value[activeDropdown.value];
    if (dropdownEl && !dropdownEl.contains(event.target)) {
      activeDropdown.value = null;
    }
  }
};

// Add event listener for click outside
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
/* Add any custom styles here */
</style>