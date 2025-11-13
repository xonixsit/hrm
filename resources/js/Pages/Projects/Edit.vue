<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Edit Project"
      :subtitle="`Update details for ${project.name}`"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
      @action="handleHeaderAction"
    >
      <!-- Project Status Banner -->
      <div v-if="project.status" class="mb-6">
        <div :class="getStatusBannerClasses(project.status)" class="rounded-lg p-4 border-l-4">
          <div class="flex items-center">
            <Icon :name="getStatusIcon(project.status)" class="w-5 h-5 mr-3" />
            <div>
              <h4 class="font-medium">Project Status: {{ getStatusLabel(project.status) }}</h4>
              <p class="text-sm opacity-90 mt-1">
                {{ getStatusDescription(project.status) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Form -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <form @submit.prevent="handleSubmit" class="space-y-8">
          <!-- Basic Information Section -->
          <div class="px-6 py-6 border-b border-gray-200">
            <div class="flex items-center mb-6">
              <div class="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Icon name="information-circle" class="w-5 h-5 text-indigo-600" />
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-medium text-gray-900">Basic Information</h3>
                <p class="text-sm text-gray-500">Essential project details and description</p>
              </div>
            </div>

            <div class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Project Name -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Project Name <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.name"
                    type="text"
                    placeholder="Enter project name"
                    :class="[
                      'w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm',
                      form.errors.name ? 'border-red-300 text-red-900 placeholder-red-300' : 'border-gray-300'
                    ]"
                    :disabled="form.processing"
                    required
                  />
                  <p v-if="form.errors.name" class="mt-1 text-sm text-red-600">{{ form.errors.name }}</p>
                </div>

                <!-- Client -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Client</label>
                  <input
                    v-model="form.client"
                    type="text"
                    placeholder="Enter client name"
                    :class="[
                      'w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm',
                      form.errors.client ? 'border-red-300 text-red-900 placeholder-red-300' : 'border-gray-300'
                    ]"
                    :disabled="form.processing"
                  />
                  <p v-if="form.errors.client" class="mt-1 text-sm text-red-600">{{ form.errors.client }}</p>
                </div>
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  v-model="form.description"
                  placeholder="Describe the project objectives, deliverables, and key requirements..."
                  rows="4"
                  :class="[
                    'w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm',
                    form.errors.description ? 'border-red-300 text-red-900 placeholder-red-300' : 'border-gray-300'
                  ]"
                  :disabled="form.processing"
                ></textarea>
                <p v-if="form.errors.description" class="mt-1 text-sm text-red-600">{{ form.errors.description }}</p>
              </div>
            </div>
          </div>

          <!-- Project Details Section -->
          <div class="px-6 py-6 border-b border-gray-200">
            <div class="flex items-center mb-6">
              <div class="flex-shrink-0 w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <Icon name="cog" class="w-5 h-5 text-teal-600" />
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-medium text-gray-900">Project Details</h3>
                <p class="text-sm text-gray-500">Timeline, priority, and status information</p>
              </div>
            </div>

            <div class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Status -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    v-model="form.status"
                    :class="[
                      'w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm',
                      form.errors.status ? 'border-red-300' : 'border-gray-300'
                    ]"
                    :disabled="form.processing"
                  >
                    <option value="">Select status</option>
                    <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </option>
                  </select>
                  <p v-if="form.errors.status" class="mt-1 text-sm text-red-600">{{ form.errors.status }}</p>
                </div>

                <!-- Priority -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    v-model="form.priority"
                    :class="[
                      'w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm',
                      form.errors.priority ? 'border-red-300' : 'border-gray-300'
                    ]"
                    :disabled="form.processing"
                  >
                    <option value="">Select priority</option>
                    <option v-for="option in priorityOptions" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </option>
                  </select>
                  <p v-if="form.errors.priority" class="mt-1 text-sm text-red-600">{{ form.errors.priority }}</p>
                </div>

                <!-- Budget -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Budget</label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span class="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      v-model="form.budget"
                      type="number"
                      placeholder="0.00"
                      :class="[
                        'w-full pl-7 pr-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm',
                        form.errors.budget ? 'border-red-300' : 'border-gray-300'
                      ]"
                      :disabled="form.processing"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <p v-if="form.errors.budget" class="mt-1 text-sm text-red-600">{{ form.errors.budget }}</p>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Start Date -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <DateInput
                    v-model="form.start_date"
                    :error="!!form.errors.start_date"
                    :disabled="form.processing"
                    show-calendar-icon
                  />
                  <p v-if="form.errors.start_date" class="mt-1 text-sm text-red-600">{{ form.errors.start_date }}</p>
                </div>

                <!-- Due Date -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                  <DateInput
                    v-model="form.due_date"
                    :error="!!form.errors.due_date"
                    :disabled="form.processing"
                    :min="form.start_date"
                    show-calendar-icon
                  />
                  <p v-if="form.errors.due_date" class="mt-1 text-sm text-red-600">{{ form.errors.due_date }}</p>
                  <div v-else-if="form.due_date" class="mt-1 text-xs text-gray-500">
                    <span v-if="isDateInPast(form.due_date)" class="text-red-600">
                      ⚠️ Due date is in the past
                    </span>
                    <span v-else-if="form.start_date && form.due_date">
                      {{ getDurationText(form.start_date, form.due_date) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Progress -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Progress</label>
                <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div class="flex items-center justify-between mb-3">
                    <span class="text-sm text-gray-600">Project Completion</span>
                    <div class="flex items-center space-x-2">
                      <input
                        v-model.number="form.progress"
                        type="number"
                        min="0"
                        max="100"
                        class="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500 text-center font-medium"
                        :disabled="form.processing"
                        @input="handleProgressInput"
                      />
                      <span class="text-sm text-gray-500 font-medium">%</span>
                    </div>
                  </div>
                  
                  <!-- Interactive Progress Bar -->
                  <div class="relative">
                    <div class="w-full bg-gray-200 rounded-full h-3 cursor-pointer" @click="updateProgressFromClick">
                      <div 
                        class="bg-gradient-to-r from-indigo-500 to-indigo-600 h-3 rounded-full transition-all duration-300 shadow-sm"
                        :style="{ width: `${currentProgress}%` }"
                      ></div>
                    </div>
                    
                    <!-- Progress Milestones -->
                    <div class="flex justify-between mt-2 text-xs text-gray-400">
                      <span>0%</span>
                      <span>25%</span>
                      <span>50%</span>
                      <span>75%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  
                  <!-- Progress Status -->
                  <div class="mt-3 flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                      <div :class="getProgressStatusClasses(currentProgress)" class="w-2 h-2 rounded-full"></div>
                      <span class="text-sm font-medium" :class="getProgressTextClasses(currentProgress)">
                        {{ getProgressStatusText(currentProgress) }}
                      </span>
                    </div>
                    <span class="text-xs text-gray-500">
                      {{ getProgressDescription(currentProgress) }}
                    </span>
                  </div>
                  

                </div>
                <p v-if="form.errors.progress" class="mt-1 text-sm text-red-600">{{ form.errors.progress }}</p>
              </div>
            </div>
          </div>

          <!-- Team Assignment Section -->
          <div class="px-6 py-6">
            <div class="flex items-center mb-6">
              <div class="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Icon name="users" class="w-5 h-5 text-green-600" />
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-medium text-gray-900">Team Assignment</h3>
                <p class="text-sm text-gray-500">Assign team members and project manager</p>
              </div>
            </div>

            <div class="space-y-6">
              <!-- Team Members -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Team Members</label>
                
                <!-- Selected Team Members Display -->
                <div v-if="selectedTeamMembers.length > 0" class="mb-3">
                  <div class="flex flex-wrap gap-2">
                    <div 
                      v-for="member in selectedTeamMembers" 
                      :key="member.value"
                      class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800 border border-indigo-200"
                    >
                      <div class="w-6 h-6 bg-indigo-200 rounded-full flex items-center justify-center mr-2 text-xs font-medium">
                        {{ member.label.charAt(0).toUpperCase() }}
                      </div>
                      <span class="font-medium">{{ member.label }}</span>
                      <button
                        type="button"
                        @click="removeTeamMember(member.value)"
                        :disabled="form.processing"
                        class="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-indigo-600 hover:bg-indigo-200 hover:text-indigo-800 focus:outline-none focus:bg-indigo-200"
                      >
                        <Icon name="x" class="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Team Member Selection Dropdown -->
                <div class="relative">
                  <button
                    type="button"
                    @click="toggleTeamMemberDropdown"
                    :disabled="form.processing"
                    :class="[
                      'w-full px-3 py-2 border rounded-md shadow-sm text-left focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm flex items-center justify-between',
                      form.errors.team_members ? 'border-red-300' : 'border-gray-300',
                      form.processing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white hover:bg-gray-50'
                    ]"
                  >
                    <span class="text-gray-500">
                      {{ selectedTeamMembers.length > 0 ? `${selectedTeamMembers.length} member${selectedTeamMembers.length > 1 ? 's' : ''} selected` : 'Select team members' }}
                    </span>
                    <Icon :name="showTeamMemberDropdown ? 'chevron-up' : 'chevron-down'" class="w-4 h-4 text-gray-400" />
                  </button>

                  <!-- Dropdown Menu -->
                  <div 
                    v-if="showTeamMemberDropdown"
                    @click.stop
                    class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
                  >
                    <!-- Search Input -->
                    <div class="sticky top-0 bg-white px-3 py-2 border-b border-gray-200">
                      <input
                        v-model="teamMemberSearch"
                        type="text"
                        placeholder="Search team members..."
                        class="w-full px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        @click.stop
                      />
                    </div>

                    <!-- Team Member Options -->
                    <div
                      v-for="option in filteredTeamMemberOptions"
                      :key="option.value"
                      @click="toggleTeamMember(option)"
                      class="cursor-pointer select-none relative py-3 pl-3 pr-12 hover:bg-gray-50 flex items-center"
                    >
                      <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3 text-sm font-medium text-gray-600 flex-shrink-0">
                        {{ option.label.charAt(0).toUpperCase() }}
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="font-medium text-gray-900 truncate">{{ option.label }}</div>
                        <div class="text-sm text-gray-500 truncate">{{ option.description }}</div>
                      </div>
                      <div v-if="isTeamMemberSelected(option.value)" class="absolute inset-y-0 right-0 flex items-center pr-3 flex-shrink-0">
                        <Icon name="check" class="w-4 h-4 text-indigo-600" />
                      </div>
                    </div>

                    <div v-if="filteredTeamMemberOptions.length === 0" class="px-3 py-2 text-sm text-gray-500 text-center">
                      No team members found
                    </div>
                  </div>
                </div>
                
                <p v-if="form.errors.team_members" class="mt-1 text-sm text-red-600">{{ form.errors.team_members }}</p>
              </div>

              <!-- Project Manager -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Project Manager</label>
                
                <!-- Selected Manager Display -->
                <div v-if="selectedManager" class="mb-3">
                  <div class="inline-flex items-center px-3 py-2 rounded-lg bg-teal-50 border border-teal-200">
                    <div class="w-8 h-8 bg-teal-200 rounded-full flex items-center justify-center mr-3 text-sm font-medium text-teal-800">
                      {{ selectedManager.label.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <div class="font-medium text-teal-900">{{ selectedManager.label }}</div>
                      <div class="text-sm text-teal-700">{{ selectedManager.description }}</div>
                    </div>
                    <button
                      type="button"
                      @click="form.manager_id = ''"
                      :disabled="form.processing"
                      class="ml-3 inline-flex items-center justify-center w-5 h-5 rounded-full text-teal-600 hover:bg-teal-200 focus:outline-none focus:bg-teal-200"
                    >
                      <Icon name="x" class="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <!-- Manager Selection Dropdown -->
                <div class="relative">
                  <button
                    type="button"
                    @click="toggleManagerDropdown"
                    :disabled="form.processing"
                    :class="[
                      'w-full px-3 py-2 border rounded-md shadow-sm text-left focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm flex items-center justify-between',
                      form.errors.manager_id ? 'border-red-300' : 'border-gray-300',
                      form.processing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white hover:bg-gray-50'
                    ]"
                  >
                    <span :class="selectedManager ? 'text-gray-900' : 'text-gray-500'">
                      {{ selectedManager ? selectedManager.label : 'Select project manager' }}
                    </span>
                    <Icon :name="showManagerDropdown ? 'chevron-up' : 'chevron-down'" class="w-4 h-4 text-gray-400" />
                  </button>

                  <!-- Manager Dropdown Menu -->
                  <div 
                    v-if="showManagerDropdown"
                    @click.stop
                    class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
                  >
                    <!-- Search Input -->
                    <div class="sticky top-0 bg-white px-3 py-2 border-b border-gray-200">
                      <input
                        v-model="managerSearch"
                        type="text"
                        placeholder="Search managers..."
                        class="w-full px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        @click.stop
                      />
                    </div>

                    <!-- Clear Selection Option -->
                    <div
                      @click="selectManager(null)"
                      class="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-50 flex items-center text-gray-500"
                    >
                      <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                        <Icon name="x" class="w-4 h-4" />
                      </div>
                      <div class="flex-1">
                        <div class="font-medium">No manager assigned</div>
                        <div class="text-sm text-gray-400">Clear manager selection</div>
                      </div>
                    </div>

                    <!-- Manager Options -->
                    <div
                      v-for="option in filteredManagerOptions"
                      :key="option.value"
                      @click="selectManager(option)"
                      class="cursor-pointer select-none relative py-3 pl-3 pr-12 hover:bg-gray-50 flex items-center"
                    >
                      <div class="w-8 h-8 bg-teal-200 rounded-full flex items-center justify-center mr-3 text-sm font-medium text-teal-800 flex-shrink-0">
                        {{ option.label.charAt(0).toUpperCase() }}
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="font-medium text-gray-900 truncate">{{ option.label }}</div>
                        <div class="text-sm text-gray-500 truncate">{{ option.description }}</div>
                      </div>
                      <div v-if="form.manager_id === option.value" class="absolute inset-y-0 right-0 flex items-center pr-3 flex-shrink-0">
                        <Icon name="check" class="w-4 h-4 text-indigo-600" />
                      </div>
                    </div>

                    <div v-if="filteredManagerOptions.length === 0" class="px-3 py-2 text-sm text-gray-500 text-center">
                      No managers found
                    </div>
                  </div>
                </div>
                
                <p v-if="form.errors.manager_id" class="mt-1 text-sm text-red-600">{{ form.errors.manager_id }}</p>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <button
              type="button"
              @click="router.visit(route('projects.show', project.id))"
              class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              :disabled="form.processing"
            >
              <Icon name="arrow-left" class="w-4 h-4 mr-2" />
              Cancel
            </button>
            
            <div class="flex items-center space-x-3">
              <button
                type="button"
                @click="router.visit(route('projects.show', project.id))"
                class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                :disabled="form.processing"
              >
                <Icon name="eye" class="w-4 h-4 mr-2" />
                View Project
              </button>
              
              <button
                type="submit"
                :disabled="form.processing || !form.name"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg v-if="form.processing" class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <Icon v-else name="check" class="w-4 h-4 mr-2" />
                {{ form.processing ? 'Updating...' : 'Update Project' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { computed, watch, ref, onMounted, onUnmounted } from 'vue';
import { useForm, router } from '@inertiajs/vue3';
import { useNotifications } from '@/composables/useNotifications.js';
import { useDateUtils } from '@/composables/useDateUtils.js';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';
import Icon from '@/Components/Base/Icon.vue';
import DateInput from '@/Components/Base/DateInput.vue';

const props = defineProps({
  project: {
    type: Object,
    required: true
  },
  users: {
    type: Array,
    default: () => []
  },
  managers: {
    type: Array,
    default: () => []
  }
});

const { showNotification } = useNotifications();
const { formatDateForInput, formatDateForDisplay, isDateInPast, daysBetween } = useDateUtils();

// Team assignment reactive data
const showTeamMemberDropdown = ref(false);
const showManagerDropdown = ref(false);
const teamMemberSearch = ref('');
const managerSearch = ref('');

// Helper function to get duration text
const getDurationText = (startDate, endDate) => {
  if (!startDate || !endDate) return '';
  
  const days = daysBetween(startDate, endDate);
  
  if (days < 0) return 'Due date is before start date';
  if (days === 0) return 'Same day project';
  if (days === 1) return '1 day duration';
  if (days <= 7) return `${days} days duration`;
  if (days <= 30) return `${Math.round(days / 7)} weeks duration`;
  
  const months = Math.round(days / 30);
  return `${months} month${months > 1 ? 's' : ''} duration`;
};

// Progress helper functions
const getProgressStatusClasses = (progress) => {
  const value = parseInt(progress) || 0;
  if (value === 0) return 'bg-gray-400';
  if (value < 25) return 'bg-red-400';
  if (value < 50) return 'bg-yellow-400';
  if (value < 75) return 'bg-teal-400';
  if (value < 100) return 'bg-indigo-400';
  return 'bg-green-400';
};

const getProgressTextClasses = (progress) => {
  const value = parseInt(progress) || 0;
  if (value === 0) return 'text-gray-600';
  if (value < 25) return 'text-red-600';
  if (value < 50) return 'text-yellow-600';
  if (value < 75) return 'text-teal-600';
  if (value < 100) return 'text-indigo-600';
  return 'text-green-600';
};

const getProgressStatusText = (progress) => {
  const value = parseInt(progress) || 0;
  if (value === 0) return 'Not Started';
  if (value < 25) return 'Just Started';
  if (value < 50) return 'In Progress';
  if (value < 75) return 'Good Progress';
  if (value < 100) return 'Nearly Complete';
  return 'Completed';
};

const getProgressDescription = (progress) => {
  const value = parseInt(progress) || 0;
  if (value === 0) return 'Project not yet started';
  if (value < 25) return 'Early stages';
  if (value < 50) return 'Making steady progress';
  if (value < 75) return 'More than halfway done';
  if (value < 100) return 'Almost finished';
  return 'Project complete';
};

const handleProgressInput = (event) => {
  let value = parseInt(event.target.value) || 0;
  value = Math.max(0, Math.min(100, value));
  form.progress = value;
  form.clearErrors('progress');
};

const updateProgressFromClick = (event) => {
  if (form.processing) return;
  
  const rect = event.currentTarget.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const percentage = Math.round((clickX / rect.width) * 100);
  
  // Clamp between 0 and 100 and ensure it's a number
  form.progress = Math.max(0, Math.min(100, percentage));
  
  // Force reactivity update
  form.clearErrors('progress');
};

// Form setup
const form = useForm({
  name: props.project.name || '',
  description: props.project.description || '',
  client: props.project.client || '',
  status: props.project.status || 'planning',
  priority: props.project.priority || 'medium',
  budget: props.project.budget || '',
  start_date: formatDateForInput(props.project.start_date),
  due_date: formatDateForInput(props.project.due_date),
  progress: Number(props.project.progress) || 0,
  team_members: props.project.team_members?.map(member => member.id) || [],
  manager_id: props.project.manager_id || ''
});



// Simple watcher for initial form setup only
watch(() => props.project, (newProject) => {
  if (newProject) {
    // Update form data with project values (initial load only)
    form.name = newProject.name || '';
    form.description = newProject.description || '';
    form.client = newProject.client || '';
    form.status = newProject.status || 'planning';
    form.priority = newProject.priority || 'medium';
    form.budget = newProject.budget || '';
    form.start_date = formatDateForInput(newProject.start_date);
    form.due_date = formatDateForInput(newProject.due_date);
    form.progress = Number(newProject.progress) || 0;
    form.team_members = newProject.team_members?.map(member => member.id) || [];
    form.manager_id = newProject.manager_id || '';
    
    form.clearErrors();
  }
}, { immediate: true });

// Handle click outside to close dropdowns
onMounted(() => {
  document.addEventListener('click', closeDropdowns);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdowns);
});

// Computed properties
const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Projects', href: route('projects.index') },
  { label: props.project.name, href: route('projects.show', props.project.id) },
  { label: 'Edit', current: true }
]);

// Ensure progress is always a number for reactivity
const currentProgress = computed(() => {
  return Number(form.progress) || 0;
});

const headerActions = computed(() => [
  {
    id: 'view',
    label: 'View Project',
    icon: 'eye',
    variant: 'secondary',
    handler: () => router.visit(route('projects.show', props.project.id))
  }
]);

const formActions = computed(() => [
  {
    id: 'cancel',
    label: 'Cancel',
    variant: 'secondary',
    handler: () => router.visit(route('projects.show', props.project.id))
  },
  {
    id: 'save',
    label: 'Update Project',
    type: 'submit',
    variant: 'primary',
    loadingLabel: 'Updating...',
    disabled: !form.name
  }
]);

const statusOptions = computed(() => [
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
]);

const priorityOptions = computed(() => [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' }
]);

const teamMemberOptions = computed(() => 
  props.users.map(user => ({
    value: user.id,
    label: user.name,
    description: user.email
  }))
);

const managerOptions = computed(() => 
  props.managers.map(manager => ({
    value: manager.id,
    label: manager.name,
    description: manager.email
  }))
);

// Enhanced team assignment computed properties
const selectedTeamMembers = computed(() => 
  teamMemberOptions.value.filter(option => 
    form.team_members.includes(option.value)
  )
);

const selectedManager = computed(() => 
  managerOptions.value.find(option => option.value === form.manager_id) || null
);

const filteredTeamMemberOptions = computed(() => {
  if (!teamMemberSearch.value) return teamMemberOptions.value;
  
  const search = teamMemberSearch.value.toLowerCase();
  return teamMemberOptions.value.filter(option =>
    option.label.toLowerCase().includes(search) ||
    option.description.toLowerCase().includes(search)
  );
});

const filteredManagerOptions = computed(() => {
  if (!managerSearch.value) return managerOptions.value;
  
  const search = managerSearch.value.toLowerCase();
  return managerOptions.value.filter(option =>
    option.label.toLowerCase().includes(search) ||
    option.description.toLowerCase().includes(search)
  );
});

// Status helper functions
const getStatusBannerClasses = (status) => {
  const statusClasses = {
    planning: 'bg-teal-50 border-teal-400 text-teal-800',
    active: 'bg-green-50 border-green-400 text-green-800',
    on_hold: 'bg-yellow-50 border-yellow-400 text-yellow-800',
    completed: 'bg-indigo-50 border-indigo-400 text-indigo-800',
    cancelled: 'bg-red-50 border-red-400 text-red-800'
  };
  
  return statusClasses[status] || statusClasses.planning;
};

const getStatusIcon = (status) => {
  const statusIcons = {
    planning: 'clock',
    active: 'play',
    on_hold: 'pause',
    completed: 'check-circle',
    cancelled: 'x-circle'
  };
  
  return statusIcons[status] || 'clock';
};

const getStatusLabel = (status) => {
  const statusLabels = {
    planning: 'Planning',
    active: 'Active',
    on_hold: 'On Hold',
    completed: 'Completed',
    cancelled: 'Cancelled'
  };
  
  return statusLabels[status] || 'Unknown';
};

const getStatusDescription = (status) => {
  const statusDescriptions = {
    planning: 'Project is in the planning phase',
    active: 'Project is currently active and in progress',
    on_hold: 'Project has been temporarily paused',
    completed: 'Project has been successfully completed',
    cancelled: 'Project has been cancelled'
  };
  
  return statusDescriptions[status] || 'Status information not available';
};

// Event handlers
const handleHeaderAction = (actionId) => {
  const action = headerActions.value.find(a => a.id === actionId);
  if (action && action.handler) {
    action.handler();
  }
};

// Team assignment methods
const toggleTeamMemberDropdown = (event) => {
  event.stopPropagation();
  showTeamMemberDropdown.value = !showTeamMemberDropdown.value;
  if (showTeamMemberDropdown.value) {
    showManagerDropdown.value = false;
    teamMemberSearch.value = '';
  }
};

const toggleManagerDropdown = (event) => {
  event.stopPropagation();
  showManagerDropdown.value = !showManagerDropdown.value;
  if (showManagerDropdown.value) {
    showTeamMemberDropdown.value = false;
    managerSearch.value = '';
  }
};

const isTeamMemberSelected = (memberId) => {
  return form.team_members.includes(memberId);
};

const toggleTeamMember = (member) => {
  const index = form.team_members.indexOf(member.value);
  if (index > -1) {
    form.team_members.splice(index, 1);
  } else {
    form.team_members.push(member.value);
  }
  form.clearErrors('team_members');
};

const removeTeamMember = (memberId) => {
  const index = form.team_members.indexOf(memberId);
  if (index > -1) {
    form.team_members.splice(index, 1);
  }
  form.clearErrors('team_members');
};

const selectManager = (manager) => {
  form.manager_id = manager ? manager.value : '';
  showManagerDropdown.value = false;
  managerSearch.value = '';
  form.clearErrors('manager_id');
};

// Close dropdowns when clicking outside
const closeDropdowns = () => {
  showTeamMemberDropdown.value = false;
  showManagerDropdown.value = false;
  teamMemberSearch.value = '';
  managerSearch.value = '';
};

const handleSubmit = () => {
  // Ensure progress is a number before submission
  const progressValue = parseInt(form.progress) || 0;
  form.progress = progressValue;
  
  console.log('Submitting form with progress:', progressValue);
  
  form.put(route('projects.update', props.project.id), {
    onSuccess: () => {
      showNotification({
        type: 'success',
        title: 'Project Updated',
        message: 'Project has been updated successfully.'
      });
      
      // Redirect to project view page
      router.visit(route('projects.show', props.project.id));
    },
    onError: (errors) => {
      console.log('Form submission errors:', errors);
      showNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Please check the form for errors and try again.'
      });
    }
  });
};
</script>