<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Competency Details"
      :subtitle="competency.name"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >
      <!-- Success Message -->
      <div v-if="$page.props.flash?.success" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <p class="text-sm text-green-800">{{ $page.props.flash.success }}</p>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="$page.props.flash?.error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <p class="text-sm text-red-800">{{ $page.props.flash.error }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Competency Overview -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-medium text-gray-900">Competency Overview</h3>
            </div>
            <div class="p-6">
              <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt class="text-sm font-medium text-gray-500">Name</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ competency.name }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Category</dt>
                  <dd class="mt-1">
                    <span v-if="competency.category" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                      {{ competency.category }}
                    </span>
                    <span v-else class="text-sm text-gray-400">No category</span>
                  </dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Weight</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ competency.weight || 'N/A' }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Department</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ competency.department?.name || 'All Departments' }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Status</dt>
                  <dd class="mt-1">
                    <span :class="competency.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                      {{ competency.is_active ? 'Active' : 'Inactive' }}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Created</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ formatDate(competency.created_at) }}</dd>
                </div>
              </dl>
              
              <div v-if="competency.description" class="mt-6">
                <dt class="text-sm font-medium text-gray-500 mb-2">Description</dt>
                <dd class="text-sm text-gray-900 leading-relaxed">{{ competency.description }}</dd>
              </div>
            </div>
          </div>

          <!-- Assessment Statistics -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-medium text-gray-900">Assessment Statistics</h3>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div class="text-center">
                  <div class="text-2xl font-bold text-gray-900">{{ stats.total_assessments || 0 }}</div>
                  <div class="text-sm text-gray-500">Total Assessments</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-teal-600">{{ stats.average_rating || 'N/A' }}</div>
                  <div class="text-sm text-gray-500">Average Rating</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-green-600">{{ stats.completion_rate || 0 }}%</div>
                  <div class="text-sm text-gray-500">Completion Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Quick Actions -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-medium text-gray-900">Quick Actions</h3>
            </div>
            <div class="p-6 space-y-3">
              <Link
                :href="route('competencies.edit', competency.id)"
                class="w-full inline-flex items-center justify-center px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                <PencilIcon class="w-4 h-4 mr-2" />
                Edit Competency
              </Link>
              
              <button
                @click="duplicateCompetency"
                class="w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <DocumentDuplicateIcon class="w-4 h-4 mr-2" />
                Duplicate Competency
              </button>
              
              <button
                @click="toggleStatus"
                :class="competency.is_active ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500' : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'"
                class="w-full inline-flex items-center justify-center px-4 py-2 text-white text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                <component :is="competency.is_active ? XMarkIcon : CheckIcon" class="w-4 h-4 mr-2" />
                {{ competency.is_active ? 'Deactivate' : 'Activate' }}
              </button>
            </div>
          </div>

          <!-- Usage Information -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-medium text-gray-900">Usage Information</h3>
            </div>
            <div class="p-6">
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-500">Assessments Created</span>
                  <span class="text-sm font-medium text-gray-900">{{ stats.total_assessments || 0 }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-500">Last Assessment</span>
                  <span class="text-sm font-medium text-gray-900">{{ stats.last_assessment_date || 'Never' }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-500">Departments Using</span>
                  <span class="text-sm font-medium text-gray-900">{{ stats.departments_count || 0 }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { computed } from 'vue';
import { router, Link } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PageLayout from '@/Components/Layout/PageLayout.vue';
import {
  ArrowLeftIcon,
  PencilIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  competency: {
    type: Object,
    required: true
  },
  stats: {
    type: Object,
    default: () => ({})
  }
});

// Computed properties for PageLayout
const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Competency Framework', href: route('competencies.index') },
  { label: props.competency.name, href: null }
]);

const headerActions = computed(() => [
  {
    label: 'Back to Framework',
    href: route('competencies.index'),
    icon: ArrowLeftIcon,
    variant: 'secondary'
  },
  {
    label: 'Edit Competency',
    href: route('competencies.edit', props.competency.id),
    icon: PencilIcon,
    variant: 'primary'
  }
]);

// Methods
const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const duplicateCompetency = () => {
  if (confirm(`Are you sure you want to duplicate "${props.competency.name}"?`)) {
    router.post(route('competencies.duplicate', props.competency.id), {}, {
      onSuccess: () => {
        router.visit(route('competencies.index'));
      }
    });
  }
};

const toggleStatus = () => {
  const action = props.competency.is_active ? 'deactivate' : 'activate';
  if (confirm(`Are you sure you want to ${action} "${props.competency.name}"?`)) {
    router.post(route('competencies.toggle-status', props.competency.id), {}, {
      onSuccess: () => {
        router.reload();
      }
    });
  }
};
</script>
